import os
import uuid
import json
from typing import Optional

from fastapi import FastAPI, Request, File, UploadFile, Header, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import requests
import psycopg2
from psycopg2.extras import RealDictCursor
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Vite dev proxy uses path prefix /auth-gateway; strip it using middleware
@app.middleware("http")
async def strip_auth_gateway_prefix(request: Request, call_next):
    path = request.url.path
    prefix = "/auth-gateway"
    if path.startswith(prefix + "/"):
        request.scope["path"] = path[len(prefix):]
    elif path == prefix:
        request.scope["path"] = "/"
    response = await call_next(request)
    return response


app.config = {"SECRET_KEY": os.environ.get("AUTH_GATEWAY_SECRET", "dev-secret-change-me")}
DB_URL = os.environ.get("DATABASE_URL")

def get_db():
    if not DB_URL:
        return None
    return psycopg2.connect(DB_URL, cursor_factory=RealDictCursor)

def get_user_from_db(username):
    db = get_db()
    if not db:
        return USERS.get(username)
    try:
        with db.cursor() as cur:
            cur.execute("SELECT password_hash as password, role FROM workers WHERE username = %s LIMIT 1", (username,))
            user = cur.fetchone()
            if user: return user
            cur.execute("SELECT password_hash as password, role FROM government_admins WHERE username = %s LIMIT 1", (username,))
            return cur.fetchone()
    finally:
        db.close()

def add_user_to_db(username, password, role):
    db = get_db()
    if not db:
        USERS[username] = {"password": password, "role": role}
        return
    try:
        with db.cursor() as cur:
            if role == "worker":
                cur.execute("INSERT INTO workers (username, password_hash, role) VALUES (%s, %s, %s)", (username, password, role))
            else:
                cur.execute("INSERT INTO government_admins (username, password_hash, role) VALUES (%s, %s, %s)", (username, password, role))
        db.commit()
    finally:
        db.close()

def log_screening(username, role, target_url, sent_files):
    db = get_db()
    if not db: return
    try:
        with db.cursor() as cur:
            cur.execute("""
                INSERT INTO screening_logs 
                (performed_by_username, performed_by_role, ai_endpoint_used, face_image_provided, front_image_provided, back_image_provided)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (username, role, target_url, 
                  "face" in sent_files, "front" in sent_files, "back" in sent_files))
        db.commit()
    except Exception as e:
        print("DB Log Error:", e)
    finally:
        db.close()

# ─── Demo in‑memory user store ─────────────────────────────────────────────────
USERS = {
    "worker1": {
        "password": "workerpass",
        "role": "worker",
    },
    "gov_admin": {
        "password": "adminpass",
        "role": "government_admin",
    },
}

ACTIVE_TOKENS = {}
MEM_REPORTS = []

def create_token(username: str, role: str) -> str:
    token = uuid.uuid4().hex
    ACTIVE_TOKENS[token] = {"username": username, "role": role}
    return token

def get_token_payload(token: str):
    return ACTIVE_TOKENS.get(token)

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header"
        )
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header"
        )
    token = parts[1]
    payload = get_token_payload(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    return payload

def require_role(*allowed_roles):
    async def dependency(current_user: dict = Depends(get_current_user)):
        role = current_user.get("role")
        if allowed_roles and role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"error": "Forbidden: insufficient role", "role": role}
            )
        return current_user
    return dependency

def ensure_reports_table():
    db = get_db()
    if not db:
        return
    try:
        with db.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS generated_reports (
                    id UUID PRIMARY KEY,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    performed_by_username TEXT,
                    performed_by_role TEXT,
                    patient_input JSONB,
                    report_result JSONB
                )
                """
            )
        db.commit()
    except Exception as e:
        print("DB Reports Table Error:", e)
    finally:
        db.close()

def save_generated_report(username, role, input_payload, result_payload, client_time=None):
    report_id = uuid.uuid4().hex
    report_row = {
        "id": report_id,
        "createdAtUtc": None,
        "performedByUsername": username,
        "performedByRole": role,
        "input": input_payload or {},
        "result": result_payload or {},
    }

    db = get_db()
    if not db:
        report_row["createdAtUtc"] = client_time or ""
        MEM_REPORTS.append(report_row)
        return report_row

    try:
        with db.cursor() as cur:
            cur.execute(
                """
                INSERT INTO generated_reports
                (id, performed_by_username, performed_by_role, patient_input, report_result)
                VALUES (%s, %s, %s, %s::jsonb, %s::jsonb)
                RETURNING created_at
                """,
                (report_id, username, role, json.dumps(input_payload or {}), json.dumps(result_payload or {})),
            )
            created = cur.fetchone()
            report_row["createdAtUtc"] = created["created_at"].isoformat() if created and created.get("created_at") else None
        db.commit()
    except Exception as e:
        print("DB Save Report Error:", e)
        report_row["createdAtUtc"] = client_time or ""
        MEM_REPORTS.append(report_row)
    finally:
        db.close()

    return report_row

def list_generated_reports(limit=20):
    db = get_db()
    if not db:
        rows = list(MEM_REPORTS)
        rows.sort(key=lambda r: str(r.get("createdAtUtc", "")), reverse=True)
        return rows[:limit]

    out = []
    try:
        with db.cursor() as cur:
            cur.execute(
                """
                SELECT id, created_at, performed_by_username, performed_by_role, patient_input, report_result
                FROM generated_reports
                ORDER BY created_at DESC
                LIMIT %s
                """,
                (limit,),
            )
            rows = cur.fetchall() or []
            for r in rows:
                out.append(
                    {
                        "id": str(r.get("id")),
                        "createdAtUtc": r.get("created_at").isoformat() if r.get("created_at") else None,
                        "performedByUsername": r.get("performed_by_username"),
                        "performedByRole": r.get("performed_by_role"),
                        "input": r.get("patient_input") or {},
                        "result": r.get("report_result") or {},
                    }
                )
    except Exception as e:
        print("DB List Reports Error:", e)
    finally:
        db.close()
    return out

@app.post("/login")
async def login(request: Request):
    data = await request.get_json() if hasattr(request, 'get_json') else await request.json()
    username = data.get("username", "").strip()
    password = data.get("password", "")

    user = get_user_from_db(username)
    if not user or user.get("password") != password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    role = user["role"]
    token = create_token(username, role)
    return {"token": token, "role": role, "username": username}

@app.post("/signup", status_code=201)
async def signup(request: Request):
    data = await request.json()
    username = data.get("username", "").strip()
    password = data.get("password", "")
    role = data.get("role", "worker")

    if not username or len(username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters")
    if not password or len(password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters")
    if role not in {"worker", "government_admin"}:
        raise HTTPException(status_code=400, detail="Invalid role")
    if get_user_from_db(username):
        raise HTTPException(status_code=409, detail="Username already exists")

    add_user_to_db(username, password, role)
    token = create_token(username, role)
    return {"token": token, "role": role, "username": username}

@app.get("/whoami")
async def whoami(current_user: dict = Depends(require_role("worker", "government_admin"))):
    return {"user": current_user}

@app.post("/reports", status_code=201)
async def create_report(
    request: Request,
    x_client_time: Optional[str] = Header(None),
    current_user: dict = Depends(require_role("worker", "government_admin"))
):
    ensure_reports_table()
    payload = await request.json()
    row = save_generated_report(
        current_user.get("username", "unknown"),
        current_user.get("role", "unknown"),
        payload.get("input"),
        payload.get("result"),
        client_time=x_client_time
    )
    return {"ok": True, "report": row}

@app.get("/admin/reports")
async def admin_reports(
    limit: int = 20,
    current_user: dict = Depends(require_role("government_admin"))
):
    ensure_reports_table()
    limit = max(1, min(limit, 100))
    return {"reports": list_generated_reports(limit=limit)}

MODEL_SERVER_URL = os.environ.get("MODEL_SERVER_URL", "http://127.0.0.1:5000")
YOLO_SERVER_URL = os.environ.get("YOLO_SERVER_URL", "http://127.0.0.1:5001")

async def _forward_files(
    request: Request,
    target_url: str,
    face: Optional[UploadFile],
    front: Optional[UploadFile],
    back: Optional[UploadFile],
    username: str,
    role: str
):
    files = {}
    sent_files = []
    
    if face:
        files["face"] = (face.filename, await face.read(), face.content_type)
        sent_files.append("face")
    if front:
        files["front"] = (front.filename, await front.read(), front.content_type)
        sent_files.append("front")
    if back:
        files["back"] = (back.filename, await back.read(), back.content_type)
        sent_files.append("back")

    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    form_data = await request.form()
    data_payload = {}
    for k, v in form_data.items():
        if k not in ["face", "front", "back"]:
            data_payload[k] = v

    try:
        resp = requests.post(target_url, files=files, data=data_payload, timeout=120)
        log_screening(username, role, target_url, sent_files)
        return JSONResponse(content=resp.json(), status_code=resp.status_code)
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail={"error": "Upstream request failed", "details": str(exc)})

@app.post("/worker/predict")
async def worker_predict(
    request: Request,
    face: Optional[UploadFile] = File(None),
    front: Optional[UploadFile] = File(None),
    back: Optional[UploadFile] = File(None),
    current_user: dict = Depends(require_role("worker"))
):
    target = f"{MODEL_SERVER_URL.rstrip('/')}/predict"
    return await _forward_files(
        request, target, face, front, back,
        current_user.get("username", "unknown"),
        current_user.get("role", "unknown")
    )

@app.post("/worker/detect")
async def worker_detect(
    request: Request,
    face: Optional[UploadFile] = File(None),
    front: Optional[UploadFile] = File(None),
    back: Optional[UploadFile] = File(None),
    current_user: dict = Depends(require_role("worker"))
):
    base = YOLO_SERVER_URL or MODEL_SERVER_URL
    target = f"{base.rstrip('/')}/detect"
    return await _forward_files(
        request, target, face, front, back,
        current_user.get("username", "unknown"),
        current_user.get("role", "unknown")
    )

@app.post("/admin/detect")
async def admin_detect(
    request: Request,
    face: Optional[UploadFile] = File(None),
    front: Optional[UploadFile] = File(None),
    back: Optional[UploadFile] = File(None),
    current_user: dict = Depends(require_role("government_admin"))
):
    base = YOLO_SERVER_URL or MODEL_SERVER_URL
    target = f"{base.rstrip('/')}/detect"
    return await _forward_files(
        request, target, face, front, back,
        current_user.get("username", "unknown"),
        current_user.get("role", "unknown")
    )

@app.get("/admin/health")
async def admin_health(current_user: dict = Depends(require_role("government_admin"))):
    out = {}
    try:
        r1 = requests.get(f"{MODEL_SERVER_URL.rstrip('/')}/health", timeout=5)
        out["model_server"] = {"status_code": r1.status_code, "body": r1.json()}
    except Exception as exc:
        out["model_server"] = {"error": str(exc)}

    try:
        r2 = requests.get(f"{YOLO_SERVER_URL.rstrip('/')}/health", timeout=5)
        out["yolo_server"] = {"status_code": r2.status_code, "body": r2.json()}
    except Exception as exc:
        out["yolo_server"] = {"error": str(exc)}

    return out

@app.get("/health")
async def health():
    return {"status": "ok", "service": "auth_gateway"}

if __name__ == "__main__":
    port = int(os.environ.get("AUTH_GATEWAY_PORT", "5002"))
    uvicorn.run(app, host="0.0.0.0", port=port)

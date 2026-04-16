import os
import uuid
from functools import wraps

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests


"""
Auth + routing gateway for existing model servers.

IMPORTANT:
- This file is completely standalone and does NOT modify or import the
  existing model servers' Flask apps. It only forwards HTTP requests to
  them, so `server.py` and `yolo_server.py` remain unchanged.

RUN EXAMPLE (in a separate terminal):
    python auth_gateway.py

This assumes:
- `server.py` is running on http://localhost:5000
- `yolo_server.py` is running on http://localhost:5001
"""


app = Flask(__name__)
# Explicit dev origins help when the browser calls the API directly (not via Vite proxy).
CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    supports_credentials=False,
)

# Vite dev proxy uses path prefix /auth-gateway; if that request hits Flask directly (proxy off),
# strip the prefix so routes like /signup still match.
_AUTH_GATEWAY_PREFIX = "/auth-gateway"


@app.before_request
def _strip_auth_gateway_path_prefix():
    path = request.environ.get("PATH_INFO", "") or ""
    if path.startswith(_AUTH_GATEWAY_PREFIX + "/"):
        request.environ["PATH_INFO"] = path[len(_AUTH_GATEWAY_PREFIX) :]
    elif path == _AUTH_GATEWAY_PREFIX:
        request.environ["PATH_INFO"] = "/"

# In a real deployment, replace this with a proper secret and persistent storage.
app.config["SECRET_KEY"] = os.environ.get("AUTH_GATEWAY_SECRET", "dev-secret-change-me")


# ─── Demo in‑memory user store ─────────────────────────────────────────────────

# Very simple demo credentials for hackathon use.
# You can change usernames/passwords/roles here without touching other scripts.
USERS = {
    # Worker-level user: can call worker endpoints only
    "worker1": {
        "password": "workerpass",
        "role": "worker",
    },
    # Government admin: broader access
    "gov_admin": {
        "password": "adminpass",
        "role": "government_admin",
    },
}

# token -> {"username": ..., "role": ...}
ACTIVE_TOKENS = {}


def create_token(username: str, role: str) -> str:
    token = uuid.uuid4().hex
    ACTIVE_TOKENS[token] = {"username": username, "role": role}
    return token


def get_token_payload(token: str):
    return ACTIVE_TOKENS.get(token)


def require_role(*allowed_roles):
    """
    Decorator for protecting endpoints by role.
    Expects an Authorization header:  Authorization: Bearer <token>
    """

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get("Authorization", "")
            parts = auth_header.split()
            if len(parts) != 2 or parts[0].lower() != "bearer":
                return jsonify({"error": "Missing or invalid Authorization header"}), 401

            token = parts[1]
            payload = get_token_payload(token)
            if not payload:
                return jsonify({"error": "Invalid or expired token"}), 401

            role = payload.get("role")
            if allowed_roles and role not in allowed_roles:
                return jsonify({"error": "Forbidden: insufficient role", "role": role}), 403

            # Attach user context for downstream if needed
            request.user = payload  # type: ignore[attr-defined]
            return fn(*args, **kwargs)

        return wrapper

    return decorator


# ─── Auth endpoints ────────────────────────────────────────────────────────────


@app.route("/login", methods=["POST"])
def login():
    """
    Generic login endpoint.
    Body (JSON):
        { "username": "...", "password": "..." }

    Response:
        { "token": "<token>", "role": "<role>", "username": "<username>" }
    """

    data = request.get_json(silent=True) or {}
    username = data.get("username", "").strip()
    password = data.get("password", "")

    user = USERS.get(username)
    if not user or user.get("password") != password:
        return jsonify({"error": "Invalid credentials"}), 401

    role = user["role"]
    token = create_token(username, role)
    return jsonify({"token": token, "role": role, "username": username})


@app.route("/signup", methods=["POST"])
def signup():
    """
    Generic signup endpoint.
    Body (JSON):
        { "username": "...", "password": "...", "role": "worker|government_admin" }

    Response:
        { "token": "<token>", "role": "<role>", "username": "<username>" }
    """

    data = request.get_json(silent=True) or {}
    username = data.get("username", "").strip()
    password = data.get("password", "")
    role = data.get("role", "worker")

    if not username or len(username) < 3:
        return jsonify({"error": "Username must be at least 3 characters"}), 400
    if not password or len(password) < 4:
        return jsonify({"error": "Password must be at least 4 characters"}), 400
    if role not in {"worker", "government_admin"}:
        return jsonify({"error": "Invalid role"}), 400
    if username in USERS:
        return jsonify({"error": "Username already exists"}), 409

    USERS[username] = {"password": password, "role": role}
    token = create_token(username, role)
    return jsonify({"token": token, "role": role, "username": username}), 201


@app.route("/whoami", methods=["GET"])
@require_role("worker", "government_admin")
def whoami():
    payload = getattr(request, "user", {})
    return jsonify({"user": payload})


# ─── Worker-facing routes (restricted to role=worker) ─────────────────────────


MODEL_SERVER_URL = os.environ.get("MODEL_SERVER_URL", "http://127.0.0.1:5000")
YOLO_SERVER_URL = os.environ.get("YOLO_SERVER_URL", "http://127.0.0.1:5001")


def _forward_files(target_url: str, files_keys):
    """
    Helper: forward uploaded files to a downstream service.
    files_keys: iterable of keys to forward (e.g. ["face", "front", "back"])
    """
    files = {}
    for key in files_keys:
        if key in request.files:
            f = request.files[key]
            files[key] = (f.filename, f.stream, f.mimetype or "application/octet-stream")

    if not files:
        return jsonify({"error": "No files provided"}), 400

    try:
        resp = requests.post(target_url, files=files, timeout=120)
        return jsonify(resp.json()), resp.status_code
    except requests.RequestException as exc:
        return jsonify({"error": "Upstream request failed", "details": str(exc)}), 502


@app.route("/worker/predict", methods=["POST"])
@require_role("worker")
def worker_predict():
    """
    Worker endpoint that proxies to the existing /predict on the main model server.
    """

    target = f"{MODEL_SERVER_URL.rstrip('/')}/predict"
    return _forward_files(target, ["face", "front", "back"])


@app.route("/worker/detect", methods=["POST"])
@require_role("worker")
def worker_detect():
    """
    Worker endpoint that proxies to the existing /detect on the YOLO server
    (or the combined server if /detect is available on MODEL_SERVER_URL).
    """

    # Prefer YOLO server if configured, else fall back to model server
    base = YOLO_SERVER_URL or MODEL_SERVER_URL
    target = f"{base.rstrip('/')}/detect"
    return _forward_files(target, ["face", "front", "back"])


# ─── Government admin routes (restricted to role=government_admin) ────────────


@app.route("/admin/detect", methods=["POST"])
@require_role("government_admin")
def admin_detect():
    """
    Admin variant of detect (currently same behaviour as worker, but
    separated for future extensions like audit logging, extra metadata, etc.).
    """

    base = YOLO_SERVER_URL or MODEL_SERVER_URL
    target = f"{base.rstrip('/')}/detect"
    return _forward_files(target, ["face", "front", "back"])


@app.route("/admin/health", methods=["GET"])
@require_role("government_admin")
def admin_health():
    """
    Simple consolidated health endpoint so government admins can check both model servers.
    """

    out = {}
    try:
        r1 = requests.get(f"{MODEL_SERVER_URL.rstrip('/')}/health", timeout=5)
        out["model_server"] = {"status_code": r1.status_code, "body": r1.json()}
    except Exception as exc:  # noqa: BLE001
        out["model_server"] = {"error": str(exc)}

    try:
        r2 = requests.get(f"{YOLO_SERVER_URL.rstrip('/')}/health", timeout=5)
        out["yolo_server"] = {"status_code": r2.status_code, "body": r2.json()}
    except Exception as exc:  # noqa: BLE001
        out["yolo_server"] = {"error": str(exc)}

    return jsonify(out)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "auth_gateway"})


if __name__ == "__main__":
    port = int(os.environ.get("AUTH_GATEWAY_PORT", "5002"))
    app.run(host="0.0.0.0", port=port, debug=False)

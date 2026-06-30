# Integrated Malnutrition Screening Platform

An end-to-end, privacy-preserving web application for the screening and automated visual detection of child malnutrition. The system operates as a Progressive Web App (PWA) and React 19 application equipped with clinical calculation utilities entirely on the edge, coupled with a two-stage local AI backend combining TensorFlow, PyTorch, and YOLOv8 wrapped in an optimized FastAPI framework.

## 🌟 The 3-Layer Architecture

1. **Clinical Screening (Edge)**
   Calculates standardized Z-scores (WAZ, HAZ, WHZ, BAZ) exclusively inside the browser utilizing the official WHO LMS data parameters.
   
2. **Binary Classification AI (`server.py` | Port 5000)**
   A TensorFlow Keras ResNet18 model wrapped in a high-performance **FastAPI** backend that processes image sets (face, front, back) through a Haar Cascade preprocessing step, outputting a base prediction of HEALTHY or MALNOURISHED along with a Grad-CAM heatmap visualization.

3. **Sign-Level Verification AI (`yolo_server.py` | Port 5001)**
   A multi-stage PyTorch pipeline wrapped in a **FastAPI** backend. A YOLOv8 model detects localized signs (e.g., *visible_ribs*, *distended_belly*, *wasted_arms*), crops them, and passes them to a PyTorch ResNet18 model for clinical sign verification. It outputs bounding box overlays, confidence scores, and automatically determines Marasmus vs. Kwashiorkor severity.

4. **Security & Authorization Gateway (`auth_gateway.py` | Port 5002)**
   A consolidated **FastAPI** gateway that acts as a secure reverse proxy for the model servers. Integrates PostgreSQL (with in-memory fallbacks) for transaction auditing, request logging, and secure token-based user role verification (e.g., standard clinical workers vs. government administrators).

---

## 🚀 Setup & Installation

### 1. Requirements

- Python 3.10+
- Node.js (for the Vite React app)
- A modern web browser supporting IndexedDB and ES6 Modules

### 2. Dependency Installation

The backend contains both TensorFlow and PyTorch dependencies. To avoid OS-level CUDA process conflicts and bus errors on local (or CPU-only) devices, **PyTorch must be cleanly installed avoiding standard CUDA drivers**.

1. Create and activate a Virtual Environment.
   ```bash
   python -m venv venv
   source venv/bin/activate  # MacOS/Linux
   # or
   venv\Scripts\activate     # Windows PowerShell
   ```

2. Install dependencies (including FastAPI, Uvicorn, and python-multipart):
   ```bash
   pip install -r requirements.txt
   ```

3. Install CPU-only PyTorch separately:
   ```bash
   pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
   ```

---

## ⚙️ How to Run

Because TensorFlow and PyTorch are deliberately isolated to avoid conflict, the application utilizes separate processes. You can start them inline using python or direct uvicorn commands.

### Terminal 1 — Binary Classification API (TensorFlow on Port 5000)
```bash
source venv/bin/activate
python server.py
# Alternative: uvicorn server:app --host 0.0.0.0 --port 5000
```

### Terminal 2 — Symptom Locating API (PyTorch on Port 5001)
```bash
source venv/bin/activate
python yolo_server.py
# Alternative: uvicorn yolo_server:app --host 0.0.0.0 --port 5001
```

### Terminal 3 — Secure Gateway (Auth/Routing on Port 5002)
```bash
source venv/bin/activate
python auth_gateway.py
# Alternative: uvicorn auth_gateway:app --host 0.0.0.0 --port 5002
```

### Terminal 4 — Frontend Options
You can run the Vite React app or launch the static PWA server:

* **Option A: React 19 Frontend (Recommended)**
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
  *Open http://localhost:5173 (or as prompted by Vite) in your browser.*

* **Option B: Pure HTML5/ES6 Static PWA**
  ```bash
  cd malnutrition-screening
  python -m http.server 8000
  ```
  *Open http://localhost:8000 in your browser.*

---

## 📁 Repository Structure

### The Backends (AI Operations)
- `server.py`
  - Runs on port 5000. Handles `/predict` endpoint.
  - Loads the TensorFlow ResNet18 model, performs Haar Cascades face-crop logic, and generates Grad-CAM overlays using `tf.GradientTape`.
- `yolo_server.py`
  - Runs on port 5001. Handles `/detect` endpoint.
  - Loads YOLOv8 (`yolo_malnutrition.pt`) and ResNet18 (`resnet18_malnutrition.pth`). Handles localized bounding box detection and returns annotated images in real-time.
- `auth_gateway.py`
  - Runs on port 5002. Routes, authorizes, logs, and proxies requests to model backends.
- `model_metadata.json`
  - Decision threshold parameters and label matrices used by the TensorFlow binary classification model.
- `HOW_IT_WORKS.md`
  - In-depth theoretical writeup answering the "Why" and "How" of using LMS data fused with AI detections.

### The Models & Data
- `malnutrition_package/`
  - Contains `.pt`/`.pth` weights for the PyTorch-based detection and verification pipelines. Includes standard definitions to map classes (`visible_ribs`, `sunken_eyes`) to corresponding disease vectors (Marasmus vs. Kwashiorkor).
- `dataset_v4/`
  - Training dataset structure holding classification-based and symptom-annotated image files.
- `Untitled3.ipynb` & `yolo.py`
  - Colab notebook export and active scripts displaying history for how training epochs, loss functions, and architectural decisions (like creating the original PyTorch GradCAM hooks) were configured.

### The Frontends
- `frontend/`
  - React 19 application built with Vite, React Router, Recharts, and i18n support.
- `malnutrition-screening/`
  - A pure ES6 JavaScript Progressive Web App (PWA) stylized with an independently written dark-themed "shadcn" inspired CSS class-system.

---

### Security & Privacy

All images uploaded for AI diagnosis and anthropometric data input remain localized to the memory space. The backend APIs communicate solely over isolated pre-configured localhost ports (5000 / 5001 / 5002). No network requests leave the device, ensuring full localized HIPAA/CMAM compliance capabilities.

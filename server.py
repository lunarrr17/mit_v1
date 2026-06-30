import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import uvicorn
import tensorflow as tf
import numpy as np
import cv2, json, os, base64, io
import math

# ─── Keras 2/3 compatibility patch ────────────────────────────────────────────
from tensorflow.keras.layers import Layer, Dense, InputLayer
def patch_layer_init(original_init):
    def new_init(self, *args, **kwargs):
        kwargs.pop('quantization_config', None)
        if 'batch_shape' in kwargs and not hasattr(self, '_batch_input_shape'):
            kwargs['batch_input_shape'] = kwargs.pop('batch_shape')
        return original_init(self, *args, **kwargs)
    return new_init
Layer.__init__   = patch_layer_init(Layer.__init__)
Dense.__init__   = patch_layer_init(Dense.__init__)
InputLayer.__init__ = patch_layer_init(InputLayer.__init__)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

LMS_PATH = 'frontend/public/data/lms.json'
LMS_DATA = None

try:
    with open(LMS_PATH, 'r', encoding='utf-8') as f:
        LMS_DATA = json.load(f)
except Exception as e:
    print(f"[WARN] Could not load LMS data from {LMS_PATH}: {e}")


def _to_float(v):
    try:
        if v is None or str(v).strip() == '':
            return None
        return float(v)
    except Exception:
        return None


def _z_score(x, L, M, S):
    if L == 0:
        return math.log(x / M) / S
    return ((x / M) ** L - 1) / (L * S)


def _round2(v):
    if v is None:
        return None
    return round(float(v), 2)


def _interpolate_lms(lms, indicator, key_value, sex, key_name, age_band=None):
    if not lms or indicator not in lms:
        return None
    rows = lms.get(indicator, {}).get(sex, [])
    if not rows:
        return None

    filtered = []
    for r in rows:
        if age_band and r.get('ageBand') != age_band:
            continue
        if key_name not in r:
            continue
        try:
            _ = float(r[key_name])
            filtered.append(r)
        except Exception:
            continue

    if not filtered:
        return None

    filtered.sort(key=lambda x: float(x[key_name]))
    v = float(key_value)
    first = filtered[0]
    last = filtered[-1]

    if v <= float(first[key_name]):
        return {'L': float(first['L']), 'M': float(first['M']), 'S': float(first['S'])}
    if v >= float(last[key_name]):
        return {'L': float(last['L']), 'M': float(last['M']), 'S': float(last['S'])}

    lower = first
    upper = last
    for i in range(len(filtered) - 1):
        a = filtered[i]
        b = filtered[i + 1]
        av = float(a[key_name])
        bv = float(b[key_name])
        if av <= v <= bv:
            lower, upper = a, b
            break

    lk = float(lower[key_name])
    uk = float(upper[key_name])
    if uk == lk:
        return {'L': float(lower['L']), 'M': float(lower['M']), 'S': float(lower['S'])}

    def interp(a, b):
        return float(a) + (v - lk) * (float(b) - float(a)) / (uk - lk)

    return {
        'L': interp(lower['L'], upper['L']),
        'M': interp(lower['M'], upper['M']),
        'S': interp(lower['S'], upper['S']),
    }


def compute_z_scores_from_form(form):
    if LMS_DATA is None:
        return None

    age = _to_float(form.get('age'))
    weight = _to_float(form.get('weight'))
    height = _to_float(form.get('height'))
    sex_raw = (form.get('sex') or 'M').strip().upper()
    sex = 'F' if sex_raw == 'F' else 'M'

    if age is None or weight is None or height is None or weight <= 0 or height <= 0:
        return None

    waz = None
    if age <= 120:
        row = _interpolate_lms(LMS_DATA, 'waz', age, sex, 'age')
        if row:
            waz = _z_score(weight, row['L'], row['M'], row['S'])

    haz = None
    haz_row = _interpolate_lms(LMS_DATA, 'haz', age, sex, 'age')
    if haz_row:
        haz = _z_score(height, haz_row['L'], haz_row['M'], haz_row['S'])

    whz = None
    if age <= 60:
        measurement = height + 0.7 if age < 24 else height
        age_band = '0-2' if age < 24 else '2-5'
        whz_row = _interpolate_lms(LMS_DATA, 'whz', measurement, sex, 'height', age_band=age_band)
        if whz_row:
            whz = _z_score(weight, whz_row['L'], whz_row['M'], whz_row['S'])

    return {
        'waz': _round2(waz),
        'haz': _round2(haz),
        'whz': _round2(whz),
    }

# ─── 1. TF ResNet (existing /predict endpoint) ────────────────────────────────
MODEL_PATH = 'malnutrition-screening/model/malnutrition_resnet18.h5'
tf_model   = tf.keras.models.load_model(MODEL_PATH)
tf_meta    = json.load(open('model_metadata.json'))
THRESHOLD  = tf_meta['optimal_threshold']
CLASSES    = tf_meta['classes']
cascade    = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def preprocess(file_bytes, view):
    arr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if view == 'face':
        gray  = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = cascade.detectMultiScale(gray, 1.1, 4, minSize=(30,30))
        if len(faces) > 0:
            x,y,w,h = sorted(faces, key=lambda f:f[2]*f[3], reverse=True)[0]
            pad = int(max(w,h)*0.3)
            img = img[max(0,y-pad):y+h+pad, max(0,x-pad):x+w+pad]
    h,w  = img.shape[:2]
    side = max(h,w)
    c    = np.zeros((side,side,3), np.uint8)
    c[(side-h)//2:(side-h)//2+h, (side-w)//2:(side-w)//2+w] = img
    
    img_for_overlay = cv2.resize(c, (224, 224))
    
    g    = cv2.cvtColor(c, cv2.COLOR_BGR2GRAY)
    eq   = cv2.createCLAHE(2.0,(8,8)).apply(g)
    img3 = cv2.merge([eq,eq,eq])
    imgr = cv2.resize(img3,(224,224)).astype(np.float32)
    from tensorflow.keras.applications.resnet50 import preprocess_input
    tensor = np.expand_dims(preprocess_input(imgr), 0)
    return tensor, img_for_overlay

import matplotlib.cm as cm
def make_gradcam_heatmap(img_array, model, pred_index=None):
    last_conv_layer_name = None
    for layer in reversed(model.layers):
        try:
            if len(layer.output.shape) == 4:
                last_conv_layer_name = layer.name
                break
        except Exception:
            pass
    if last_conv_layer_name is None:
        return np.zeros((224, 224))
        
    grad_model = tf.keras.models.Model(
        inputs=[model.inputs], outputs=[model.get_layer(last_conv_layer_name).output, model.output]
    )
    with tf.GradientTape() as tape:
        last_conv_layer_output, preds = grad_model(img_array)
        if pred_index is None:
            pred_index = tf.argmax(preds[0])
        class_channel = preds[:, pred_index]
    grads = tape.gradient(class_channel, last_conv_layer_output)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    last_conv_layer_output = last_conv_layer_output[0]
    heatmap = last_conv_layer_output @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
    return heatmap.numpy()

def get_gradcam_base64(img_bgr, heatmap, alpha=0.4):
    heatmap = np.uint8(255 * heatmap)
    jet = cm.get_cmap("jet")
    jet_colors = jet(np.arange(256))[:, :3]
    jet_heatmap = (jet_colors[heatmap] * 255).astype(np.uint8)
    jet_heatmap = cv2.resize(jet_heatmap, (img_bgr.shape[1], img_bgr.shape[0]))
    superimposed_img = cv2.addWeighted(img_bgr, 1 - alpha, jet_heatmap, alpha, 0)
    _, buf = cv2.imencode('.jpg', superimposed_img, [cv2.IMWRITE_JPEG_QUALITY, 85])
    return base64.b64encode(buf).decode()

@app.post('/predict')
async def predict(
    face: Optional[UploadFile] = File(None),
    front: Optional[UploadFile] = File(None),
    back: Optional[UploadFile] = File(None),
    age: Optional[str] = Form(None),
    weight: Optional[str] = Form(None),
    height: Optional[str] = Form(None),
    sex: Optional[str] = Form(None),
    muac: Optional[str] = Form(None)
):
    print("[DEBUG] Predict endpoint reached")
    probs, details = [], []
    
    form_data = {
        'age': age,
        'weight': weight,
        'height': height,
        'sex': sex,
        'muac': muac
    }
    z_scores = compute_z_scores_from_form(form_data)
    
    views_files = {
        'face': face,
        'front': front,
        'back': back
    }
    
    for view, file in views_files.items():
        if file is None:
            continue
        content = await file.read()
        if not content:
            continue
            
        tensor, img_for_overlay = preprocess(content, view)
        prob   = float(tf_model.predict(tensor, verbose=0)[0][0])
        
        heatmap = make_gradcam_heatmap(tensor, tf_model, pred_index=None)
        heatmap_b64 = get_gradcam_base64(img_for_overlay, heatmap)
        
        probs.append(prob)
        details.append({
            'view': view, 
            'probability': round(prob,4),
            'label': CLASSES[int(prob >= THRESHOLD)],
            'gradcam_image': heatmap_b64
        })
        
    avg   = float(np.mean(probs)) if probs else 0.0
    label = CLASSES[int(avg >= THRESHOLD)] if probs else 'UNKNOWN'
    return {
        'final_label': label, 
        'average_probability': round(avg,4),
        'threshold': THRESHOLD, 
        'views': details, 
        'z_scores': z_scores
    }

@app.get('/health')
async def health():
    return {'status': 'ok'}

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=5000)
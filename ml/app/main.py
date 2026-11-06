import io
import threading
from pathlib import Path

import numpy as np
from ai_edge_litert.interpreter import Interpreter
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps, UnidentifiedImageError

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "waste_classifier.tflite"

# Urutan harus sama persis dengan saat training (lihat class_names.json)
CLASS_NAMES = ["Organic Waste", "Paper Waste", "Plastic Waste"]
IMG_SIZE = (224, 224)
MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB

app = FastAPI(
    title="Waste Classifier API",
    description="Klasifikasi gambar sampah: Organic, Paper, Plastic (MobileNetV2).",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

interpreter = Interpreter(model_path=str(MODEL_PATH))
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()[0]
output_details = interpreter.get_output_details()[0]
interpreter_lock = threading.Lock()  # interpreter TFLite tidak thread-safe


def preprocess(data: bytes) -> np.ndarray:
    try:
        img = Image.open(io.BytesIO(data))
        img = ImageOps.exif_transpose(img)  # foto HP sering punya rotasi EXIF
        img = img.convert("RGB").resize(IMG_SIZE, Image.BILINEAR)
    except (UnidentifiedImageError, OSError):
        raise HTTPException(status_code=400, detail="File bukan gambar yang valid.")
    # Model sudah punya layer Rescaling di dalamnya,
    # jadi input cukup piksel mentah 0-255 (jangan dibagi 255 lagi).
    return np.asarray(img, dtype=np.float32)[np.newaxis, ...]


def to_probabilities(raw: np.ndarray) -> np.ndarray:
    probs = raw.astype(np.float64)
    is_softmax = probs.min() >= 0 and probs.max() <= 1 and abs(probs.sum() - 1) < 1e-3
    if not is_softmax:
        e = np.exp(probs - probs.max())
        probs = e / e.sum()
    return probs


@app.get("/")
def health():
    return {"status": "ok", "classes": CLASS_NAMES}


@app.post("/predict")
def predict(file: UploadFile = File(...)):
    data = file.file.read(MAX_UPLOAD_BYTES + 1)
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Ukuran gambar maksimal 10 MB.")
    if not data:
        raise HTTPException(status_code=400, detail="File kosong.")

    x = preprocess(data)

    with interpreter_lock:
        interpreter.set_tensor(input_details["index"], x)
        interpreter.invoke()
        raw = interpreter.get_tensor(output_details["index"])[0].copy()

    probs = to_probabilities(raw)
    idx = int(np.argmax(probs))
    return {
        "label": CLASS_NAMES[idx],
        "confidence": round(float(probs[idx]), 4),
        "probabilities": {
            name: round(float(p), 4) for name, p in zip(CLASS_NAMES, probs)
        },
    }

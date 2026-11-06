"""REST API prediksi jenis sampah (FastAPI + TensorFlow/Keras)."""
import io
import json
import os
from contextlib import asynccontextmanager
from pathlib import Path

import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps, UnidentifiedImageError

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = Path(os.getenv("MODEL_PATH", BASE_DIR / "models" / "waste_classifier.keras"))
LABELS_PATH = Path(os.getenv("LABELS_PATH", BASE_DIR / "models" / "class_names.json"))
IMG_SIZE = (224, 224)
MAX_UPLOAD_BYTES = 8 * 1024 * 1024  # 8 MB

state: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Model dimuat sekali saat server menyala, bukan di setiap request.
    import tensorflow as tf

    if not MODEL_PATH.exists():
        raise RuntimeError(f"File model tidak ditemukan: {MODEL_PATH}")
    state["model"] = tf.keras.models.load_model(MODEL_PATH)
    state["labels"] = json.loads(LABELS_PATH.read_text(encoding="utf-8"))
    yield
    state.clear()


app = FastAPI(
    title="sment-app Waste Classification API",
    description="Mengklasifikasikan foto sampah menjadi Organic, Plastic, atau Paper Waste.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def preprocess(raw: bytes) -> np.ndarray:
    """Praproses sama persis dengan notebook: RGB, 224x224, nilai 0..255.
    Normalisasi ke -1..1 dilakukan di dalam model (lapisan Rescaling)."""
    try:
        img = Image.open(io.BytesIO(raw))
        img = ImageOps.exif_transpose(img)  # foto dari HP sering terputar lewat metadata EXIF
        img = img.convert("RGB").resize(IMG_SIZE, Image.BILINEAR)
    except (UnidentifiedImageError, OSError):
        raise HTTPException(status_code=400, detail="File bukan gambar yang valid.")
    return np.expand_dims(np.asarray(img, dtype="float32"), axis=0)


@app.get("/", include_in_schema=False)
def root():
    return {"service": app.title, "docs": "/docs", "health": "/health", "predict": "POST /predict"}


@app.get("/health", summary="Cek server hidup")
def health():
    return {"status": "ok", "model_loaded": "model" in state, "classes": state.get("labels", [])}


@app.post("/predict", summary="Prediksi jenis sampah dari gambar")
def predict(file: UploadFile = File(..., description="Foto sampah (JPG/PNG)")):
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File harus berupa gambar.")

    raw = file.file.read(MAX_UPLOAD_BYTES + 1)
    if len(raw) == 0:
        raise HTTPException(status_code=400, detail="File kosong.")
    if len(raw) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Ukuran gambar maksimal 8 MB.")

    batch = preprocess(raw)
    probs = state["model"](batch, training=False).numpy()[0]
    labels = state["labels"]
    best = int(probs.argmax())

    return {
        "label": labels[best],
        "confidence": round(float(probs[best]), 4),
        "probabilities": {labels[i]: round(float(p), 4) for i, p in enumerate(probs)},
    }
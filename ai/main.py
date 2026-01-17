from fastapi import FastAPI, UploadFile, File, HTTPException
import numpy as np
import cv2
from insightface.app import FaceAnalysis

app = FastAPI(title="Face Embed Service")

# ✅ insightface 0.2.1 không hỗ trợ providers=...
# ✅ ctx_id = -1 => CPU, ổn định trên Windows
face_app = FaceAnalysis(name="buffalo_l")
face_app.prepare(ctx_id=-1, det_size=(640, 640))


def read_upload_as_bgr(file: UploadFile) -> np.ndarray:
    data = file.file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")

    arr = np.frombuffer(data, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Cannot decode image")

    return img


@app.get("/")
def health():
    return {"ok": True}


@app.post("/embed")
def embed(file: UploadFile = File(...)):
    img = read_upload_as_bgr(file)

    faces = face_app.get(img)
    if not faces:
        raise HTTPException(status_code=400, detail="No face detected")

    # pick largest face
    face = max(
        faces,
        key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]),
    )

    emb = face.embedding.astype(np.float32)
    emb = emb / (np.linalg.norm(emb) + 1e-12)  # normalize for cosine

    return {"embedding": emb.tolist(), "dim": int(emb.shape[0])}

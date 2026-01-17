from flask import Flask, request, jsonify
import os
import base64
import numpy as np
import cv2

from face import detect_biggest_face  # dùng cascade + crop face ROI

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _decode_base64_image(image_base64: str):
    """
    Hỗ trợ:
    - raw base64
    - data:image/jpeg;base64,....
    """
    if not image_base64 or not isinstance(image_base64, str):
        return None

    # cắt prefix data url nếu có
    if "base64," in image_base64:
        image_base64 = image_base64.split("base64,", 1)[1]

    try:
        img_bytes = base64.b64decode(image_base64)
        arr = np.frombuffer(img_bytes, dtype=np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        return img
    except Exception:
        return None


def _make_simple_embedding(face_roi_gray: np.ndarray, size=32):
    """
    Embedding đơn giản nhưng hoạt động ổn:
    - resize face ROI về 32x32
    - flatten
    - chuẩn hoá L2 để cosine similarity chạy ổn
    """
    x = cv2.resize(face_roi_gray, (size, size), interpolation=cv2.INTER_AREA)
    x = x.astype(np.float32) / 255.0
    vec = x.flatten()

    # chuẩn hoá (tránh vector toàn 0)
    norm = float(np.linalg.norm(vec))
    if norm > 0:
        vec = vec / norm

    return vec.tolist()


@app.get("/health")
def health():
    return "OK", 200


@app.post("/embed")
def embed():
    """
    Backend gọi: POST { image_base64 }
    Trả: { embedding: [..] }
    """
    data = request.get_json(silent=True) or {}
    image_base64 = data.get("image_base64")

    img = _decode_base64_image(image_base64)
    if img is None:
        return jsonify({"ok": False, "error": "Invalid image_base64"}), 400

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    face_roi, face_box = detect_biggest_face(gray)
    if face_roi is None:
        return jsonify({"ok": False, "error": "No face detected"}), 422

    emb = _make_simple_embedding(face_roi, size=32)

    return jsonify({
        "ok": True,
        "embedding": emb,
        "dim": len(emb),
        "face_box": face_box
    })


# Backend của bạn gọi:
# axios.delete(`${FLASK_SERVER}/api/students/${id}/images`, { params: { avatar: filename } })
@app.delete("/api/students/<student_id>/images")
def delete_student_images(student_id):
    avatar = request.args.get("avatar", "")
    avatar = os.path.basename(avatar)  # chống path traversal

    removed = []

    if avatar:
        fp = os.path.join(UPLOAD_DIR, avatar)
        if os.path.isfile(fp):
            try:
                os.remove(fp)
                removed.append(fp)
            except Exception:
                pass

    return jsonify({"ok": True, "student_id": student_id, "removed": removed})


if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", "5001"))
    app.run(host="0.0.0.0", port=port, debug=False)

import os
import cv2

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATASET_DIR = os.path.join(BASE_DIR, "dataset")
os.makedirs(DATASET_DIR, exist_ok=True)

MODEL_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODEL_DIR, exist_ok=True)

MODEL_PATH = os.path.join(MODEL_DIR, "lbph_model.yml")
LABELS_PATH = os.path.join(MODEL_DIR, "labels.txt")

# ✅ đảm bảo file này thật sự tồn tại trong flask_server/
CASCADE_PATH = os.path.join(BASE_DIR, "haarcascade_frontalface_default.xml")


def ensure_cascade_ok():
    if not os.path.isfile(CASCADE_PATH):
        raise RuntimeError(
            "❌ Thiếu file haarcascade_frontalface_default.xml. "
            "Hãy đặt file này cùng thư mục với face.py"
        )
    cascade = cv2.CascadeClassifier(CASCADE_PATH)
    if cascade.empty():
        raise RuntimeError("❌ Không load được haarcascade_frontalface_default.xml (file hỏng hoặc sai path).")
    return cascade


def detect_biggest_face(gray):
    cascade = ensure_cascade_ok()
    faces = cascade.detectMultiScale(
        gray,
        scaleFactor=1.2,
        minNeighbors=5,
        minSize=(80, 80),
    )
    if len(faces) == 0:
        return None, None

    x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
    roi = gray[y:y + h, x:x + w]
    roi = cv2.resize(roi, (200, 200))
    return roi, (x, y, w, h)


def is_trained():
    return os.path.isfile(MODEL_PATH) and os.path.isfile(LABELS_PATH)


def load_lbph_model():
    """
    Trả về (recognizer, label_to_student_id)
    Nếu chưa train -> (None, None)
    """
    if not is_trained():
        return None, None

    # LBPH cần opencv-contrib-python
    if not hasattr(cv2, "face"):
        raise RuntimeError(
            "❌ cv2.face không tồn tại. Bạn đang thiếu opencv-contrib-python.\n"
            "Cài bằng: pip install opencv-contrib-python"
        )

    recognizer = cv2.face.LBPHFaceRecognizer_create()
    recognizer.read(MODEL_PATH)

    label_to_student_id = {}
    with open(LABELS_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            label_str, sid = line.split(",", 1)
            label_to_student_id[int(label_str)] = sid.strip()

    return recognizer, label_to_student_id

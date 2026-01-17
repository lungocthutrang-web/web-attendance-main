import os
import cv2
import numpy as np

from face import (
    DATASET_DIR,
    MODEL_PATH,
    LABELS_PATH,
    detect_biggest_face,
    ensure_cascade_ok,
)

def main():
    ensure_cascade_ok()

    # LBPH cần opencv-contrib-python
    if not hasattr(cv2, "face"):
        print("❌ Thiếu cv2.face (opencv-contrib-python).")
        print("➡️ Cài: pip install opencv-contrib-python")
        return

    images = []
    labels = []

    label_map = {}
    label_to_student = {}
    current_label = 0

    total_files = 0
    total_used = 0

    for student_id in sorted(os.listdir(DATASET_DIR)):
        student_path = os.path.join(DATASET_DIR, student_id)
        if not os.path.isdir(student_path):
            continue

        if student_id not in label_map:
            label_map[student_id] = current_label
            label_to_student[current_label] = student_id
            current_label += 1

        label = label_map[student_id]

        for fn in os.listdir(student_path):
            fp = os.path.join(student_path, fn)
            if not os.path.isfile(fp):
                continue

            total_files += 1
            img = cv2.imread(fp)
            if img is None:
                continue

            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            face_roi, _ = detect_biggest_face(gray)
            if face_roi is None:
                print(f"Skip (no face): {fp}")
                continue

            images.append(face_roi)
            labels.append(label)
            total_used += 1

    if len(images) < 2:
        print("❌ Dataset quá ít. Cần tối thiểu 2 ảnh có mặt để train.")
        print(f"📌 Tổng ảnh: {total_files} | Ảnh dùng được: {total_used}")
        return

    recognizer = cv2.face.LBPHFaceRecognizer_create()
    recognizer.train(images, np.array(labels))
    recognizer.write(MODEL_PATH)

    with open(LABELS_PATH, "w", encoding="utf-8") as f:
        for lbl, sid in label_to_student.items():
            f.write(f"{lbl},{sid}\n")

    print("✅ Train xong!")
    print(f"📌 Tổng ảnh: {total_files} | Ảnh dùng được: {total_used}")
    print("Model:", MODEL_PATH)
    print("Labels:", LABELS_PATH)

if __name__ == "__main__":
    main()

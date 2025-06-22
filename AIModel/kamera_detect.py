from ultralytics import YOLO
import cv2
from collections import Counter
import json

# Load model
model = YOLO("best.pt")

# Buka kamera
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Tidak bisa membuka kamera")
    exit()

print("Tekan 's' untuk take photo, 'q' untuk keluar.")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Tampilkan preview kamera
    cv2.imshow("Preview Kamera", frame)

    key = cv2.waitKey(1) & 0xFF

    if key == ord("s"):
        # Ambil frame saat tombol ditekan
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = model.predict(rgb_frame, conf=0.5)

        label_names = model.names
        detections = []

        for r in results:
            boxes = r.boxes.xyxy.cpu().numpy()
            labels = r.boxes.cls.cpu().numpy()
            scores = r.boxes.conf.cpu().numpy()

            for box, label, score in zip(boxes, labels, scores):
                if score < 0.60:
                    continue

                x1, y1, x2, y2 = map(int, box)
                label_name = label_names[int(label)]
                detections.append(label_name)

                # Gambar kotak dan label
                text = f"{label_name} ({score:.2f})"
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                cv2.putText(frame, text, (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

        # Hitung jumlah produk
        product_counts = dict(Counter(detections))
        total = sum(product_counts.values())

        # Simpan gambar
        cv2.imwrite("photo_detected.jpg", frame)
        print(f"📸 Gambar disimpan sebagai photo_detected.jpg")
        print(json.dumps({
            "amount": total,
            "products": product_counts
        }, indent=2))

    elif key == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()

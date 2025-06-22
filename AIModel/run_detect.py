from ultralytics import YOLO
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import json
from collections import Counter

# Load model
model = YOLO("best.pt")

# Buka gambar
image_path = "img2.jpg"
image = Image.open(image_path).convert("RGB")

# Prediksi
results = model.predict(image, conf=0.5)

# Ambil hasil deteksi
boxes = results[0].boxes.xyxy.cpu().numpy()
labels = results[0].boxes.cls.cpu().numpy()
scores = results[0].boxes.conf.cpu().numpy()
label_names = model.names

# Gambar kotak dan ambil deteksi di atas 0.60
draw = ImageDraw.Draw(image)
font = ImageFont.load_default()

filtered_labels = []
for box, label, score in zip(boxes, labels, scores):
    if score < 0.60:
        continue

    x1, y1, x2, y2 = box
    label_name = label_names[int(label)]
    label_text = f"{label_name} ({score:.2f})"

    draw.rectangle([x1, y1, x2, y2], outline="red", width=2)
    draw.text((x1, y1), label_text, fill="white", font=font)

    filtered_labels.append(label_name)

# Hitung jumlah masing-masing produk
product_counts = Counter(filtered_labels)

# Simpan gambar hasil
image.save("detected_result.png")

# Cetak hasil ke console dalam format JSON
output = {
    "amount": sum(product_counts.values()),
    "products": dict(product_counts)
}
print(json.dumps(output, indent=2))

from fastapi import FastAPI, UploadFile, File
from ultralytics import YOLO
from PIL import Image
import io
import cv2
import numpy as np

app = FastAPI()
model = YOLO("best.pt")  # path ke model kamu

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    results = model.predict(image, conf=0.5)
    boxes = results[0].boxes.xyxy.cpu().numpy()
    labels = results[0].boxes.cls.cpu().numpy()
    scores = results[0].boxes.conf.cpu().numpy()
    return {
        "detections": [
            {
                "box": box.tolist(),
                "label": int(label),
                "confidence": float(score)
            }
            for box, label, score in zip(boxes, labels, scores)
        ]
    }

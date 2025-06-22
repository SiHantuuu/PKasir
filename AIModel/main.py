from flask import Flask, request, jsonify, send_file
from ultralytics import YOLO
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import json
from collections import Counter
import io
import base64
import os
from werkzeug.utils import secure_filename
import uuid

app = Flask(__name__)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
UPLOAD_FOLDER = 'uploads'
RESULTS_FOLDER = 'results'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}

# Create directories if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)

# Load model once when starting the server
try:
    model = YOLO("best.pt")
    print("Model loaded successfully")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def process_image(image, confidence_threshold=0.5, detection_threshold=0.60):
    """Process image and return detection results"""
    if model is None:
        raise Exception("Model not loaded")

    # Convert to RGB if needed
    if image.mode != 'RGB':
        image = image.convert('RGB')

    # Predict
    results = model.predict(image, conf=confidence_threshold)

    # Extract detection results
    boxes = results[0].boxes.xyxy.cpu().numpy()
    labels = results[0].boxes.cls.cpu().numpy()
    scores = results[0].boxes.conf.cpu().numpy()
    label_names = model.names

    # Draw boxes and filter detections
    draw = ImageDraw.Draw(image)
    font = ImageFont.load_default()

    filtered_labels = []
    detections = []

    for box, label, score in zip(boxes, labels, scores):
        if score < detection_threshold:
            continue

        x1, y1, x2, y2 = box
        label_name = label_names[int(label)]
        label_text = f"{label_name} ({score:.2f})"

        # Draw rectangle and text
        draw.rectangle([x1, y1, x2, y2], outline="red", width=2)
        draw.text((x1, y1), label_text, fill="white", font=font)

        filtered_labels.append(label_name)
        detections.append({
            "label": label_name,
            "confidence": float(score),
            "bbox": [float(x1), float(y1), float(x2), float(y2)]
        })

    # Count products
    product_counts = Counter(filtered_labels)

    return image, product_counts, detections


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None
    })


@app.route('/detect', methods=['POST'])
def detect_objects():
    """Main detection endpoint"""
    try:
        # Check if model is loaded
        if model is None:
            return jsonify({"error": "Model not loaded"}), 500

        # Check if file is present
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        file = request.files['image']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "File type not allowed"}), 400

        # Get optional parameters
        conf_threshold = float(request.form.get('confidence_threshold', 0.5))
        det_threshold = float(request.form.get('detection_threshold', 0.60))
        save_result = request.form.get('save_result', 'false').lower() == 'true'

        # Open and process image
        image = Image.open(file.stream)
        processed_image, product_counts, detections = process_image(
            image, conf_threshold, det_threshold
        )

        # Prepare response
        response_data = {
            "amount": sum(product_counts.values()),
            "products": dict(product_counts),
            "detections": detections,
            "parameters": {
                "confidence_threshold": conf_threshold,
                "detection_threshold": det_threshold
            }
        }

        # Save result image if requested
        if save_result:
            result_id = str(uuid.uuid4())
            result_filename = f"result_{result_id}.png"
            result_path = os.path.join(RESULTS_FOLDER, result_filename)
            processed_image.save(result_path)
            response_data["result_image_id"] = result_id

        return jsonify(response_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/detect_base64', methods=['POST'])
def detect_objects_base64():
    """Detection endpoint for base64 encoded images"""
    try:
        if model is None:
            return jsonify({"error": "Model not loaded"}), 500

        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({"error": "No base64 image data provided"}), 400

        # Decode base64 image
        try:
            image_data = base64.b64decode(data['image'])
            image = Image.open(io.BytesIO(image_data))
        except Exception as e:
            return jsonify({"error": f"Invalid base64 image data: {str(e)}"}), 400

        # Get optional parameters
        conf_threshold = float(data.get('confidence_threshold', 0.5))
        det_threshold = float(data.get('detection_threshold', 0.60))

        # Process image
        processed_image, product_counts, detections = process_image(
            image, conf_threshold, det_threshold
        )

        # Prepare response
        response_data = {
            "amount": sum(product_counts.values()),
            "products": dict(product_counts),
            "detections": detections,
            "parameters": {
                "confidence_threshold": conf_threshold,
                "detection_threshold": det_threshold
            }
        }

        # Add base64 result image if requested
        if data.get('return_image', False):
            img_buffer = io.BytesIO()
            processed_image.save(img_buffer, format='PNG')
            img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
            response_data["result_image"] = img_base64

        return jsonify(response_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/result/<result_id>', methods=['GET'])
def get_result_image(result_id):
    """Get processed result image by ID"""
    try:
        result_filename = f"result_{result_id}.png"
        result_path = os.path.join(RESULTS_FOLDER, result_filename)

        if not os.path.exists(result_path):
            return jsonify({"error": "Result image not found"}), 404

        return send_file(result_path, mimetype='image/png')

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/model/info', methods=['GET'])
def model_info():
    """Get model information"""
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    try:
        return jsonify({
            "model_loaded": True,
            "class_names": model.names,
            "num_classes": len(model.names)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.errorhandler(413)
def too_large(e):
    return jsonify({"error": "File too large"}), 413


if __name__ == '__main__':
    print("Starting Object Detection API Server...")
    print("Available endpoints:")
    print("- GET  /health - Health check")
    print("- POST /detect - Detect objects (multipart/form-data)")
    print("- POST /detect_base64 - Detect objects (JSON with base64)")
    print("- GET  /result/<id> - Get result image")
    print("- GET  /model/info - Model information")

    app.run(debug=True, host='0.0.0.0', port=5000)
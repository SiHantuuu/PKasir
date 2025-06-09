const FormData = require("form-data");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Configuration - adjust these based on your Flask API setup
const FLASK_API_BASE_URL = process.env.FLASK_API_URL || "http://localhost:5000";
const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

class PredictController {
  /**
   * Handle image upload and object detection
   */
  async predictImage(request, h) {
    try {
      const { payload } = request;

      // Validate file upload
      if (!payload.image) {
        return h
          .response({
            success: false,
            message: "No image file provided",
          })
          .code(400);
      }

      const file = payload.image;
      const filename = `${Date.now()}_${file.hapi.filename}`;
      const filepath = path.join(UPLOAD_DIR, filename);

      // Save uploaded file temporarily
      const fileStream = fs.createWriteStream(filepath);
      file.pipe(fileStream);

      await new Promise((resolve, reject) => {
        fileStream.on("error", reject);
        fileStream.on("close", resolve);
      });

      // Prepare form data for Flask API
      const form = new FormData();
      form.append("image", fs.createReadStream(filepath));

      // Add optional parameters
      if (payload.confidence_threshold) {
        form.append("confidence_threshold", payload.confidence_threshold);
      }
      if (payload.detection_threshold) {
        form.append("detection_threshold", payload.detection_threshold);
      }
      if (payload.save_result) {
        form.append("save_result", payload.save_result);
      }

      // Send request to Flask API
      const response = await axios.post(`${FLASK_API_BASE_URL}/detect`, form, {
        headers: {
          ...form.getHeaders(),
        },
        timeout: 30000, // 30 seconds timeout
      });

      // Clean up temporary file
      fs.unlinkSync(filepath);

      return h
        .response({
          success: true,
          data: response.data,
          message: "Object detection completed successfully",
        })
        .code(200);
    } catch (error) {
      console.error("Error in predictImage:", error);

      // Clean up temporary file if it exists
      if (error.filepath && fs.existsSync(error.filepath)) {
        fs.unlinkSync(error.filepath);
      }

      if (error.response) {
        // Flask API returned an error
        return h
          .response({
            success: false,
            message: "Object detection failed",
            error: error.response.data,
          })
          .code(error.response.status);
      } else if (error.code === "ECONNREFUSED") {
        return h
          .response({
            success: false,
            message: "Object detection service is unavailable",
          })
          .code(503);
      } else {
        return h
          .response({
            success: false,
            message: "Internal server error",
            error: error.message,
          })
          .code(500);
      }
    }
  }

  /**
   * Handle base64 image detection
   */
  async predictBase64(request, h) {
    try {
      const { image, confidence_threshold, detection_threshold, return_image } =
        request.payload;

      if (!image) {
        return h
          .response({
            success: false,
            message: "No base64 image data provided",
          })
          .code(400);
      }

      const requestData = {
        image,
        confidence_threshold: confidence_threshold || 0.5,
        detection_threshold: detection_threshold || 0.6,
        return_image: return_image || false,
      };

      const response = await axios.post(
        `${FLASK_API_BASE_URL}/detect_base64`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      return h
        .response({
          success: true,
          data: response.data,
          message: "Object detection completed successfully",
        })
        .code(200);
    } catch (error) {
      console.error("Error in predictBase64:", error);

      if (error.response) {
        return h
          .response({
            success: false,
            message: "Object detection failed",
            error: error.response.data,
          })
          .code(error.response.status);
      } else if (error.code === "ECONNREFUSED") {
        return h
          .response({
            success: false,
            message: "Object detection service is unavailable",
          })
          .code(503);
      } else {
        return h
          .response({
            success: false,
            message: "Internal server error",
            error: error.message,
          })
          .code(500);
      }
    }
  }

  /**
   * Get result image by ID
   */
  async getResultImage(request, h) {
    try {
      const { id } = request.params;

      const response = await axios.get(`${FLASK_API_BASE_URL}/result/${id}`, {
        responseType: "stream",
        timeout: 10000,
      });

      return h
        .response(response.data)
        .type("image/png")
        .header(
          "Content-Disposition",
          `attachment; filename="result_${id}.png"`
        );
    } catch (error) {
      console.error("Error in getResultImage:", error);

      if (error.response && error.response.status === 404) {
        return h
          .response({
            success: false,
            message: "Result image not found",
          })
          .code(404);
      } else if (error.code === "ECONNREFUSED") {
        return h
          .response({
            success: false,
            message: "Object detection service is unavailable",
          })
          .code(503);
      } else {
        return h
          .response({
            success: false,
            message: "Failed to retrieve result image",
            error: error.message,
          })
          .code(500);
      }
    }
  }

  /**
   * Check Flask API health status
   */
  async checkHealth(request, h) {
    try {
      const response = await axios.get(`${FLASK_API_BASE_URL}/health`, {
        timeout: 5000,
      });

      return h
        .response({
          success: true,
          data: response.data,
          message: "Health check completed",
        })
        .code(200);
    } catch (error) {
      console.error("Error in checkHealth:", error);

      return h
        .response({
          success: false,
          message: "Object detection service is unavailable",
          error:
            error.code === "ECONNREFUSED"
              ? "Service not running"
              : error.message,
        })
        .code(503);
    }
  }

  /**
   * Get model information
   */
  async getModelInfo(request, h) {
    try {
      const response = await axios.get(`${FLASK_API_BASE_URL}/model/info`, {
        timeout: 5000,
      });

      return h
        .response({
          success: true,
          data: response.data,
          message: "Model information retrieved successfully",
        })
        .code(200);
    } catch (error) {
      console.error("Error in getModelInfo:", error);

      if (error.response) {
        return h
          .response({
            success: false,
            message: "Failed to get model information",
            error: error.response.data,
          })
          .code(error.response.status);
      } else if (error.code === "ECONNREFUSED") {
        return h
          .response({
            success: false,
            message: "Object detection service is unavailable",
          })
          .code(503);
      } else {
        return h
          .response({
            success: false,
            message: "Internal server error",
            error: error.message,
          })
          .code(500);
      }
    }
  }

  /**
   * Batch prediction for multiple images
   */
  async predictBatch(request, h) {
    try {
      const { payload } = request;

      if (
        !payload.images ||
        !Array.isArray(payload.images) ||
        payload.images.length === 0
      ) {
        return h
          .response({
            success: false,
            message: "No images provided or invalid format",
          })
          .code(400);
      }

      const results = [];
      const errors = [];

      for (let i = 0; i < payload.images.length; i++) {
        try {
          const imageData = payload.images[i];

          const requestData = {
            image: imageData.image,
            confidence_threshold:
              imageData.confidence_threshold ||
              payload.confidence_threshold ||
              0.5,
            detection_threshold:
              imageData.detection_threshold ||
              payload.detection_threshold ||
              0.6,
            return_image:
              imageData.return_image || payload.return_image || false,
          };

          const response = await axios.post(
            `${FLASK_API_BASE_URL}/detect_base64`,
            requestData,
            {
              headers: {
                "Content-Type": "application/json",
              },
              timeout: 30000,
            }
          );

          results.push({
            index: i,
            success: true,
            data: response.data,
          });
        } catch (error) {
          errors.push({
            index: i,
            success: false,
            error: error.response ? error.response.data : error.message,
          });
        }
      }

      return h
        .response({
          success: true,
          results,
          errors,
          summary: {
            total: payload.images.length,
            successful: results.length,
            failed: errors.length,
          },
          message: "Batch prediction completed",
        })
        .code(200);
    } catch (error) {
      console.error("Error in predictBatch:", error);

      return h
        .response({
          success: false,
          message: "Batch prediction failed",
          error: error.message,
        })
        .code(500);
    }
  }
}

module.exports = new PredictController();

const Joi = require("joi");
const predictController = require("../controllers/predictController");

const predictRoutes = [
  {
    method: "POST",
    path: "/predict/image",
    handler: predictController.predictImage,
    options: {
      description: "Predict objects in uploaded image",
      tags: ["api", "prediction"],
      payload: {
        output: "stream",
        parse: true,
        multipart: true,
        maxBytes: 16 * 1024 * 1024, // 16MB
        allow: "multipart/form-data",
      },
      validate: {
        payload: Joi.object({
          image: Joi.any()
            .meta({ swaggerType: "file" })
            .required()
            .description("Image file to analyze"),
          confidence_threshold: Joi.number()
            .min(0)
            .max(1)
            .default(0.5)
            .optional()
            .description("Confidence threshold for predictions (0-1)"),
          detection_threshold: Joi.number()
            .min(0)
            .max(1)
            .default(0.6)
            .optional()
            .description("Detection threshold for filtering results (0-1)"),
          save_result: Joi.boolean()
            .default(false)
            .optional()
            .description("Save result image on server"),
        }),
      },
      response: {
        schema: Joi.object({
          success: Joi.boolean().required(),
          message: Joi.string().required(),
          data: Joi.object({
            amount: Joi.number().required(),
            products: Joi.object().required(),
            detections: Joi.array()
              .items(
                Joi.object({
                  label: Joi.string().required(),
                  confidence: Joi.number().required(),
                  bbox: Joi.array().items(Joi.number()).length(4).required(),
                })
              )
              .required(),
            parameters: Joi.object().required(),
            result_image_id: Joi.string().optional(),
          }).optional(),
          error: Joi.any().optional(),
        }),
      },
    },
  },
  {
    method: "POST",
    path: "/predict/base64",
    handler: predictController.predictBase64,
    options: {
      description: "Predict objects in base64 encoded image",
      tags: ["api", "prediction"],
      validate: {
        payload: Joi.object({
          image: Joi.string()
            .required()
            .description("Base64 encoded image data"),
          confidence_threshold: Joi.number()
            .min(0)
            .max(1)
            .default(0.5)
            .optional()
            .description("Confidence threshold for predictions (0-1)"),
          detection_threshold: Joi.number()
            .min(0)
            .max(1)
            .default(0.6)
            .optional()
            .description("Detection threshold for filtering results (0-1)"),
          return_image: Joi.boolean()
            .default(false)
            .optional()
            .description("Return processed image as base64"),
        }),
      },
      response: {
        schema: Joi.object({
          success: Joi.boolean().required(),
          message: Joi.string().required(),
          data: Joi.object({
            amount: Joi.number().required(),
            products: Joi.object().required(),
            detections: Joi.array()
              .items(
                Joi.object({
                  label: Joi.string().required(),
                  confidence: Joi.number().required(),
                  bbox: Joi.array().items(Joi.number()).length(4).required(),
                })
              )
              .required(),
            parameters: Joi.object().required(),
            result_image: Joi.string().optional(),
          }).optional(),
          error: Joi.any().optional(),
        }),
      },
    },
  },
  {
    method: "POST",
    path: "/predict/batch",
    handler: predictController.predictBatch,
    options: {
      description: "Batch prediction for multiple base64 images",
      tags: ["api", "prediction", "batch"],
      validate: {
        payload: Joi.object({
          images: Joi.array()
            .items(
              Joi.object({
                image: Joi.string().required(),
                confidence_threshold: Joi.number().min(0).max(1).optional(),
                detection_threshold: Joi.number().min(0).max(1).optional(),
                return_image: Joi.boolean().optional(),
              })
            )
            .min(1)
            .max(10) // Limit batch size
            .required()
            .description("Array of base64 images to process"),
          confidence_threshold: Joi.number()
            .min(0)
            .max(1)
            .default(0.5)
            .optional()
            .description("Default confidence threshold for all images"),
          detection_threshold: Joi.number()
            .min(0)
            .max(1)
            .default(0.6)
            .optional()
            .description("Default detection threshold for all images"),
          return_image: Joi.boolean()
            .default(false)
            .optional()
            .description("Default return image setting for all images"),
        }),
      },
      response: {
        schema: Joi.object({
          success: Joi.boolean().required(),
          message: Joi.string().required(),
          results: Joi.array()
            .items(
              Joi.object({
                index: Joi.number().required(),
                success: Joi.boolean().required(),
                data: Joi.object().optional(),
              })
            )
            .required(),
          errors: Joi.array()
            .items(
              Joi.object({
                index: Joi.number().required(),
                success: Joi.boolean().required(),
                error: Joi.any().required(),
              })
            )
            .required(),
          summary: Joi.object({
            total: Joi.number().required(),
            successful: Joi.number().required(),
            failed: Joi.number().required(),
          }).required(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/predict/result/{id}",
    handler: predictController.getResultImage,
    options: {
      description: "Get processed result image by ID",
      tags: ["api", "prediction", "result"],
      validate: {
        params: Joi.object({
          id: Joi.string().required().description("Result image ID"),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/predict/health",
    handler: predictController.checkHealth,
    options: {
      description: "Check Flask API health status",
      tags: ["api", "health"],
      response: {
        schema: Joi.object({
          success: Joi.boolean().required(),
          message: Joi.string().required(),
          data: Joi.object({
            status: Joi.string().required(),
            model_loaded: Joi.boolean().required(),
          }).optional(),
          error: Joi.any().optional(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/predict/model/info",
    handler: predictController.getModelInfo,
    options: {
      description: "Get model information",
      tags: ["api", "model"],
      response: {
        schema: Joi.object({
          success: Joi.boolean().required(),
          message: Joi.string().required(),
          data: Joi.object({
            model_loaded: Joi.boolean().required(),
            class_names: Joi.object().required(),
            num_classes: Joi.number().required(),
          }).optional(),
          error: Joi.any().optional(),
        }),
      },
    },
  },
];

module.exports = predictRoutes;

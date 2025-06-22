const  categoryController  = require("../controllers/categoryController");
const Joi = require("joi");

const categoryRoutes = [
  {
    method: "POST",
    path: "/categories",
    handler: categoryController.createCategory,
    options: {
      validate: {
        payload: Joi.object({
          Nama: Joi.string().trim().min(1).max(255).required().messages({
            "string.empty": "Nama kategori tidak boleh kosong",
            "string.min": "Nama kategori minimal 1 karakter",
            "string.max": "Nama kategori maksimal 255 karakter",
            "any.required": "Nama kategori wajib diisi",
          }),
        }),
      },
    },
  },
  {
    method: "PUT",
    path: "/categories/{id}",
    handler: categoryController.updateCategory,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.number().integer().positive().required(),
        }),
        payload: Joi.object({
          Nama: Joi.string().trim().min(1).max(255).required().messages({
            "string.empty": "Nama kategori tidak boleh kosong",
            "string.min": "Nama kategori minimal 1 karakter",
            "string.max": "Nama kategori maksimal 255 karakter",
            "any.required": "Nama kategori wajib diisi",
          }),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/categories/{id}",
    handler: categoryController.getCategoryById,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.number().integer().positive().required(),
        }),
        query: Joi.object({
          includeProducts: Joi.string().valid("true", "false").optional(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/categories",
    handler: categoryController.getAllCategories,
    options: {
      validate: {
        query: Joi.object({
          page: Joi.number().integer().min(1).optional(),
          limit: Joi.number().integer().min(1).max(100).optional(),
          search: Joi.string().optional(),
          includeProducts: Joi.string().valid("true", "false").optional(),
          sortBy: Joi.string()
            .valid("id", "Nama", "createdAt", "updatedAt")
            .optional(),
          sortOrder: Joi.string().valid("ASC", "DESC").optional(),
        }),
      },
    },
  },
  {
    method: "DELETE",
    path: "/categories/{id}",
    handler: categoryController.deleteCategory,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.number().integer().positive().required(),
        }),
        query: Joi.object({
          force: Joi.string().valid("true", "false").optional(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/categories/product-count",
    handler: categoryController.getCategoriesWithProductCount,
    options: {
      validate: {
        query: Joi.object({
          search: Joi.string().optional(),
        }),
      },
    },
  },
  {
    method: "POST",
    path: "/categories/bulk-delete",
    handler: categoryController.bulkDeleteCategories,
    options: {
      validate: {
        payload: Joi.object({
          categoryIds: Joi.array()
            .items(Joi.number().integer().positive())
            .min(1)
            .required()
            .messages({
              "array.min": "Minimal harus ada 1 kategori yang dipilih",
              "any.required": "categoryIds wajib diisi",
            }),
        }),
        query: Joi.object({
          force: Joi.string().valid("true", "false").optional(),
        }),
      },
    },
  },
];

module.exports = categoryRoutes;

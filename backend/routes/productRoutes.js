const { produkController } = require("../controllers/productController");
const Joi = require("joi");

const productRoutes = [
  {
    method: "POST",
    path: "/products",
    handler: produkController.createProduct,
    options: {
      validate: {
        payload: Joi.object({
          Nama: Joi.string().required().trim(),
          Harga: Joi.number().positive().required(),
          Stok: Joi.number().integer().min(0).default(0),
          Category_id: Joi.number().integer().optional().allow(null),
        }),
      },
    },
  },
  {
    method: "PUT",
    path: "/products/{id}",
    handler: produkController.updateProduct,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(),
        }),
        payload: Joi.object({
          Nama: Joi.string().trim().optional(),
          Harga: Joi.number().positive().optional(),
          Stok: Joi.number().integer().min(0).optional(),
          Category_id: Joi.number().integer().optional().allow(null),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/products/{id}",
    handler: produkController.getProductById,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(),
        }),
        query: Joi.object({
          includeTransactions: Joi.string()
            .valid("true", "false")
            .default("false"),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/products",
    handler: produkController.getAllProducts,
    options: {
      validate: {
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).max(100).default(10),
          search: Joi.string().allow("").default(""),
          category_id: Joi.number().integer().optional().allow(""),
          min_price: Joi.number().positive().optional().allow(""),
          max_price: Joi.number().positive().optional().allow(""),
          min_stock: Joi.number().integer().min(0).optional().allow(""),
          max_stock: Joi.number().integer().min(0).optional().allow(""),
          sortBy: Joi.string()
            .valid("id", "Nama", "Harga", "Stok", "createdAt", "updatedAt")
            .default("createdAt"),
          sortOrder: Joi.string().valid("ASC", "DESC").default("DESC"),
          includeCategory: Joi.string().valid("true", "false").default("true"),
        }),
      },
    },
  },
  {
    method: "DELETE",
    path: "/products/{id}",
    handler: produkController.deleteProduct,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(),
        }),
        query: Joi.object({
          force: Joi.string().valid("true", "false").default("false"),
        }),
      },
    },
  },
  {
    method: "POST",
    path: "/products/{id}/update-stock",
    handler: produkController.updateStock,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(),
        }),
        payload: Joi.object({
          amount: Joi.number().integer().positive().required(),
          type: Joi.string().valid("add", "subtract").required(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/products/low-stock",
    handler: produkController.getLowStockProducts,
    options: {
      validate: {
        query: Joi.object({
          threshold: Joi.number().integer().min(0).default(10),
          includeCategory: Joi.string().valid("true", "false").default("true"),
        }),
      },
    },
  },
  {
    method: "POST",
    path: "/products/bulk-update",
    handler: produkController.bulkUpdateProducts,
    options: {
      validate: {
        payload: Joi.object({
          products: Joi.array()
            .items(
              Joi.object({
                id: Joi.number().integer().required(),
                updates: Joi.object().min(1).required(),
              })
            )
            .min(1)
            .required(),
        }),
      },
    },
  },
];

module.exports = productRoutes;

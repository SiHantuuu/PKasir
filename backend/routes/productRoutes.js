// routes/productRoutes.js
const Joi = require('joi');
const produkController = require('../controllers/productController');

const productRoutes = [
  // 1. Create Product
  {
    method: 'POST',
    path: '/products',
    handler: produkController.createProduct,
    options: {
      validate: {
        payload: Joi.object({
          Nama: Joi.string().min(1).max(255).required().messages({
            'string.empty': 'Nama produk tidak boleh kosong',
            'any.required': 'Nama produk wajib diisi',
            'string.max': 'Nama produk maksimal 255 karakter',
          }),
          Harga: Joi.number().positive().required().messages({
            'number.positive': 'Harga harus bernilai positif',
            'any.required': 'Harga wajib diisi',
          }),
          Stok: Joi.number().integer().min(0).default(0).messages({
            'number.min': 'Stok tidak boleh negatif',
            'number.integer': 'Stok harus berupa bilangan bulat',
          }),
          Category_id: Joi.number()
            .integer()
            .positive()
            .allow(null)
            .optional()
            .messages({
              'number.positive': 'Category ID harus bernilai positif',
              'number.integer': 'Category ID harus berupa bilangan bulat',
            }),
        }),
      },
      description: 'Membuat produk baru',
      tags: ['api', 'products'],
    },
  },

  // 2. Update Product
  {
    method: ['PUT', 'PATCH'],
    path: '/products/{id}',
    handler: produkController.updateProduct,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.number().integer().positive().required().messages({
            'number.positive': 'ID produk harus bernilai positif',
            'any.required': 'ID produk wajib diisi',
          }),
        }),
        payload: Joi.object({
          Nama: Joi.string().min(1).max(255).optional().messages({
            'string.empty': 'Nama produk tidak boleh kosong',
            'string.max': 'Nama produk maksimal 255 karakter',
          }),
          Harga: Joi.number().positive().optional().messages({
            'number.positive': 'Harga harus bernilai positif',
          }),
          Stok: Joi.number().integer().min(0).optional().messages({
            'number.min': 'Stok tidak boleh negatif',
            'number.integer': 'Stok harus berupa bilangan bulat',
          }),
          Category_id: Joi.number()
            .integer()
            .positive()
            .allow(null)
            .optional()
            .messages({
              'number.positive': 'Category ID harus bernilai positif',
              'number.integer': 'Category ID harus berupa bilangan bulat',
            }),
        }),
      },
      description: 'Memperbarui produk berdasarkan ID',
      tags: ['api', 'products'],
    },
  },

  // 3. Get Product By ID atau Name (flexible)
  {
    method: 'GET',
    path: '/products/{identifier}',
    handler: produkController.getProduct,
    options: {
      validate: {
        params: Joi.object({
          identifier: Joi.alternatives()
            .try(
              Joi.number().integer().positive(),
              Joi.string().min(1).max(255)
            )
            .required()
            .messages({
              'any.required': 'Identifier produk wajib diisi',
            }),
        }),
        query: Joi.object({
          includeTransactions: Joi.boolean().default(false).messages({
            'boolean.base': 'includeTransactions harus berupa boolean',
          }),
        }),
      },
      description: 'Mendapatkan produk berdasarkan ID atau nama',
      tags: ['api', 'products'],
    },
  },

  // 3b. Get Product By ID (backward compatibility)
  {
    method: 'GET',
    path: '/products/id/{id}',
    handler: produkController.getProductById,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.number().integer().positive().required().messages({
            'number.positive': 'ID produk harus bernilai positif',
            'any.required': 'ID produk wajib diisi',
          }),
        }),
        query: Joi.object({
          includeTransactions: Joi.boolean().default(false).messages({
            'boolean.base': 'includeTransactions harus berupa boolean',
          }),
        }),
      },
      description: 'Mendapatkan produk berdasarkan ID',
      tags: ['api', 'products'],
    },
  },

  // 3c. Get Product By Name
  {
    method: 'GET',
    path: '/products/name/{name}',
    handler: produkController.getProductByName,
    options: {
      validate: {
        params: Joi.object({
          name: Joi.string().min(1).max(255).required().messages({
            'string.empty': 'Nama produk tidak boleh kosong',
            'any.required': 'Nama produk wajib diisi',
          }),
        }),
        query: Joi.object({
          includeTransactions: Joi.boolean().default(false).messages({
            'boolean.base': 'includeTransactions harus berupa boolean',
          }),
          exactMatch: Joi.boolean().default(false).messages({
            'boolean.base': 'exactMatch harus berupa boolean',
          }),
        }),
      },
      description: 'Mendapatkan produk berdasarkan nama',
      tags: ['api', 'products'],
    },
  },

  // NEW: Batch Get Products By Names (untuk AI model)
  {
    method: 'POST',
    path: '/products/batch',
    handler: produkController.getProductsByNames,
    options: {
      validate: {
        payload: Joi.object({
          products: Joi.object()
            .pattern(
              Joi.string(), // key: product name
              Joi.number().integer().positive() // value: quantity
            )
            .required()
            .messages({
              'object.base': 'Products harus berupa object',
              'any.required': 'Products wajib diisi',
            }),
        }),
        query: Joi.object({
          exactMatch: Joi.boolean().default(true).messages({
            'boolean.base': 'exactMatch harus berupa boolean',
          }),
        }),
      },
      description: 'Mendapatkan multiple produk berdasarkan nama (batch)',
      tags: ['api', 'products'],
    },
  },

  // 4. Get All Products
  {
    method: 'GET',
    path: '/products',
    handler: produkController.getAllProducts,
    options: {
      validate: {
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1).messages({
            'number.min': 'Page harus minimal 1',
            'number.integer': 'Page harus berupa bilangan bulat',
          }),
          limit: Joi.number().integer().min(1).max(100).default(10).messages({
            'number.min': 'Limit harus minimal 1',
            'number.max': 'Limit maksimal 100',
            'number.integer': 'Limit harus berupa bilangan bulat',
          }),
          search: Joi.string().max(255).default('').messages({
            'string.max': 'Search maksimal 255 karakter',
          }),
          category_id: Joi.number().integer().positive().optional().messages({
            'number.positive': 'Category ID harus bernilai positif',
            'number.integer': 'Category ID harus berupa bilangan bulat',
          }),
          min_price: Joi.number().positive().optional().messages({
            'number.positive': 'Min price harus bernilai positif',
          }),
          max_price: Joi.number().positive().optional().messages({
            'number.positive': 'Max price harus bernilai positif',
          }),
          min_stock: Joi.number().integer().min(0).optional().messages({
            'number.min': 'Min stock tidak boleh negatif',
            'number.integer': 'Min stock harus berupa bilangan bulat',
          }),
          max_stock: Joi.number().integer().min(0).optional().messages({
            'number.min': 'Max stock tidak boleh negatif',
            'number.integer': 'Max stock harus berupa bilangan bulat',
          }),
          sortBy: Joi.string()
            .valid('id', 'Nama', 'Harga', 'Stok', 'createdAt', 'updatedAt')
            .default('createdAt')
            .messages({
              'any.only':
                'sortBy harus salah satu dari: id, Nama, Harga, Stok, createdAt, updatedAt',
            }),
          sortOrder: Joi.string()
            .valid('ASC', 'DESC', 'asc', 'desc')
            .default('DESC')
            .messages({
              'any.only': 'sortOrder harus ASC atau DESC',
            }),
          includeCategory: Joi.boolean().default(true).messages({
            'boolean.base': 'includeCategory harus berupa boolean',
          }),
        }),
      },
      description: 'Mendapatkan semua produk dengan filter dan paginasi',
      tags: ['api', 'products'],
    },
  },

  // 5. Delete Product
  {
    method: 'DELETE',
    path: '/products/{id}',
    handler: produkController.deleteProduct,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.number().integer().positive().required().messages({
            'number.positive': 'ID produk harus bernilai positif',
            'any.required': 'ID produk wajib diisi',
          }),
        }),
        query: Joi.object({
          force: Joi.boolean().default(false).messages({
            'boolean.base': 'Force harus berupa boolean',
          }),
        }),
      },
      description: 'Menghapus produk berdasarkan ID',
      tags: ['api', 'products'],
    },
  },

  // 6. Update Stock (untuk transaksi) - bisa menggunakan ID atau nama
  {
    method: ['PUT', 'PATCH'],
    path: '/products/{identifier}/stock',
    handler: produkController.updateStock,
    options: {
      validate: {
        params: Joi.object({
          identifier: Joi.alternatives()
            .try(
              Joi.number().integer().positive(),
              Joi.string().min(1).max(255)
            )
            .required()
            .messages({
              'any.required': 'Identifier produk wajib diisi',
            }),
        }),
        payload: Joi.object({
          amount: Joi.number().integer().positive().required().messages({
            'number.positive': 'Amount harus bernilai positif',
            'number.integer': 'Amount harus berupa bilangan bulat',
            'any.required': 'Amount wajib diisi',
          }),
          type: Joi.string().valid('add', 'subtract').required().messages({
            'any.only': 'Type harus "add" atau "subtract"',
            'any.required': 'Type wajib diisi',
          }),
        }),
      },
      description: 'Update stok produk (tambah/kurang)',
      tags: ['api', 'products'],
    },
  },

  // 7. Get Low Stock Products
  {
    method: 'GET',
    path: '/products/low-stock',
    handler: produkController.getLowStockProducts,
    options: {
      validate: {
        query: Joi.object({
          threshold: Joi.number().integer().min(0).default(10).messages({
            'number.min': 'Threshold tidak boleh negatif',
            'number.integer': 'Threshold harus berupa bilangan bulat',
          }),
          includeCategory: Joi.boolean().default(true).messages({
            'boolean.base': 'includeCategory harus berupa boolean',
          }),
        }),
      },
      description: 'Mendapatkan produk dengan stok rendah',
      tags: ['api', 'products'],
    },
  },

  // 8. Bulk Update Products
  {
    method: ['PUT', 'PATCH'],
    path: '/products/bulk-update',
    handler: produkController.bulkUpdateProducts,
    options: {
      validate: {
        payload: Joi.object({
          products: Joi.array()
            .items(
              Joi.object({
                id: Joi.number().integer().positive().required().messages({
                  'number.positive': 'ID produk harus bernilai positif',
                  'any.required': 'ID produk wajib diisi',
                }),
                updates: Joi.object({
                  Nama: Joi.string().min(1).max(255).optional().messages({
                    'string.empty': 'Nama produk tidak boleh kosong',
                    'string.max': 'Nama produk maksimal 255 karakter',
                  }),
                  Harga: Joi.number().positive().optional().messages({
                    'number.positive': 'Harga harus bernilai positif',
                  }),
                  Stok: Joi.number().integer().min(0).optional().messages({
                    'number.min': 'Stok tidak boleh negatif',
                    'number.integer': 'Stok harus berupa bilangan bulat',
                  }),
                  Category_id: Joi.number()
                    .integer()
                    .positive()
                    .allow(null)
                    .optional()
                    .messages({
                      'number.positive': 'Category ID harus bernilai positif',
                      'number.integer':
                        'Category ID harus berupa bilangan bulat',
                    }),
                })
                  .min(1)
                  .required()
                  .messages({
                    'object.min': 'Updates harus memiliki minimal 1 field',
                    'any.required': 'Updates wajib diisi',
                  }),
              })
            )
            .min(1)
            .required()
            .messages({
              'array.min': 'Products harus memiliki minimal 1 item',
              'any.required': 'Products wajib diisi',
            }),
        }),
      },
      description: 'Update multiple produk sekaligus',
      tags: ['api', 'products'],
    },
  },
];

module.exports = productRoutes;

// controllers/produkController.js - Hapi.js Version
const { Produk, Category, Transaction_detail } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');
const Boom = require('@hapi/boom');

// Helper function untuk response format
const sendResponse = (h, status, success, message, data = null) => {
  return h
    .response({
      success,
      message,
      data,
    })
    .code(status);
};

// Validation schemas
const createProductSchema = Joi.object({
  Nama: Joi.string().required().trim(),
  Harga: Joi.number().positive().required(),
  Stok: Joi.number().integer().min(0).default(0),
  Category_id: Joi.number().integer().optional().allow(null),
});

const updateProductSchema = Joi.object({
  Nama: Joi.string().trim().optional(),
  Harga: Joi.number().positive().optional(),
  Stok: Joi.number().integer().min(0).optional(),
  Category_id: Joi.number().integer().optional().allow(null),
});

const updateStockSchema = Joi.object({
  amount: Joi.number().integer().positive().required(),
  type: Joi.string().valid('add', 'subtract').required(),
});

const bulkUpdateSchema = Joi.object({
  products: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().required(),
        updates: Joi.object().min(1).required(),
      })
    )
    .min(1)
    .required(),
});

const produkController = {
  // 1. Create Product
  createProduct: {
    handler: async (request, h) => {
      try {
        // Validasi payload sudah dilakukan oleh Hapi
        const { Nama, Harga, Stok, Category_id } = request.payload;

        // Validasi kategori jika ada
        if (Category_id) {
          const category = await Category.findByPk(Category_id);
          if (!category) {
            throw Boom.notFound('Kategori tidak ditemukan');
          }
        }

        // Cek apakah produk dengan nama yang sama sudah ada
        const existingProduct = await Produk.findOne({
          where: {
            Nama: {
              [Op.iLike]: Nama.trim(), // Case insensitive
            },
          },
        });

        if (existingProduct) {
          throw Boom.conflict('Produk dengan nama tersebut sudah ada');
        }

        // Buat produk baru
        const newProduct = await Produk.create({
          Nama: Nama.trim(),
          Harga: parseFloat(Harga),
          Stok: parseInt(Stok) || 0,
          Category_id: Category_id || null,
        });

        // Ambil produk dengan kategori untuk response
        const productWithCategory = await Produk.findByPk(newProduct.id, {
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'Nama'],
            },
          ],
        });

        return sendResponse(
          h,
          201,
          true,
          'Produk berhasil dibuat',
          productWithCategory
        );
      } catch (error) {
        console.error('Error in createProduct:', error);
        if (error.isBoom) {
          throw error;
        }
        throw Boom.internal('Terjadi kesalahan server', error.message);
      }
    },
    options: {
      validate: {
        payload: createProductSchema,
      },
    },
  },

  // 2. Update Product
  updateProduct: {
    handler: async (request, h) => {
      try {
        const { id } = request.params;
        const { Nama, Harga, Stok, Category_id } = request.payload;

        // Cari produk berdasarkan ID
        const product = await Produk.findByPk(id);
        if (!product) {
          throw Boom.notFound('Produk tidak ditemukan');
        }

        // Validasi kategori jika ada dan berubah
        if (Category_id && Category_id !== product.Category_id) {
          const category = await Category.findByPk(Category_id);
          if (!category) {
            throw Boom.notFound('Kategori tidak ditemukan');
          }
        }

        // Cek duplikasi nama jika nama berubah
        if (Nama && Nama.trim().toLowerCase() !== product.Nama.toLowerCase()) {
          const existingProduct = await Produk.findOne({
            where: {
              Nama: {
                [Op.iLike]: Nama.trim(),
              },
              id: {
                [Op.ne]: id,
              },
            },
          });

          if (existingProduct) {
            throw Boom.conflict('Produk dengan nama tersebut sudah ada');
          }
        }

        // Siapkan data update
        const updateData = {};
        if (Nama !== undefined) updateData.Nama = Nama.trim();
        if (Harga !== undefined) updateData.Harga = parseFloat(Harga);
        if (Stok !== undefined) updateData.Stok = parseInt(Stok);
        if (Category_id !== undefined)
          updateData.Category_id = Category_id || null;

        // Update produk
        await product.update(updateData);

        // Ambil data terbaru dengan kategori
        const updatedProduct = await Produk.findByPk(id, {
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'Nama'],
            },
          ],
        });

        return sendResponse(
          h,
          200,
          true,
          'Produk berhasil diperbarui',
          updatedProduct
        );
      } catch (error) {
        console.error('Error in updateProduct:', error);
        if (error.isBoom) {
          throw error;
        }
        throw Boom.internal('Terjadi kesalahan server', error.message);
      }
    },
    options: {
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(),
        }),
        payload: updateProductSchema,
      },
    },
  },

  // 3. Get Product By ID
  getProductById: {
    handler: async (request, h) => {
      try {
        const { id } = request.params;
        const { includeTransactions = false } = request.query;

        let includeOptions = [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'Nama'],
          },
        ];

        // Jika diminta, sertakan riwayat transaksi
        if (includeTransactions === 'true') {
          includeOptions.push({
            model: Transaction_detail,
            as: 'transaction_details',
            attributes: ['id', 'Transaction_id', 'amount', 'createdAt'],
            include: [
              {
                model: require('../models').Transaksi,
                as: 'transaction',
                attributes: [
                  'id',
                  'Transaction_type',
                  'total_amount',
                  'createdAt',
                ],
              },
            ],
          });
        }

        const product = await Produk.findByPk(id, {
          include: includeOptions,
        });

        if (!product) {
          throw Boom.notFound('Produk tidak ditemukan');
        }

        return sendResponse(
          h,
          200,
          true,
          'Data produk berhasil diambil',
          product
        );
      } catch (error) {
        console.error('Error in getProductById:', error);
        if (error.isBoom) {
          throw error;
        }
        throw Boom.internal('Terjadi kesalahan server', error.message);
      }
    },
    options: {
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(),
        }),
        query: Joi.object({
          includeTransactions: Joi.string()
            .valid('true', 'false')
            .default('false'),
        }),
      },
    },
  },

  // 4. Get All Products
  getAllProducts: {
    handler: async (request, h) => {
      try {
        const {
          page = 1,
          limit = 10,
          search = '',
          category_id = '',
          min_price = '',
          max_price = '',
          min_stock = '',
          max_stock = '',
          sortBy = 'createdAt',
          sortOrder = 'DESC',
          includeCategory = true,
        } = request.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause
        const whereClause = {};

        // Search berdasarkan nama produk
        if (search) {
          whereClause.Nama = {
            [Op.iLike]: `%${search}%`,
          };
        }

        // Filter berdasarkan kategori
        if (category_id) {
          whereClause.Category_id = parseInt(category_id);
        }

        // Filter berdasarkan harga
        if (min_price || max_price) {
          whereClause.Harga = {};
          if (min_price) whereClause.Harga[Op.gte] = parseFloat(min_price);
          if (max_price) whereClause.Harga[Op.lte] = parseFloat(max_price);
        }

        // Filter berdasarkan stok
        if (min_stock || max_stock) {
          whereClause.Stok = {};
          if (min_stock) whereClause.Stok[Op.gte] = parseInt(min_stock);
          if (max_stock) whereClause.Stok[Op.lte] = parseInt(max_stock);
        }

        // Build include options
        let includeOptions = [];
        if (includeCategory === 'true') {
          includeOptions.push({
            model: Category,
            as: 'category',
            attributes: ['id', 'Nama'],
          });
        }

        // Validasi sortBy
        const allowedSortFields = [
          'id',
          'Nama',
          'Harga',
          'Stok',
          'createdAt',
          'updatedAt',
        ];
        const validSortBy = allowedSortFields.includes(sortBy)
          ? sortBy
          : 'createdAt';
        const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase())
          ? sortOrder.toUpperCase()
          : 'DESC';

        const { count, rows } = await Produk.findAndCountAll({
          where: whereClause,
          include: includeOptions,
          limit: parseInt(limit),
          offset,
          order: [[validSortBy, validSortOrder]],
        });

        const totalPages = Math.ceil(count / parseInt(limit));

        return sendResponse(h, 200, true, 'Data produk berhasil diambil', {
          products: rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: count,
            itemsPerPage: parseInt(limit),
          },
        });
      } catch (error) {
        console.error('Error in getAllProducts:', error);
        throw Boom.internal('Terjadi kesalahan server', error.message);
      }
    },
    options: {
      validate: {
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).max(100).default(10),
          search: Joi.string().allow('').default(''),
          category_id: Joi.number().integer().optional().allow(''),
          min_price: Joi.number().positive().optional().allow(''),
          max_price: Joi.number().positive().optional().allow(''),
          min_stock: Joi.number().integer().min(0).optional().allow(''),
          max_stock: Joi.number().integer().min(0).optional().allow(''),
          sortBy: Joi.string()
            .valid('id', 'Nama', 'Harga', 'Stok', 'createdAt', 'updatedAt')
            .default('createdAt'),
          sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC'),
          includeCategory: Joi.string().valid('true', 'false').default('true'),
        }),
      },
    },
  },

  // 5. Delete Product
  deleteProduct: {
    handler: async (request, h) => {
      try {
        const { id } = request.params;
        const { force = false } = request.query;

        // Cari produk berdasarkan ID
        const product = await Produk.findByPk(id, {
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'Nama'],
            },
          ],
        });

        if (!product) {
          throw Boom.notFound('Produk tidak ditemukan');
        }

        // Cek apakah produk pernah ditransaksikan
        const transactionCount = await Transaction_detail.count({
          where: { Product_id: id },
        });

        if (transactionCount > 0 && force !== 'true') {
          throw Boom.badRequest(
            `Produk tidak dapat dihapus karena sudah pernah ditransaksikan ${transactionCount} kali. Gunakan parameter force=true untuk menghapus paksa (detail transaksi akan kehilangan referensi produk).`,
            { transactionCount }
          );
        }

        // Jika force delete, update transaction_detail untuk menghilangkan referensi produk
        if (transactionCount > 0 && force === 'true') {
          await Transaction_detail.update(
            { Product_id: null },
            { where: { Product_id: id } }
          );
        }

        // Hapus produk
        await product.destroy();

        const message =
          transactionCount > 0
            ? `Produk berhasil dihapus dan ${transactionCount} detail transaksi telah dilepas dari produk ini`
            : 'Produk berhasil dihapus';

        return sendResponse(h, 200, true, message, {
          deletedProduct: product,
          affectedTransactions: transactionCount,
        });
      } catch (error) {
        console.error('Error in deleteProduct:', error);
        if (error.isBoom) {
          throw error;
        }
        throw Boom.internal('Terjadi kesalahan server', error.message);
      }
    },
    options: {
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(),
        }),
        query: Joi.object({
          force: Joi.string().valid('true', 'false').default('false'),
        }),
      },
    },
  },

  // Bonus: Update Stock (untuk transaksi)
  updateStock: {
    handler: async (request, h) => {
      try {
        const { id } = request.params;
        const { amount, type } = request.payload;

        const product = await Produk.findByPk(id);
        if (!product) {
          throw Boom.notFound('Produk tidak ditemukan');
        }

        let newStock;
        if (type === 'add') {
          newStock = product.Stok + parseInt(amount);
        } else if (type === 'subtract') {
          newStock = product.Stok - parseInt(amount);
          if (newStock < 0) {
            throw Boom.badRequest('Stok tidak mencukupi');
          }
        }

        await product.update({ Stok: newStock });

        // Ambil data terbaru
        const updatedProduct = await Produk.findByPk(id, {
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'Nama'],
            },
          ],
        });

        return sendResponse(
          h,
          200,
          true,
          `Stok berhasil ${type === 'add' ? 'ditambah' : 'dikurangi'}`,
          updatedProduct
        );
      } catch (error) {
        console.error('Error in updateStock:', error);
        if (error.isBoom) {
          throw error;
        }
        throw Boom.internal('Terjadi kesalahan server', error.message);
      }
    },
    options: {
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(),
        }),
        payload: updateStockSchema,
      },
    },
  },

  // Bonus: Get Low Stock Products
  getLowStockProducts: {
    handler: async (request, h) => {
      try {
        const { threshold = 10, includeCategory = true } = request.query;

        let includeOptions = [];
        if (includeCategory === 'true') {
          includeOptions.push({
            model: Category,
            as: 'category',
            attributes: ['id', 'Nama'],
          });
        }

        const lowStockProducts = await Produk.findAll({
          where: {
            Stok: {
              [Op.lte]: parseInt(threshold),
            },
          },
          include: includeOptions,
          order: [['Stok', 'ASC']],
        });

        return sendResponse(
          h,
          200,
          true,
          `Produk dengan stok <= ${threshold}`,
          lowStockProducts
        );
      } catch (error) {
        console.error('Error in getLowStockProducts:', error);
        throw Boom.internal('Terjadi kesalahan server', error.message);
      }
    },
    options: {
      validate: {
        query: Joi.object({
          threshold: Joi.number().integer().min(0).default(10),
          includeCategory: Joi.string().valid('true', 'false').default('true'),
        }),
      },
    },
  },

  // Bonus: Bulk Update Products
  bulkUpdateProducts: {
    handler: async (request, h) => {
      try {
        const { products } = request.payload;

        const results = [];
        const errors_bulk = [];

        for (const item of products) {
          try {
            const { id, updates } = item;
            const product = await Produk.findByPk(id);

            if (!product) {
              errors_bulk.push({ id, error: 'Produk tidak ditemukan' });
              continue;
            }

            await product.update(updates);
            results.push({ id, status: 'updated' });
          } catch (error) {
            errors_bulk.push({ id: item.id, error: error.message });
          }
        }

        return sendResponse(h, 200, true, 'Bulk update selesai', {
          successCount: results.length,
          errorCount: errors_bulk.length,
          results,
          errors: errors_bulk,
        });
      } catch (error) {
        console.error('Error in bulkUpdateProducts:', error);
        throw Boom.internal('Terjadi kesalahan server', error.message);
      }
    },
    options: {
      validate: {
        payload: bulkUpdateSchema,
      },
    },
  },
};

module.exports = produkController;

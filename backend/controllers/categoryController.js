// controllers/categoryController.js
const { Category, Produk } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');

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

const categoryController = {
  // 1. Create Category
  createCategory: async (request, h) => {
    try {
      const { Nama } = request.payload;

      // Cek apakah kategori dengan nama yang sama sudah ada
      const existingCategory = await Category.findOne({
        where: {
          Nama: {
            [Op.iLike]: Nama.trim(), // Case insensitive
          },
        },
      });

      if (existingCategory) {
        return sendResponse(
          h,
          409,
          false,
          'Kategori dengan nama tersebut sudah ada'
        );
      }

      // Buat kategori baru
      const newCategory = await Category.create({
        Nama: Nama.trim(),
      });

      return sendResponse(
        h,
        201,
        true,
        'Kategori berhasil dibuat',
        newCategory
      );
    } catch (error) {
      console.error('Error in createCategory:', error);
      return sendResponse(
        h,
        500,
        false,
        'Terjadi kesalahan server',
        error.message
      );
    }
  },

  // 2. Update Category
  updateCategory: async (request, h) => {
    try {
      const { id } = request.params;
      const { Nama } = request.payload;

      // Cari kategori berdasarkan ID
      const category = await Category.findByPk(id);
      if (!category) {
        return sendResponse(h, 404, false, 'Kategori tidak ditemukan');
      }

      // Cek apakah nama kategori baru sudah digunakan oleh kategori lain
      const existingCategory = await Category.findOne({
        where: {
          Nama: {
            [Op.iLike]: Nama.trim(),
          },
          id: {
            [Op.ne]: id, // Tidak termasuk kategori saat ini
          },
        },
      });

      if (existingCategory) {
        return sendResponse(
          h,
          409,
          false,
          'Kategori dengan nama tersebut sudah ada'
        );
      }

      // Update kategori
      await category.update({
        Nama: Nama.trim(),
      });

      // Ambil data terbaru
      const updatedCategory = await Category.findByPk(id);

      return sendResponse(
        h,
        200,
        true,
        'Kategori berhasil diperbarui',
        updatedCategory
      );
    } catch (error) {
      console.error('Error in updateCategory:', error);
      return sendResponse(
        h,
        500,
        false,
        'Terjadi kesalahan server',
        error.message
      );
    }
  },

  // 3. Get Category By ID
  getCategoryById: async (request, h) => {
    try {
      const { id } = request.params;
      const { includeProducts = false } = request.query;

      let includeOptions = [];

      // Jika diminta, sertakan produk-produk dalam kategori
      if (includeProducts === 'true') {
        includeOptions.push({
          model: Produk,
          as: 'products',
          attributes: ['id', 'Nama', 'Harga', 'Stok'],
        });
      }

      const category = await Category.findByPk(id, {
        include: includeOptions,
      });

      if (!category) {
        return sendResponse(h, 404, false, 'Kategori tidak ditemukan');
      }

      return sendResponse(
        h,
        200,
        true,
        'Data kategori berhasil diambil',
        category
      );
    } catch (error) {
      console.error('Error in getCategoryById:', error);
      return sendResponse(
        h,
        500,
        false,
        'Terjadi kesalahan server',
        error.message
      );
    }
  },

  // 4. Get All Categories
  getAllCategories: async (request, h) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        includeProducts = false,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
      } = request.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Build where clause untuk pencarian
      const whereClause = {};
      if (search) {
        whereClause.Nama = {
          [Op.iLike]: `%${search}%`,
        };
      }

      // Build include options
      let includeOptions = [];
      if (includeProducts === 'true') {
        includeOptions.push({
          model: Produk,
          as: 'products',
          attributes: ['id', 'Nama', 'Harga', 'Stok'],
        });
      }

      // Validasi sortBy
      const allowedSortFields = ['id', 'Nama', 'createdAt', 'updatedAt'];
      const validSortBy = allowedSortFields.includes(sortBy)
        ? sortBy
        : 'createdAt';
      const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase())
        ? sortOrder.toUpperCase()
        : 'DESC';

      const { count, rows } = await Category.findAndCountAll({
        where: whereClause,
        include: includeOptions,
        limit: parseInt(limit),
        offset,
        order: [[validSortBy, validSortOrder]],
      });

      const totalPages = Math.ceil(count / parseInt(limit));

      return sendResponse(h, 200, true, 'Data kategori berhasil diambil', {
        categories: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      });
    } catch (error) {
      console.error('Error in getAllCategories:', error);
      return sendResponse(
        h,
        500,
        false,
        'Terjadi kesalahan server',
        error.message
      );
    }
  },

  // 5. Delete Category
  deleteCategory: async (request, h) => {
    try {
      const { id } = request.params;
      const { force = false } = request.query; // Parameter untuk force delete

      // Cari kategori berdasarkan ID
      const category = await Category.findByPk(id);
      if (!category) {
        return sendResponse(h, 404, false, 'Kategori tidak ditemukan');
      }

      // Cek apakah ada produk yang menggunakan kategori ini
      const productCount = await Produk.count({
        where: { Category_id: id },
      });

      if (productCount > 0 && force !== 'true') {
        return sendResponse(
          h,
          400,
          false,
          `Kategori tidak dapat dihapus karena masih digunakan oleh ${productCount} produk. Gunakan parameter force=true untuk menghapus paksa (produk akan kehilangan kategori).`,
          { productCount }
        );
      }

      // Jika force delete, update produk untuk menghilangkan kategori
      if (productCount > 0 && force === 'true') {
        await Produk.update(
          { Category_id: null },
          { where: { Category_id: id } }
        );
      }

      // Hapus kategori
      await category.destroy();

      const message =
        productCount > 0
          ? `Kategori berhasil dihapus dan ${productCount} produk telah dilepas dari kategori ini`
          : 'Kategori berhasil dihapus';

      return sendResponse(h, 200, true, message, {
        deletedCategory: category,
        affectedProducts: productCount,
      });
    } catch (error) {
      console.error('Error in deleteCategory:', error);
      return sendResponse(
        h,
        500,
        false,
        'Terjadi kesalahan server',
        error.message
      );
    }
  },

  // Bonus: Get Categories with Product Count
  getCategoriesWithProductCount: async (request, h) => {
    try {
      const { search = '' } = request.query;

      const whereClause = {};
      if (search) {
        whereClause.Nama = {
          [Op.iLike]: `%${search}%`,
        };
      }

      const categories = await Category.findAll({
        where: whereClause,
        include: [
          {
            model: Produk,
            as: 'products',
            attributes: [],
          },
        ],
        attributes: {
          include: [
            [
              require('sequelize').fn(
                'COUNT',
                require('sequelize').col('products.id')
              ),
              'productCount',
            ],
          ],
        },
        group: ['Category.id'],
        order: [['Nama', 'ASC']],
      });

      return sendResponse(
        h,
        200,
        true,
        'Data kategori dengan jumlah produk berhasil diambil',
        categories
      );
    } catch (error) {
      console.error('Error in getCategoriesWithProductCount:', error);
      return sendResponse(
        h,
        500,
        false,
        'Terjadi kesalahan server',
        error.message
      );
    }
  },

  // Bonus: Bulk Delete Categories
  bulkDeleteCategories: async (request, h) => {
    try {
      const { categoryIds } = request.payload; // Array of category IDs
      const { force = false } = request.query;

      if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
        return sendResponse(
          h,
          400,
          false,
          'categoryIds harus berupa array dan tidak boleh kosong'
        );
      }

      // Cek kategori yang ada
      const categories = await Category.findAll({
        where: { id: { [Op.in]: categoryIds } },
      });

      if (categories.length === 0) {
        return sendResponse(h, 404, false, 'Tidak ada kategori yang ditemukan');
      }

      const foundIds = categories.map((cat) => cat.id);
      const notFoundIds = categoryIds.filter(
        (id) => !foundIds.includes(parseInt(id))
      );

      // Cek produk yang menggunakan kategori-kategori ini
      const productCount = await Produk.count({
        where: { Category_id: { [Op.in]: foundIds } },
      });

      if (productCount > 0 && force !== 'true') {
        return sendResponse(
          h,
          400,
          false,
          `${productCount} produk masih menggunakan kategori yang akan dihapus. Gunakan parameter force=true untuk menghapus paksa.`,
          { productCount, affectedCategories: foundIds.length }
        );
      }

      // Jika force delete, update produk
      if (productCount > 0 && force === 'true') {
        await Produk.update(
          { Category_id: null },
          { where: { Category_id: { [Op.in]: foundIds } } }
        );
      }

      // Hapus kategori
      const deletedCount = await Category.destroy({
        where: { id: { [Op.in]: foundIds } },
      });

      return sendResponse(
        h,
        200,
        true,
        `${deletedCount} kategori berhasil dihapus`,
        {
          deletedCount,
          affectedProducts: productCount,
          notFoundIds: notFoundIds.length > 0 ? notFoundIds : undefined,
        }
      );
    } catch (error) {
      console.error('Error in bulkDeleteCategories:', error);
      return sendResponse(
        h,
        500,
        false,
        'Terjadi kesalahan server',
        error.message
      );
    }
  },
};

// Validation schemas untuk Hapi.js
const validationSchemas = {
  createCategory: {
    payload: Joi.object({
      Nama: Joi.string().trim().min(1).max(255).required().messages({
        'string.empty': 'Nama kategori tidak boleh kosong',
        'string.min': 'Nama kategori minimal 1 karakter',
        'string.max': 'Nama kategori maksimal 255 karakter',
        'any.required': 'Nama kategori wajib diisi',
      }),
    }),
  },

  updateCategory: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
    payload: Joi.object({
      Nama: Joi.string().trim().min(1).max(255).required().messages({
        'string.empty': 'Nama kategori tidak boleh kosong',
        'string.min': 'Nama kategori minimal 1 karakter',
        'string.max': 'Nama kategori maksimal 255 karakter',
        'any.required': 'Nama kategori wajib diisi',
      }),
    }),
  },

  getCategoryById: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
    query: Joi.object({
      includeProducts: Joi.string().valid('true', 'false').optional(),
    }),
  },

  getAllCategories: {
    query: Joi.object({
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      search: Joi.string().optional(),
      includeProducts: Joi.string().valid('true', 'false').optional(),
      sortBy: Joi.string()
        .valid('id', 'Nama', 'createdAt', 'updatedAt')
        .optional(),
      sortOrder: Joi.string().valid('ASC', 'DESC').optional(),
    }),
  },

  deleteCategory: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
    query: Joi.object({
      force: Joi.string().valid('true', 'false').optional(),
    }),
  },

  getCategoriesWithProductCount: {
    query: Joi.object({
      search: Joi.string().optional(),
    }),
  },

  bulkDeleteCategories: {
    payload: Joi.object({
      categoryIds: Joi.array()
        .items(Joi.number().integer().positive())
        .min(1)
        .required()
        .messages({
          'array.min': 'Minimal harus ada 1 kategori yang dipilih',
          'any.required': 'categoryIds wajib diisi',
        }),
    }),
    query: Joi.object({
      force: Joi.string().valid('true', 'false').optional(),
    }),
  },
};

module.exports = {
  categoryController,
  validationSchemas,
};

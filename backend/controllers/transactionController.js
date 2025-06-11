// controllers/transactionController.js
const {
  Transaksi,
  Transaction_detail,
  User,
  Produk,
  Category,
  Role,
  sequelize, // Import sequelize instance from models
} = require('../models');
const { Op } = require('sequelize');
const Boom = require('@hapi/boom');

const transactionController = {
  // 1. Create top-up transaction
  createTopupTransaction: async (request, h) => {
    const t = await sequelize.transaction();

    try {
      const { customer_id, amount, note } = request.payload;

      // Input validation
      if (!customer_id || !amount || amount <= 0) {
        await t.rollback();
        return Boom.badRequest(
          'Customer ID and amount are required and amount must be greater than 0'
        );
      }

      // Find user and verify student role
      const user = await User.findOne({
        where: { id: customer_id },
        include: [{ model: Role, as: 'role', where: { name: 'student' } }],
        transaction: t,
      });

      if (!user) {
        await t.rollback();
        return Boom.notFound('Student not found');
      }

      // Create top-up transaction
      const transaction = await Transaksi.create(
        {
          Customer_id: customer_id,
          Transaction_type: 'topup',
          total_amount: amount,
          Note: note || 'Top-up balance',
          status: 'completed',
        },
        { transaction: t }
      );

      // Update user balance
      const newBalance = parseFloat(user.Balance) + parseFloat(amount);
      await user.update({ Balance: newBalance }, { transaction: t });

      await t.commit();

      return h
        .response({
          success: true,
          message: 'Top-up successful',
          data: {
            transaction,
            new_balance: newBalance,
          },
        })
        .code(201);
    } catch (error) {
      await t.rollback();
      console.error('Error creating topup transaction:', error);
      return Boom.internal('Failed to process top-up');
    }
  },

  // 2. Create purchase transaction
  createPurchaseTransaction: async (request, h) => {
    const t = await sequelize.transaction();

    try {
      const { customer_id, items, note } = request.payload;

      // Input validation
      if (
        !customer_id ||
        !items ||
        !Array.isArray(items) ||
        items.length === 0
      ) {
        await t.rollback();
        return Boom.badRequest('Customer ID and items are required');
      }

      // Find user and verify student role
      const user = await User.findOne({
        where: { id: customer_id },
        include: [{ model: Role, as: 'role', where: { name: 'student' } }],
        transaction: t,
      });

      if (!user) {
        await t.rollback();
        return Boom.notFound('Student not found');
      }

      let totalAmount = 0;
      const purchaseDetails = [];

      // Validate and calculate total for each item
      for (const item of items) {
        const { product_id, amount } = item;

        if (!product_id || !amount || amount <= 0) {
          await t.rollback();
          return Boom.badRequest(
            'Product ID and amount are required for each item'
          );
        }

        // Find product
        const product = await Produk.findByPk(product_id, { transaction: t });
        if (!product) {
          await t.rollback();
          return Boom.notFound(`Product with ID ${product_id} not found`);
        }

        // Check stock
        if (product.Stok < amount) {
          await t.rollback();
          return Boom.badRequest(
            `Stock of ${product.Nama} is insufficient. Available: ${product.Stok}`
          );
        }

        const itemTotal = parseFloat(product.Harga) * amount;
        totalAmount += itemTotal;

        purchaseDetails.push({
          product,
          amount,
          item_total: itemTotal,
        });
      }

      // Check user balance
      if (parseFloat(user.Balance) < totalAmount) {
        await t.rollback();
        return Boom.badRequest(
          `Insufficient balance. Balance: ${user.Balance}, Total: ${totalAmount}`
        );
      }

      // Create purchase transaction
      const transaction = await Transaksi.create(
        {
          Customer_id: customer_id,
          Transaction_type: 'purchase',
          total_amount: totalAmount,
          Note: note || 'Product purchase',
          status: 'completed',
        },
        { transaction: t }
      );

      // Create transaction details and update stock
      for (const detail of purchaseDetails) {
        await Transaction_detail.create(
          {
            Transaction_id: transaction.id,
            Product_id: detail.product.id,
            amount: detail.amount,
          },
          { transaction: t }
        );

        // Update product stock
        await detail.product.update(
          {
            Stok: detail.product.Stok - detail.amount,
          },
          { transaction: t }
        );
      }

      // Update user balance
      const newBalance = parseFloat(user.Balance) - totalAmount;
      await user.update({ Balance: newBalance }, { transaction: t });

      await t.commit();

      return h
        .response({
          success: true,
          message: 'Purchase successful',
          data: {
            transaction,
            items: purchaseDetails.map((d) => ({
              product_name: d.product.Nama,
              amount: d.amount,
              price: d.product.Harga,
              total: d.item_total,
            })),
            total_amount: totalAmount,
            new_balance: newBalance,
          },
        })
        .code(201);
    } catch (error) {
      await t.rollback();
      console.error('Error creating purchase transaction:', error);
      return Boom.internal('Failed to process purchase');
    }
  },

  // 3. Create penalty transaction
  createPenaltyTransaction: async (request, h) => {
    const t = await sequelize.transaction();

    try {
      const { customer_id, amount, note } = request.payload;

      // Input validation
      if (!customer_id || !amount || amount <= 0) {
        await t.rollback();
        return Boom.badRequest(
          'Customer ID and amount are required and amount must be greater than 0'
        );
      }

      // Find user and verify student role
      const user = await User.findOne({
        where: { id: customer_id },
        include: [{ model: Role, as: 'role', where: { name: 'student' } }],
        transaction: t,
      });

      if (!user) {
        await t.rollback();
        return Boom.notFound('Student not found');
      }

      // Create penalty transaction (deduct balance)
      const transaction = await Transaksi.create(
        {
          Customer_id: customer_id,
          Transaction_type: 'penalty',
          total_amount: amount,
          Note: note || 'Penalty/Deduction',
          status: 'completed',
        },
        { transaction: t }
      );

      // Update user balance (deduct)
      const newBalance = parseFloat(user.Balance) - parseFloat(amount);
      await user.update({ Balance: newBalance }, { transaction: t });

      await t.commit();

      return h
        .response({
          success: true,
          message: 'Penalty transaction successful',
          data: {
            transaction,
            penalty_amount: amount,
            new_balance: newBalance,
          },
        })
        .code(201);
    } catch (error) {
      await t.rollback();
      console.error('Error creating penalty transaction:', error);
      return Boom.internal('Failed to create penalty transaction');
    }
  },

  // 4. Get all transactions
  getAllTransactions: async (request, h) => {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        type = 'all',
        status = 'all',
        startDate,
        endDate,
      } = request.query;

      const offset = (page - 1) * parseInt(limit);
      const whereClause = {};

      // Filter by transaction type
      if (type !== 'all') {
        whereClause.Transaction_type = type;
      }

      // Filter by status
      if (status !== 'all') {
        whereClause.status = status;
      }

      // Filter by date range
      if (startDate && endDate) {
        whereClause.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      }

      const { count, rows: transactions } = await Transaksi.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'customer',
            attributes: ['id', 'Nama', 'NIS', 'NISN', 'username'],
            include: [{ model: Role, as: 'role', attributes: ['name'] }],
          },
        ],
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: offset,
      });

      const totalPages = Math.ceil(count / parseInt(limit));

      return h
        .response({
          success: true,
          message: 'Transaction data retrieved successfully',
          data: {
            transactions,
            pagination: {
              currentPage: parseInt(page),
              totalPages,
              totalItems: count,
              itemsPerPage: parseInt(limit),
              hasNextPage: page < totalPages,
              hasPrevPage: page > 1,
            },
          },
        })
        .code(200);
    } catch (error) {
      console.error('Error getting all transactions:', error);
      return Boom.internal('Failed to retrieve transaction data');
    }
  },

  // 5. Get transaction by ID
  getTransactionById: async (request, h) => {
    try {
      const { id } = request.params;

      if (!id || isNaN(parseInt(id))) {
        return Boom.badRequest('Invalid transaction ID');
      }

      const transaction = await Transaksi.findByPk(parseInt(id), {
        include: [
          {
            model: User,
            as: 'customer',
            attributes: ['id', 'Nama', 'NIS', 'NISN', 'username', 'Balance'],
            include: [{ model: Role, as: 'role', attributes: ['name'] }],
          },
          {
            model: Transaction_detail,
            as: 'details',
            include: [
              {
                model: Produk,
                as: 'product',
                attributes: ['id', 'Nama', 'Harga'],
                include: [
                  { model: Category, as: 'category', attributes: ['Nama'] },
                ],
              },
            ],
          },
        ],
      });

      if (!transaction) {
        return Boom.notFound('Transaction not found');
      }

      return h
        .response({
          success: true,
          message: 'Transaction data retrieved successfully',
          data: transaction,
        })
        .code(200);
    } catch (error) {
      console.error('Error getting transaction by ID:', error);
      return Boom.internal('Failed to retrieve transaction data');
    }
  },

  // 6. Get transactions by student ID
  getTransactionsBySiswa: async (request, h) => {
    try {
      const { siswaId } = request.params;
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        type = 'all',
      } = request.query;

      if (!siswaId || isNaN(parseInt(siswaId))) {
        return Boom.badRequest('Invalid student ID');
      }

      // Pisahkan verifikasi student dengan query transactions
      // Pertama, cek apakah student dengan ID ini ada dan memiliki role student
      const student = await User.findOne({
        where: { id: parseInt(siswaId) },
        include: [
          {
            model: Role,
            as: 'role',
            where: { name: 'student' },
            required: true, // Pastikan hanya user dengan role student
          },
        ],
      });

      if (!student) {
        return Boom.notFound('Student not found or user is not a student');
      }

      const offset = (page - 1) * parseInt(limit);
      const whereClause = { Customer_id: parseInt(siswaId) };

      // Filter berdasarkan type jika bukan 'all'
      if (type !== 'all') {
        whereClause.Transaction_type = type;
      }

      // Query transactions terpisah tanpa filter role yang ketat
      const { count, rows: transactions } = await Transaksi.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Transaction_detail,
            as: 'details',
            required: false, // LEFT JOIN, tidak wajib ada detail
            include: [
              {
                model: Produk,
                as: 'product',
                attributes: ['id', 'Nama', 'Harga'],
                required: false, // LEFT JOIN, tidak wajib ada product
              },
            ],
          },
        ],
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: offset,
      });

      const totalPages = Math.ceil(count / parseInt(limit));

      return h
        .response({
          success: true,
          message: `Transactions for ${student.Nama} retrieved successfully`,
          data: {
            student: {
              id: student.id,
              nama: student.Nama,
              nis: student.NIS,
              nisn: student.NISN || null,
              balance: student.Balance,
            },
            transactions,
            pagination: {
              currentPage: parseInt(page),
              totalPages,
              totalItems: count,
              itemsPerPage: parseInt(limit),
              hasNextPage: page < totalPages,
              hasPrevPage: page > 1,
            },
          },
        })
        .code(200);
    } catch (error) {
      console.error('Error getting transactions by student:', error);
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
      return Boom.internal('Failed to retrieve student transactions');
    }
  },

  // 7. Get transaction history with time filters
  getTransactionHistory: async (request, h) => {
    try {
      const {
        startDate,
        endDate,
        siswaId,
        type = 'all',
        page = 1,
        limit = 50,
      } = request.query;

      const whereClause = {};
      const offset = (page - 1) * parseInt(limit);

      // Date filter
      if (startDate && endDate) {
        whereClause.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      }

      // Student filter
      if (siswaId) {
        whereClause.Customer_id = parseInt(siswaId);
      }

      // Transaction type filter
      if (type !== 'all') {
        whereClause.Transaction_type = type;
      }

      const { count, rows: transactions } = await Transaksi.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'customer',
            attributes: ['id', 'Nama', 'NIS', 'NISN'],
            include: [{ model: Role, as: 'role', attributes: ['name'] }],
          },
          {
            model: Transaction_detail,
            as: 'details',
            include: [
              {
                model: Produk,
                as: 'product',
                attributes: ['id', 'Nama', 'Harga'],
              },
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: offset,
      });

      // Transaction statistics
      const stats = await Transaksi.findAll({
        where: whereClause,
        attributes: [
          'Transaction_type',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'total'],
        ],
        group: ['Transaction_type'],
        raw: true,
      });

      const totalPages = Math.ceil(count / parseInt(limit));

      return h
        .response({
          success: true,
          message: 'Transaction history retrieved successfully',
          data: {
            transactions,
            statistics: stats,
            pagination: {
              currentPage: parseInt(page),
              totalPages,
              totalItems: count,
              itemsPerPage: parseInt(limit),
            },
            filters: {
              startDate: startDate || null,
              endDate: endDate || null,
              siswaId: siswaId || null,
              type,
            },
          },
        })
        .code(200);
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return Boom.internal('Failed to retrieve transaction history');
    }
  },

  // 8. Get transaction details with products
  getTransactionDetails: async (request, h) => {
    try {
      const { id } = request.params;

      if (!id || isNaN(parseInt(id))) {
        return Boom.badRequest('Invalid transaction ID');
      }

      const transaction = await Transaksi.findByPk(parseInt(id), {
        include: [
          {
            model: User,
            as: 'customer',
            attributes: ['id', 'Nama', 'NIS', 'NISN', 'username', 'Balance'],
            include: [{ model: Role, as: 'role', attributes: ['name'] }],
          },
          {
            model: Transaction_detail,
            as: 'details',
            include: [
              {
                model: Produk,
                as: 'product',
                attributes: ['id', 'Nama', 'Harga', 'Stok'],
                include: [
                  {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'Nama'],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!transaction) {
        return Boom.notFound('Transaction not found');
      }

      // Format details for more readable response
      const formattedDetails =
        transaction.details?.map((detail) => ({
          product_id: detail.Product_id,
          product_name: detail.product?.Nama || 'Product not found',
          product_price: detail.product?.Harga || 0,
          category: detail.product?.category?.Nama || null,
          quantity: detail.amount,
          subtotal: detail.product
            ? parseFloat(detail.product.Harga) * detail.amount
            : 0,
        })) || [];

      return h
        .response({
          success: true,
          message: 'Transaction details retrieved successfully',
          data: {
            transaction: {
              id: transaction.id,
              type: transaction.Transaction_type,
              total_amount: transaction.total_amount,
              note: transaction.Note,
              status: transaction.status,
              created_at: transaction.createdAt,
              updated_at: transaction.updatedAt,
            },
            customer: {
              id: transaction.customer.id,
              nama: transaction.customer.Nama,
              nis: transaction.customer.NIS,
              nisn: transaction.customer.NISN,
              username: transaction.customer.username,
              current_balance: transaction.customer.Balance,
              role: transaction.customer.role?.name,
            },
            items: formattedDetails,
            summary: {
              total_items: formattedDetails.length,
              total_quantity: formattedDetails.reduce(
                (sum, item) => sum + item.quantity,
                0
              ),
              total_amount: transaction.total_amount,
            },
          },
        })
        .code(200);
    } catch (error) {
      console.error('Error getting transaction details:', error);
      return Boom.internal('Failed to retrieve transaction details');
    }
  },

  // 9. Delete transaction (optional, for admin)
  deleteTransaction: async (request, h) => {
    const t = await sequelize.transaction();

    try {
      const { id } = request.params;
      const { reason } = request.payload || {};

      if (!id || isNaN(parseInt(id))) {
        return Boom.badRequest('Invalid transaction ID');
      }

      // Find transaction with details
      const transaction = await Transaksi.findByPk(parseInt(id), {
        include: [
          {
            model: User,
            as: 'customer',
          },
          {
            model: Transaction_detail,
            as: 'details',
            include: [{ model: Produk, as: 'product' }],
          },
        ],
        transaction: t,
      });

      if (!transaction) {
        await t.rollback();
        return Boom.notFound('Transaction not found');
      }

      // Can't delete completed transaction without reversal
      if (transaction.status === 'completed') {
        // For purchase transactions, restore product stock
        if (transaction.Transaction_type === 'purchase') {
          for (const detail of transaction.details) {
            if (detail.product) {
              await detail.product.update(
                {
                  Stok: detail.product.Stok + detail.amount,
                },
                { transaction: t }
              );
            }
          }
        }

        // Reversal balance based on transaction type
        const customer = transaction.customer;
        let newBalance = parseFloat(customer.Balance);

        switch (transaction.Transaction_type) {
          case 'topup':
            newBalance -= parseFloat(transaction.total_amount);
            break;
          case 'purchase':
          case 'penalty':
            newBalance += parseFloat(transaction.total_amount);
            break;
        }

        await customer.update({ Balance: newBalance }, { transaction: t });
      }

      // Delete transaction details first
      await Transaction_detail.destroy({
        where: { Transaction_id: parseInt(id) },
        transaction: t,
      });

      // Delete transaction
      await transaction.destroy({ transaction: t });

      await t.commit();

      return h
        .response({
          success: true,
          message: 'Transaction deleted successfully',
          data: {
            deleted_transaction_id: parseInt(id),
            transaction_type: transaction.Transaction_type,
            amount: transaction.total_amount,
            reason: reason || 'No reason provided',
            customer_new_balance: transaction.customer
              ? transaction.Transaction_type === 'topup'
                ? parseFloat(transaction.customer.Balance) -
                  parseFloat(transaction.total_amount)
                : parseFloat(transaction.customer.Balance) +
                  parseFloat(transaction.total_amount)
              : null,
          },
        })
        .code(200);
    } catch (error) {
      await t.rollback();
      console.error('Error deleting transaction:', error);
      return Boom.internal('Failed to delete transaction');
    }
  },
};

module.exports = transactionController;

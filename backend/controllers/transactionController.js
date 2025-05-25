// controllers/transactionController.js 
const {
  Transaksi,
  Transaction_detail,
  User,
  Produk,
  Category,
  Role,
} = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Boom = require('@hapi/boom');

const transactionController = {
  // 1. Membuat transaksi top-up saldo
  createTopupTransaction: async (request, h) => {
    const t = await sequelize.transaction();

    try {
      const { customer_id, amount, note } = request.payload;

      // Validasi input
      if (!customer_id || !amount || amount <= 0) {
        await t.rollback();
        return Boom.badRequest(
          'Customer ID dan amount wajib diisi dan amount harus lebih dari 0'
        );
      }

      // Cari user dan pastikan role student
      const user = await User.findOne({
        where: { id: customer_id },
        include: [{ model: Role, as: 'role', where: { name: 'student' } }],
        transaction: t,
      });

      if (!user) {
        await t.rollback();
        return Boom.notFound('Siswa tidak ditemukan');
      }

      // Buat transaksi top-up
      const transaksi = await Transaksi.create(
        {
          Customer_id: customer_id,
          Transaction_type: 'topup',
          total_amount: amount,
          Note: note || 'Top-up saldo',
          status: 'completed',
        },
        { transaction: t }
      );

      // Update balance user
      const newBalance = parseFloat(user.Balance) + parseFloat(amount);
      await user.update({ Balance: newBalance }, { transaction: t });

      await t.commit();

      return h
        .response({
          success: true,
          message: 'Top-up berhasil',
          data: {
            transaction: transaksi,
            new_balance: newBalance,
          },
        })
        .code(201);
    } catch (error) {
      await t.rollback();
      console.error('Error creating topup transaction:', error);
      return Boom.internal('Gagal melakukan top-up');
    }
  },

  // 2. Membuat transaksi pembelian
  createPurchaseTransaction: async (request, h) => {
    const t = await sequelize.transaction();

    try {
      const { customer_id, items, note } = request.payload;
      // items: [{ product_id: 1, amount: 2 }, { product_id: 2, amount: 1 }]

      // Validasi input
      if (
        !customer_id ||
        !items ||
        !Array.isArray(items) ||
        items.length === 0
      ) {
        await t.rollback();
        return Boom.badRequest('Customer ID dan items wajib diisi');
      }

      // Cari user dan pastikan role student
      const user = await User.findOne({
        where: { id: customer_id },
        include: [{ model: Role, as: 'role', where: { name: 'student' } }],
        transaction: t,
      });

      if (!user) {
        await t.rollback();
        return Boom.notFound('Siswa tidak ditemukan');
      }

      let totalAmount = 0;
      const purchaseDetails = [];

      // Validasi dan hitung total untuk setiap item
      for (const item of items) {
        const { product_id, amount } = item;

        if (!product_id || !amount || amount <= 0) {
          await t.rollback();
          return Boom.badRequest(
            'Product ID dan amount wajib diisi untuk setiap item'
          );
        }

        // Cari produk
        const produk = await Produk.findByPk(product_id, { transaction: t });
        if (!produk) {
          await t.rollback();
          return Boom.notFound(
            `Produk dengan ID ${product_id} tidak ditemukan`
          );
        }

        // Cek stok
        if (produk.Stok < amount) {
          await t.rollback();
          return Boom.badRequest(
            `Stok ${produk.Nama} tidak mencukupi. Stok tersedia: ${produk.Stok}`
          );
        }

        const itemTotal = parseFloat(produk.Harga) * amount;
        totalAmount += itemTotal;

        purchaseDetails.push({
          product: produk,
          amount: amount,
          item_total: itemTotal,
        });
      }

      // Cek saldo user
      if (parseFloat(user.Balance) < totalAmount) {
        await t.rollback();
        return Boom.badRequest(
          `Saldo tidak mencukupi. Saldo: ${user.Balance}, Total: ${totalAmount}`
        );
      }

      // Buat transaksi pembelian
      const transaksi = await Transaksi.create(
        {
          Customer_id: customer_id,
          Transaction_type: 'purchase',
          total_amount: totalAmount,
          Note: note || 'Pembelian produk',
          status: 'completed',
        },
        { transaction: t }
      );

      // Buat detail transaksi dan update stok
      for (const detail of purchaseDetails) {
        await Transaction_detail.create(
          {
            Transaction_id: transaksi.id,
            Product_id: detail.product.id,
            amount: detail.amount,
          },
          { transaction: t }
        );

        // Update stok produk
        await detail.product.update(
          {
            Stok: detail.product.Stok - detail.amount,
          },
          { transaction: t }
        );
      }

      // Update balance user
      const newBalance = parseFloat(user.Balance) - totalAmount;
      await user.update({ Balance: newBalance }, { transaction: t });

      await t.commit();

      return h
        .response({
          success: true,
          message: 'Pembelian berhasil',
          data: {
            transaction: transaksi,
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
      return Boom.internal('Gagal melakukan pembelian');
    }
  },

  // 3. Membuat transaksi penalty/denda
  createPenaltyTransaction: async (request, h) => {
    const t = await sequelize.transaction();

    try {
      const { customer_id, amount, note } = request.payload;

      // Validasi input
      if (!customer_id || !amount || amount <= 0) {
        await t.rollback();
        return Boom.badRequest(
          'Customer ID dan amount wajib diisi dan amount harus lebih dari 0'
        );
      }

      // Cari user dan pastikan role student
      const user = await User.findOne({
        where: { id: customer_id },
        include: [{ model: Role, as: 'role', where: { name: 'student' } }],
        transaction: t,
      });

      if (!user) {
        await t.rollback();
        return Boom.notFound('Siswa tidak ditemukan');
      }

      // Buat transaksi penalty (mengurangi saldo)
      const transaksi = await Transaksi.create(
        {
          Customer_id: customer_id,
          Transaction_type: 'penalty',
          total_amount: amount,
          Note: note || 'Denda/Penalty',
          status: 'completed',
        },
        { transaction: t }
      );

      // Update balance user (kurangi saldo)
      const newBalance = parseFloat(user.Balance) - parseFloat(amount);
      await user.update({ Balance: newBalance }, { transaction: t });

      await t.commit();

      return h
        .response({
          success: true,
          message: 'Transaksi penalty berhasil',
          data: {
            transaction: transaksi,
            penalty_amount: amount,
            new_balance: newBalance,
          },
        })
        .code(201);
    } catch (error) {
      await t.rollback();
      console.error('Error creating penalty transaction:', error);
      return Boom.internal('Gagal membuat transaksi penalty');
    }
  },

  // 4. Mendapatkan semua transaksi
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

      // Filter berdasarkan tipe transaksi
      if (type !== 'all') {
        whereClause.Transaction_type = type;
      }

      // Filter berdasarkan status
      if (status !== 'all') {
        whereClause.status = status;
      }

      // Filter berdasarkan tanggal
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
          message: 'Data transaksi berhasil diambil',
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
      return Boom.internal('Gagal mengambil data transaksi');
    }
  },

  // 5. Mendapatkan transaksi berdasarkan ID
  getTransactionById: async (request, h) => {
    try {
      const { id } = request.params;

      if (!id || isNaN(parseInt(id))) {
        return Boom.badRequest('ID transaksi tidak valid');
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
        return Boom.notFound('Transaksi tidak ditemukan');
      }

      return h
        .response({
          success: true,
          message: 'Data transaksi berhasil diambil',
          data: transaction,
        })
        .code(200);
    } catch (error) {
      console.error('Error getting transaction by ID:', error);
      return Boom.internal('Gagal mengambil data transaksi');
    }
  },

  // 6. Mendapatkan transaksi berdasarkan siswa ID
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
        return Boom.badRequest('ID siswa tidak valid');
      }

      // Pastikan siswa ada dan role student
      const siswa = await User.findOne({
        where: { id: parseInt(siswaId) },
        include: [{ model: Role, as: 'role', where: { name: 'student' } }],
      });

      if (!siswa) {
        return Boom.notFound('Siswa tidak ditemukan');
      }

      const offset = (page - 1) * parseInt(limit);
      const whereClause = { Customer_id: parseInt(siswaId) };

      if (type !== 'all') {
        whereClause.Transaction_type = type;
      }

      const { count, rows: transactions } = await Transaksi.findAndCountAll({
        where: whereClause,
        include: [
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
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: offset,
      });

      const totalPages = Math.ceil(count / parseInt(limit));

      return h
        .response({
          success: true,
          message: `Transaksi untuk ${siswa.Nama} berhasil diambil`,
          data: {
            siswa: {
              id: siswa.id,
              nama: siswa.Nama,
              nis: siswa.NIS,
              nisn: siswa.NISN,
              balance: siswa.Balance,
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
      console.error('Error getting transactions by siswa:', error);
      return Boom.internal('Gagal mengambil transaksi siswa');
    }
  },

  // 7. Mendapatkan riwayat transaksi dengan filter waktu
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

      // Filter tanggal
      if (startDate && endDate) {
        whereClause.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      }

      // Filter siswa
      if (siswaId) {
        whereClause.Customer_id = parseInt(siswaId);
      }

      // Filter tipe transaksi
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

      // Statistik transaksi
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
          message: 'Riwayat transaksi berhasil diambil',
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
      return Boom.internal('Gagal mengambil riwayat transaksi');
    }
  },

  // 8. Mendapatkan detail transaksi lengkap dengan produk
  getTransactionDetails: async (request, h) => {
    try {
      const { id } = request.params;

      if (!id || isNaN(parseInt(id))) {
        return Boom.badRequest('ID transaksi tidak valid');
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
        return Boom.notFound('Transaksi tidak ditemukan');
      }

      // Format detail untuk response yang lebih readable
      const formattedDetails =
        transaction.details?.map((detail) => ({
          product_id: detail.Product_id,
          product_name: detail.product?.Nama || 'Produk tidak ditemukan',
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
          message: 'Detail transaksi berhasil diambil',
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
      return Boom.internal('Gagal mengambil detail transaksi');
    }
  },

  // 9. Menghapus transaksi (opsional, untuk admin)
  deleteTransaction: async (request, h) => {
    const t = await sequelize.transaction();

    try {
      const { id } = request.params;
      const { reason } = request.payload || {};

      if (!id || isNaN(parseInt(id))) {
        return Boom.badRequest('ID transaksi tidak valid');
      }

      // Cari transaksi dengan detail
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
        return Boom.notFound('Transaksi tidak ditemukan');
      }

      // Tidak bisa hapus transaksi yang sudah selesai tanpa reversal
      if (transaction.status === 'completed') {
        // Untuk transaksi purchase, kembalikan stok produk
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

        // Reversal balance berdasarkan tipe transaksi
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

      // Hapus detail transaksi terlebih dahulu
      await Transaction_detail.destroy({
        where: { Transaction_id: parseInt(id) },
        transaction: t,
      });

      // Hapus transaksi
      await transaction.destroy({ transaction: t });

      await t.commit();

      return h
        .response({
          success: true,
          message: 'Transaksi berhasil dihapus',
          data: {
            deleted_transaction_id: parseInt(id),
            transaction_type: transaction.Transaction_type,
            amount: transaction.total_amount,
            reason: reason || 'Tidak ada alasan',
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
      return Boom.internal('Gagal menghapus transaksi');
    }
  },
};

module.exports = transactionController;

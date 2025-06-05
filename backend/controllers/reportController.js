// controllers/reportController.js
const {
  Transaksi,
  Transaction_detail,
  User,
  Produk,
  Category,
  Role,
} = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../config/config.json');
const Boom = require('@hapi/boom');

const reportController = {
  // 1. Ringkasan transaksi - Total transaksi, topup, pengeluaran
  getTransactionSummary: async (request, h) => {
    try {
      const { startDate, endDate, period = 'all' } = request.query;

      let dateFilter = {};

      // Filter berdasarkan periode
      if (period !== 'all') {
        const now = new Date();
        switch (period) {
          case 'today':
            dateFilter.createdAt = {
              [Op.gte]: new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
              ),
            };
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            dateFilter.createdAt = { [Op.gte]: weekAgo };
            break;
          case 'month':
            dateFilter.createdAt = {
              [Op.gte]: new Date(now.getFullYear(), now.getMonth(), 1),
            };
            break;
          case 'year':
            dateFilter.createdAt = {
              [Op.gte]: new Date(now.getFullYear(), 0, 1),
            };
            break;
        }
      }

      // Custom date range
      if (startDate && endDate) {
        dateFilter.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      }

      // Summary berdasarkan tipe transaksi
      const transactionSummary = await Transaksi.findAll({
        where: { ...dateFilter, status: 'completed' },
        attributes: [
          'Transaction_type',
          [fn('COUNT', col('id')), 'total_transactions'],
          [fn('SUM', col('total_amount')), 'total_amount'],
          [fn('AVG', col('total_amount')), 'average_amount'],
        ],
        group: ['Transaction_type'],
        raw: true,
      });

      // Total keseluruhan
      const totalSummary = await Transaksi.findOne({
        where: { ...dateFilter, status: 'completed' },
        attributes: [
          [fn('COUNT', col('id')), 'total_all_transactions'],
          [fn('SUM', col('total_amount')), 'total_all_amount'],
        ],
        raw: true,
      });

      // Transaksi harian (untuk grafik)
      const dailyTransactions = await Transaksi.findAll({
        where: { ...dateFilter, status: 'completed' },
        attributes: [
          [fn('DATE', col('createdAt')), 'date'],
          [fn('COUNT', col('id')), 'transaction_count'],
          [fn('SUM', col('total_amount')), 'daily_total'],
        ],
        group: [fn('DATE', col('createdAt'))],
        order: [[fn('DATE', col('createdAt')), 'ASC']],
        raw: true,
      });

      // Format data untuk response
      const summaryByType = {};
      transactionSummary.forEach((item) => {
        summaryByType[item.Transaction_type] = {
          count: parseInt(item.total_transactions),
          total_amount: parseFloat(item.total_amount || 0),
          average_amount: parseFloat(item.average_amount || 0),
        };
      });

      return h
        .response({
          success: true,
          message: 'Ringkasan transaksi berhasil diambil',
          data: {
            period: period,
            date_range: {
              start: startDate || null,
              end: endDate || null,
            },
            overall_summary: {
              total_transactions: parseInt(
                totalSummary.total_all_transactions || 0
              ),
              total_amount: parseFloat(totalSummary.total_all_amount || 0),
              average_per_transaction:
                totalSummary.total_all_transactions > 0
                  ? parseFloat(totalSummary.total_all_amount) /
                    parseInt(totalSummary.total_all_transactions)
                  : 0,
            },
            by_transaction_type: summaryByType,
            daily_breakdown: dailyTransactions.map((day) => ({
              date: day.date,
              transaction_count: parseInt(day.transaction_count),
              total_amount: parseFloat(day.daily_total),
            })),
          },
        })
        .code(200);
    } catch (error) {
      console.error('Error getting transaction summary:', error);
      throw Boom.internal('Gagal mengambil ringkasan transaksi', error);
    }
  },

  // 2. Mendapatkan saldo semua siswa
  getSaldoAllSiswa: async (request, h) => {
    try {
      const {
        sortBy = 'Balance',
        sortOrder = 'DESC',
        minBalance,
        maxBalance,
        page = 1,
        limit = 50,
      } = request.query;

      const offset = (page - 1) * parseInt(limit);
      let whereClause = {};

      // Filter berdasarkan range balance
      if (minBalance !== undefined || maxBalance !== undefined) {
        whereClause.Balance = {};
        if (minBalance !== undefined)
          whereClause.Balance[Op.gte] = parseFloat(minBalance);
        if (maxBalance !== undefined)
          whereClause.Balance[Op.lte] = parseFloat(maxBalance);
      }

      const { count, rows: siswaBalances } = await User.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Role,
            as: 'role',
            where: { name: 'student' },
            attributes: ['name'],
          },
        ],
        attributes: [
          'id',
          'NIS',
          'NISN',
          'Nama',
          'username',
          'Balance',
          'is_active',
        ],
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: offset,
      });

      // Statistik saldo
      const balanceStats = await User.findOne({
        include: [
          {
            model: Role,
            as: 'role',
            where: { name: 'student' },
          },
        ],
        attributes: [
          [fn('SUM', col('Balance')), 'total_balance'],
          [fn('AVG', col('Balance')), 'average_balance'],
          [fn('MIN', col('Balance')), 'min_balance'],
          [fn('MAX', col('Balance')), 'max_balance'],
          [fn('COUNT', col('User.id')), 'total_students'],
        ],
        raw: true,
      });

      // Distribusi saldo
      const balanceDistribution = await User.findAll({
        include: [
          {
            model: Role,
            as: 'role',
            where: { name: 'student' },
          },
        ],
        attributes: [
          [
            literal(`
                CASE 
                  WHEN "Balance" = 0 THEN 'Zero Balance'
                  WHEN "Balance" > 0 AND "Balance" <= 10000 THEN '1-10K'
                  WHEN "Balance" > 10000 AND "Balance" <= 50000 THEN '10K-50K'
                  WHEN "Balance" > 50000 AND "Balance" <= 100000 THEN '50K-100K'
                  WHEN "Balance" > 100000 THEN 'Above 100K'
                END
              `),
            'balance_range',
          ],
          [fn('COUNT', col('User.id')), 'student_count'],
        ],
        group: [
          literal(`
            CASE 
              WHEN "Balance" = 0 THEN 'Zero Balance'
              WHEN "Balance" > 0 AND "Balance" <= 10000 THEN '1-10K'
              WHEN "Balance" > 10000 AND "Balance" <= 50000 THEN '10K-50K'
              WHEN "Balance" > 50000 AND "Balance" <= 100000 THEN '50K-100K'
              WHEN "Balance" > 100000 THEN 'Above 100K'
            END
          `),
        ],
        raw: true,
      });

      const totalPages = Math.ceil(count / parseInt(limit));

      return h
        .response({
          success: true,
          message: 'Data saldo siswa berhasil diambil',
          data: {
            students: siswaBalances,
            statistics: {
              total_students: parseInt(balanceStats.total_students || 0),
              total_balance: parseFloat(balanceStats.total_balance || 0),
              average_balance: parseFloat(balanceStats.average_balance || 0),
              min_balance: parseFloat(balanceStats.min_balance || 0),
              max_balance: parseFloat(balanceStats.max_balance || 0),
            },
            balance_distribution: balanceDistribution.map((item) => ({
              range: item.balance_range,
              count: parseInt(item.student_count),
            })),
            pagination: {
              currentPage: parseInt(page),
              totalPages,
              totalItems: count,
              itemsPerPage: parseInt(limit),
            },
          },
        })
        .code(200);
    } catch (error) {
      console.error('Error getting saldo all siswa:', error);
      throw Boom.internal('Gagal mengambil data saldo siswa', error);
    }
  },

  // 3. Mendapatkan transaksi berdasarkan range tanggal
  getTransactionsByDateRange: async (request, h) => {
    try {
      const {
        startDate,
        endDate,
        type = 'all',
        page = 1,
        limit = 20,
      } = request.query;

      if (!startDate || !endDate) {
        throw Boom.badRequest('Start date dan end date wajib diisi');
      }

      const offset = (page - 1) * parseInt(limit);
      let whereClause = {
        createdAt: {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        },
      };

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

      // Summary untuk periode ini
      const periodSummary = await Transaksi.findAll({
        where: whereClause,
        attributes: [
          'Transaction_type',
          [fn('COUNT', col('id')), 'count'],
          [fn('SUM', col('total_amount')), 'total'],
        ],
        group: ['Transaction_type'],
        raw: true,
      });

      // Transaksi per hari dalam periode
      const dailyBreakdown = await Transaksi.findAll({
        where: whereClause,
        attributes: [
          [fn('DATE', col('createdAt')), 'date'],
          'Transaction_type',
          [fn('COUNT', col('id')), 'count'],
          [fn('SUM', col('total_amount')), 'total'],
        ],
        group: [fn('DATE', col('createdAt')), 'Transaction_type'],
        order: [[fn('DATE', col('createdAt')), 'ASC']],
        raw: true,
      });

      const totalPages = Math.ceil(count / parseInt(limit));

      return h
        .response({
          success: true,
          message: 'Transaksi berdasarkan range tanggal berhasil diambil',
          data: {
            date_range: {
              start: startDate,
              end: endDate,
            },
            transactions,
            summary_by_type: periodSummary.map((item) => ({
              type: item.Transaction_type,
              count: parseInt(item.count),
              total_amount: parseFloat(item.total || 0),
            })),
            daily_breakdown: dailyBreakdown.map((item) => ({
              date: item.date,
              type: item.Transaction_type,
              count: parseInt(item.count),
              total: parseFloat(item.total || 0),
            })),
            pagination: {
              currentPage: parseInt(page),
              totalPages,
              totalItems: count,
              itemsPerPage: parseInt(limit),
            },
          },
        })
        .code(200);
    } catch (error) {
      if (Boom.isBoom(error)) {
        throw error;
      }
      console.error('Error getting transactions by date range:', error);
      throw Boom.internal(
        'Gagal mengambil transaksi berdasarkan tanggal',
        error
      );
    }
  },

  // 4. Mendapatkan produk terlaris
  getBestSellingProducts: async (request, h) => {
    try {
      const { limit = 10, startDate, endDate } = request.query;

      let transactionFilter = {};
      if (startDate && endDate) {
        transactionFilter.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      }

      const bestSellingProducts = await Transaction_detail.findAll({
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
          {
            model: Transaksi,
            as: 'transaction',
            where: {
              ...transactionFilter,
              Transaction_type: 'purchase',
              status: 'completed',
            },
            attributes: [],
          },
        ],
        attributes: [
          'Product_id',
          [fn('SUM', col('amount')), 'total_sold'],
          [fn('COUNT', col('Transaction_detail.id')), 'transaction_count'],
          [
            fn(
              'SUM',
              literal(
                'amount * (SELECT "Harga" FROM "Produks" WHERE "id" = "Transaction_detail"."Product_id")'
              )
            ),
            'total_revenue',
          ],
        ],
        group: ['Product_id', 'product.id', 'product.category.id'],
        order: [[fn('SUM', col('amount')), 'DESC']],
        limit: parseInt(limit),
        raw: false,
      });

      // Format hasil
      const formattedResults = bestSellingProducts.map((item) => ({
        product_id: item.Product_id,
        product_name: item.product?.Nama || 'Produk tidak ditemukan',
        category: item.product?.category?.Nama || null,
        current_price: parseFloat(item.product?.Harga || 0),
        current_stock: item.product?.Stok || 0,
        total_sold: parseInt(item.dataValues.total_sold),
        transaction_count: parseInt(item.dataValues.transaction_count),
        total_revenue: parseFloat(item.dataValues.total_revenue || 0),
        average_per_transaction:
          parseInt(item.dataValues.total_sold) /
          parseInt(item.dataValues.transaction_count),
      }));

      return h
        .response({
          success: true,
          message: 'Produk terlaris berhasil diambil',
          data: {
            date_range: {
              start: startDate || null,
              end: endDate || null,
            },
            best_selling_products: formattedResults,
            summary: {
              total_products_analyzed: formattedResults.length,
              total_items_sold: formattedResults.reduce(
                (sum, item) => sum + item.total_sold,
                0
              ),
              total_revenue: formattedResults.reduce(
                (sum, item) => sum + item.total_revenue,
                0
              ),
            },
          },
        })
        .code(200);
    } catch (error) {
      console.error('Error getting best selling products:', error);
      throw Boom.internal('Gagal mengambil data produk terlaris', error);
    }
  },

  // 5. Mendapatkan kategori populer
  getPopularCategories: async (request, h) => {
    try {
      const { startDate, endDate } = request.query;

      let transactionFilter = {};
      if (startDate && endDate) {
        transactionFilter.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      }

      const popularCategories = await Transaction_detail.findAll({
        include: [
          {
            model: Produk,
            as: 'product',
            attributes: ['Category_id'],
            include: [
              {
                model: Category,
                as: 'category',
                attributes: ['id', 'Nama'],
              },
            ],
          },
          {
            model: Transaksi,
            as: 'transaction',
            where: {
              ...transactionFilter,
              Transaction_type: 'purchase',
              status: 'completed',
            },
            attributes: [],
          },
        ],
        attributes: [
          [fn('SUM', col('amount')), 'total_items_sold'],
          [fn('COUNT', col('Transaction_detail.id')), 'total_transactions'],
          [
            fn('COUNT', fn('DISTINCT', col('Transaction_detail.Product_id'))),
            'unique_products',
          ],
          [
            fn(
              'SUM',
              literal(
                'amount * (SELECT "Harga" FROM "Produks" WHERE "id" = "Transaction_detail"."Product_id")'
              )
            ),
            'total_revenue',
          ],
        ],
        group: ['product.category.id', 'product.Category_id'],
        having: literal('"product"."category"."id" IS NOT NULL'),
        order: [[fn('SUM', col('amount')), 'DESC']],
        raw: false,
      });

      // Format hasil
      const formattedResults = popularCategories
        .map((item) => ({
          category_id: item.product?.category?.id,
          category_name:
            item.product?.category?.Nama || 'Kategori tidak ditemukan',
          total_items_sold: parseInt(item.dataValues.total_items_sold),
          total_transactions: parseInt(item.dataValues.total_transactions),
          unique_products: parseInt(item.dataValues.unique_products),
          total_revenue: parseFloat(item.dataValues.total_revenue || 0),
          average_per_transaction:
            parseInt(item.dataValues.total_items_sold) /
            parseInt(item.dataValues.total_transactions),
        }))
        .filter((item) => item.category_id); // Filter out null categories

      // Top products per kategori
      for (let category of formattedResults.slice(0, 5)) {
        // Top 5 categories
        const topProducts = await Transaction_detail.findAll({
          include: [
            {
              model: Produk,
              as: 'product',
              where: { Category_id: category.category_id },
              attributes: ['id', 'Nama', 'Harga'],
            },
            {
              model: Transaksi,
              as: 'transaction',
              where: {
                ...transactionFilter,
                Transaction_type: 'purchase',
                status: 'completed',
              },
              attributes: [],
            },
          ],
          attributes: ['Product_id', [fn('SUM', col('amount')), 'total_sold']],
          group: ['Product_id', 'product.id'],
          order: [[fn('SUM', col('amount')), 'DESC']],
          limit: 3,
          raw: false,
        });

        category.top_products = topProducts.map((prod) => ({
          product_id: prod.Product_id,
          product_name: prod.product?.Nama,
          total_sold: parseInt(prod.dataValues.total_sold),
        }));
      }

      return h
        .response({
          success: true,
          message: 'Kategori populer berhasil diambil',
          data: {
            date_range: {
              start: startDate || null,
              end: endDate || null,
            },
            popular_categories: formattedResults,
            summary: {
              total_categories: formattedResults.length,
              total_items_sold: formattedResults.reduce(
                (sum, item) => sum + item.total_items_sold,
                0
              ),
              total_revenue: formattedResults.reduce(
                (sum, item) => sum + item.total_revenue,
                0
              ),
            },
          },
        })
        .code(200);
    } catch (error) {
      console.error('Error getting popular categories:', error);
      throw Boom.internal('Gagal mengambil data kategori populer', error);
    }
  },

  // 6. Laporan siswa individual
  getSiswaReport: async (request, h) => {
    try {
      const { siswaId } = request.params;
      const { startDate, endDate } = request.query;

      if (!siswaId || isNaN(parseInt(siswaId))) {
        throw Boom.badRequest('ID siswa tidak valid');
      }

      // Ambil data siswa
      const siswa = await User.findOne({
        where: { id: parseInt(siswaId) },
        include: [
          {
            model: Role,
            as: 'role',
            where: { name: 'student' },
          },
        ],
        attributes: [
          'id',
          'NIS',
          'NISN',
          'Nama',
          'username',
          'Balance',
          'is_active',
          'createdAt',
        ],
      });

      if (!siswa) {
        throw Boom.notFound('Siswa tidak ditemukan');
      }

      let dateFilter = { Customer_id: parseInt(siswaId) };
      if (startDate && endDate) {
        dateFilter.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      }

      // Summary transaksi siswa
      const transactionSummary = await Transaksi.findAll({
        where: { ...dateFilter, status: 'completed' },
        attributes: [
          'Transaction_type',
          [fn('COUNT', col('id')), 'count'],
          [fn('SUM', col('total_amount')), 'total'],
        ],
        group: ['Transaction_type'],
        raw: true,
      });

      // Transaksi terakhir
      const recentTransactions = await Transaksi.findAll({
        where: dateFilter,
        include: [
          {
            model: Transaction_detail,
            as: 'details',
            include: [
              {
                model: Produk,
                as: 'product',
                attributes: ['Nama', 'Harga'],
              },
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: 10,
      });

      // Produk yang sering dibeli
      const favoriteProducts = await Transaction_detail.findAll({
        include: [
          {
            model: Transaksi,
            as: 'transaction',
            where: {
              ...dateFilter,
              Transaction_type: 'purchase',
              status: 'completed',
            },
            attributes: [],
          },
          {
            model: Produk,
            as: 'product',
            attributes: ['id', 'Nama', 'Harga'],
          },
        ],
        attributes: [
          'Product_id',
          [fn('SUM', col('amount')), 'total_bought'],
          [fn('COUNT', col('Transaction_detail.id')), 'transaction_count'],
        ],
        group: ['Product_id', 'product.id'],
        order: [[fn('SUM', col('amount')), 'DESC']],
        limit: 5,
        raw: false,
      });

      // Spending pattern (pengeluaran per bulan)
      const monthlySpending = await Transaksi.findAll({
        where: {
          Customer_id: parseInt(siswaId),
          Transaction_type: ['purchase', 'penalty'],
          status: 'completed',
        },
        attributes: [
          [fn('DATE_TRUNC', 'month', col('createdAt')), 'month'],
          [fn('SUM', col('total_amount')), 'total_spent'],
        ],
        group: [fn('DATE_TRUNC', 'month', col('createdAt'))],
        order: [[fn('DATE_TRUNC', 'month', col('createdAt')), 'ASC']],
        raw: true,
      });

      // Format summary
      const summaryByType = {};
      transactionSummary.forEach((item) => {
        summaryByType[item.Transaction_type] = {
          count: parseInt(item.count),
          total_amount: parseFloat(item.total || 0),
        };
      });

      return h
        .response({
          success: true,
          message: 'Laporan siswa berhasil diambil',
          data: {
            student_info: {
              id: siswa.id,
              nis: siswa.NIS,
              nisn: siswa.NISN,
              nama: siswa.Nama,
              username: siswa.username,
              current_balance: parseFloat(siswa.Balance),
              is_active: siswa.is_active,
              member_since: siswa.createdAt,
            },
            report_period: {
              start: startDate || 'All time',
              end: endDate || 'Present',
            },
            transaction_summary: summaryByType,
            recent_transactions: recentTransactions,
            favorite_products: favoriteProducts.map((item) => ({
              product_id: item.Product_id,
              product_name: item.product?.Nama,
              total_bought: parseInt(item.dataValues.total_bought),
              transaction_count: parseInt(item.dataValues.transaction_count),
            })),
            monthly_spending: monthlySpending.map((item) => ({
              month: item.month,
              total_spent: parseFloat(item.total_spent),
            })),
            statistics: {
              total_transactions: Object.values(summaryByType).reduce(
                (sum, item) => sum + item.count,
                0
              ),
              total_spent:
                (summaryByType.purchase?.total_amount || 0) +
                (summaryByType.penalty?.total_amount || 0),
              total_topup: summaryByType.topup?.total_amount || 0,
              average_transaction:
                Object.values(summaryByType).reduce(
                  (sum, item) => sum + item.count,
                  0
                ) > 0
                  ? Object.values(summaryByType).reduce(
                      (sum, item) => sum + item.total_amount,
                      0
                    ) /
                    Object.values(summaryByType).reduce(
                      (sum, item) => sum + item.count,
                      0
                    )
                  : 0,
            },
          },
        })
        .code(200);
    } catch (error) {
      if (Boom.isBoom(error)) {
        throw error;
      }
      console.error('Error getting siswa report:', error);
      throw Boom.internal('Gagal mengambil laporan siswa', error);
    }
  },

  // 7. Export laporan (lengkap dengan berbagai format)
  exportReport: async (request, h) => {
    try {
      const { format = 'json', reportType = 'transaction_summary' } =
        request.query;

      // Validasi format
      if (!['json', 'csv'].includes(format)) {
        throw Boom.badRequest(
          'Format tidak didukung saat ini. Gunakan: json atau csv'
        );
      }

      let reportData = {};

      // Generate data berdasarkan tipe laporan
      switch (reportType) {
        case 'transaction_summary':
          const mockRequest = { query: request.query };
          const mockH = {
            response: (data) => ({ code: () => data }),
          };
          const result = await this.getTransactionSummary(mockRequest, mockH);
          reportData = result;
          break;

        case 'student_balances':
          const reqBalance = { query: { ...request.query, limit: 1000 } }; // Export semua data
          const resultBalance = await this.getSaldoAllSiswa(reqBalance, {
            response: (data) => ({ code: () => data }),
          });
          reportData = resultBalance;
          break;

        case 'best_selling_products':
          const reqProducts = { query: { ...request.query, limit: 100 } };
          const resultProducts = await this.getBestSellingProducts(
            reqProducts,
            {
              response: (data) => ({ code: () => data }),
            }
          );
          reportData = resultProducts;
          break;

        default:
          throw Boom.badRequest(
            'Tipe laporan tidak valid. Gunakan: transaction_summary, student_balances, atau best_selling_products'
          );
      }

      // Handle different export formats
      switch (format) {
        case 'json':
          return h
            .response({
              success: true,
              message: 'Laporan berhasil diekspor dalam format JSON',
              data: reportData,
              export_info: {
                format: 'JSON',
                generated_at: new Date().toISOString(),
                report_type: reportType,
              },
            })
            .code(200);

        case 'csv':
          // Function untuk convert JSON ke CSV
          const convertToCSV = (data, reportType) => {
            let csvContent = '';

            switch (reportType) {
              case 'transaction_summary':
                // Header untuk transaction summary
                csvContent =
                  'Date,Transaction Type,Count,Total Amount,Average Amount\n';

                // Overall summary
                csvContent += `Overall Summary,All Types,${data.data.overall_summary.total_transactions},${data.data.overall_summary.total_amount},${data.data.overall_summary.average_per_transaction}\n`;

                // By transaction type
                Object.entries(data.data.by_transaction_type).forEach(
                  ([type, details]) => {
                    csvContent += `,${type},${details.count},${details.total_amount},${details.average_amount}\n`;
                  }
                );

                // Daily breakdown
                csvContent += '\nDaily Breakdown\n';
                csvContent += 'Date,Transaction Count,Total Amount\n';
                data.data.daily_breakdown.forEach((day) => {
                  csvContent += `${day.date},${day.transaction_count},${day.total_amount}\n`;
                });
                break;

              case 'student_balances':
                // Header untuk student balances
                csvContent =
                  'Student ID,NIS,NISN,Name,Username,Balance,Active Status\n';

                data.data.students.forEach((student) => {
                  csvContent += `${student.id},${student.NIS || ''},${
                    student.NISN || ''
                  },${student.Nama},${student.username},${student.Balance},${
                    student.is_active
                  }\n`;
                });

                // Add statistics
                csvContent += '\nStatistics\n';
                csvContent += 'Metric,Value\n';
                csvContent += `Total Students,${data.data.statistics.total_students}\n`;
                csvContent += `Total Balance,${data.data.statistics.total_balance}\n`;
                csvContent += `Average Balance,${data.data.statistics.average_balance}\n`;
                csvContent += `Min Balance,${data.data.statistics.min_balance}\n`;
                csvContent += `Max Balance,${data.data.statistics.max_balance}\n`;
                break;

              case 'best_selling_products':
                // Header untuk best selling products
                csvContent =
                  'Product ID,Product Name,Category,Current Price,Current Stock,Total Sold,Transaction Count,Total Revenue,Average Per Transaction\n';

                data.data.best_selling_products.forEach((product) => {
                  csvContent += `${product.product_id},"${
                    product.product_name
                  }","${product.category || ''}",${product.current_price},${
                    product.current_stock
                  },${product.total_sold},${product.transaction_count},${
                    product.total_revenue
                  },${product.average_per_transaction}\n`;
                });

                // Add summary
                csvContent += '\nSummary\n';
                csvContent += 'Metric,Value\n';
                csvContent += `Total Products Analyzed,${data.data.summary.total_products_analyzed}\n`;
                csvContent += `Total Items Sold,${data.data.summary.total_items_sold}\n`;
                csvContent += `Total Revenue,${data.data.summary.total_revenue}\n`;
                break;

              default:
                csvContent = 'Error: Unsupported report type for CSV export\n';
            }

            return csvContent;
          };

          const csvData = convertToCSV(reportData, reportType);

          return h
            .response(csvData)
            .type('text/csv')
            .header(
              'Content-Disposition',
              `attachment; filename="${reportType}_${
                new Date().toISOString().split('T')[0]
              }.csv"`
            )
            .code(200);

        default:
          throw Boom.badRequest('Format tidak didukung');
      }
    } catch (error) {
      if (Boom.isBoom(error)) {
        throw error;
      }
      console.error('Error exporting report:', error);
      throw Boom.internal('Gagal mengekspor laporan', error);
    }
  },

  // 8. Dashboard analytics - Kombinasi berbagai metrics untuk dashboard
  getDashboardAnalytics: async (request, h) => {
    try {
      const { period = 'today' } = request.query;

      let dateFilter = {};
      const now = new Date();

      // Set date filter based on period
      switch (period) {
        case 'today':
          dateFilter.createdAt = {
            [Op.gte]: new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate()
            ),
          };
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFilter.createdAt = { [Op.gte]: weekAgo };
          break;
        case 'month':
          dateFilter.createdAt = {
            [Op.gte]: new Date(now.getFullYear(), now.getMonth(), 1),
          };
          break;
        case 'year':
          dateFilter.createdAt = {
            [Op.gte]: new Date(now.getFullYear(), 0, 1),
          };
          break;
      }

      // Parallel queries untuk performa yang lebih baik
      const [
        transactionStats,
        studentStats,
        topProducts,
        recentTransactions,
        balanceDistribution,
        hourlyTransactions,
      ] = await Promise.all([
        // Transaction statistics
        Transaksi.findAll({
          where: { ...dateFilter, status: 'completed' },
          attributes: [
            'Transaction_type',
            [fn('COUNT', col('id')), 'count'],
            [fn('SUM', col('total_amount')), 'total'],
          ],
          group: ['Transaction_type'],
          raw: true,
        }),

        // Student statistics
        User.findOne({
          include: [{ model: Role, as: 'role', where: { name: 'student' } }],
          attributes: [
            [fn('COUNT', col('User.id')), 'total_students'],
            [fn('SUM', col('Balance')), 'total_balance'],
            [fn('AVG', col('Balance')), 'average_balance'],
            [
              fn('COUNT', literal('CASE WHEN "Balance" > 0 THEN 1 END')),
              'students_with_balance',
            ],
          ],
          raw: true,
        }),

        // Top 5 products for the period
        Transaction_detail.findAll({
          include: [
            {
              model: Produk,
              as: 'product',
              attributes: ['Nama'],
            },
            {
              model: Transaksi,
              as: 'transaction',
              where: {
                ...dateFilter,
                Transaction_type: 'purchase',
                status: 'completed',
              },
              attributes: [],
            },
          ],
          attributes: ['Product_id', [fn('SUM', col('amount')), 'total_sold']],
          group: ['Product_id', 'product.id'],
          order: [[fn('SUM', col('amount')), 'DESC']],
          limit: 5,
          raw: false,
        }),

        // Recent transactions (last 10)
        Transaksi.findAll({
          where: dateFilter,
          include: [
            {
              model: User,
              as: 'customer',
              attributes: ['Nama', 'NIS'],
            },
          ],
          attributes: [
            'id',
            'Transaction_type',
            'total_amount',
            'createdAt',
            'status',
          ],
          order: [['createdAt', 'DESC']],
          limit: 10,
        }),

        // Balance distribution for pie chart
        User.findAll({
          include: [{ model: Role, as: 'role', where: { name: 'student' } }],
          attributes: [
            [
              literal(`
                  CASE 
                    WHEN "Balance" = 0 THEN 'Zero'
                    WHEN "Balance" > 0 AND "Balance" <= 10000 THEN 'Low (1-10K)'
                    WHEN "Balance" > 10000 AND "Balance" <= 50000 THEN 'Medium (10K-50K)'
                    WHEN "Balance" > 50000 THEN 'High (>50K)'
                  END
                `),
              'range',
            ],
            [fn('COUNT', col('User.id')), 'count'],
          ],
          group: [
            literal(`
                CASE 
                  WHEN "Balance" = 0 THEN 'Zero'
                  WHEN "Balance" > 0 AND "Balance" <= 10000 THEN 'Low (1-10K)'
                  WHEN "Balance" > 10000 AND "Balance" <= 50000 THEN 'Medium (10K-50K)'
                  WHEN "Balance" > 50000 THEN 'High (>50K)'
                                    END
                                  `),
          ],
          raw: true,
        }),

        // Hourly transaction pattern (for today only)
        period === 'today'
          ? Transaksi.findAll({
              where: {
                createdAt: {
                  [Op.gte]: new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate()
                  ),
                },
                status: 'completed',
              },
              attributes: [
                [fn('EXTRACT', literal('HOUR FROM "createdAt"')), 'hour'],
                [fn('COUNT', col('id')), 'count'],
              ],
              group: [fn('EXTRACT', literal('HOUR FROM "createdAt"'))],
              order: [[fn('EXTRACT', literal('HOUR FROM "createdAt"')), 'ASC']],
              raw: true,
            })
          : Promise.resolve([]),
      ]);

      // Format transaction stats
      const transactionSummary = {};
      let totalTransactions = 0;
      let totalAmount = 0;

      transactionStats.forEach((stat) => {
        const count = parseInt(stat.count);
        const amount = parseFloat(stat.total || 0);

        transactionSummary[stat.Transaction_type] = {
          count,
          total_amount: amount,
        };

        totalTransactions += count;
        totalAmount += amount;
      });

      // Format top products
      const topProductsFormatted = topProducts.map((item) => ({
        product_id: item.Product_id,
        product_name: item.product?.Nama || 'Unknown Product',
        total_sold: parseInt(item.dataValues.total_sold),
      }));

      // Recent activity
      const recentActivity = recentTransactions.map((tx) => ({
        id: tx.id,
        type: tx.Transaction_type,
        customer_name: tx.customer?.Nama || 'Unknown',
        customer_nis: tx.customer?.NIS || '',
        amount: parseFloat(tx.total_amount),
        status: tx.status,
        created_at: tx.createdAt,
        time_ago: getTimeAgo(tx.createdAt),
      }));

      // Balance distribution for charts
      const balanceChart = balanceDistribution.map((item) => ({
        label: item.range,
        value: parseInt(item.count),
      }));

      // Hourly pattern for today
      const hourlyPattern = hourlyTransactions.map((item) => ({
        hour: parseInt(item.hour),
        transactions: parseInt(item.count),
      }));

      return h
        .response({
          success: true,
          message: 'Dashboard analytics berhasil diambil',
          data: {
            period,
            generated_at: new Date().toISOString(),
            overview: {
              total_transactions: totalTransactions,
              total_amount: totalAmount,
              average_transaction:
                totalTransactions > 0 ? totalAmount / totalTransactions : 0,
            },
            transactions: {
              summary: transactionSummary,
              recent_activity: recentActivity,
              hourly_pattern: hourlyPattern, // Only for 'today' period
            },
            students: {
              total_students: parseInt(studentStats.total_students || 0),
              total_balance: parseFloat(studentStats.total_balance || 0),
              average_balance: parseFloat(studentStats.average_balance || 0),
              students_with_balance: parseInt(
                studentStats.students_with_balance || 0
              ),
              balance_distribution: balanceChart,
            },
            products: {
              top_selling: topProductsFormatted,
            },
            quick_stats: [
              {
                label: 'Total Siswa',
                value: parseInt(studentStats.total_students || 0),
                icon: 'users',
                color: 'blue',
              },
              {
                label: 'Total Saldo',
                value: `Rp ${new Intl.NumberFormat('id-ID').format(
                  parseFloat(studentStats.total_balance || 0)
                )}`,
                icon: 'wallet',
                color: 'green',
              },
              {
                label: 'Transaksi Hari Ini',
                value: transactionSummary.purchase?.count || 0,
                icon: 'shopping-cart',
                color: 'orange',
              },
              {
                label: 'Pendapatan',
                value: `Rp ${new Intl.NumberFormat('id-ID').format(
                  transactionSummary.purchase?.total_amount || 0
                )}`,
                icon: 'trending-up',
                color: 'purple',
              },
            ],
          },
        })
        .code(200);
    } catch (error) {
      console.error('Error getting dashboard analytics:', error);
      throw Boom.internal('Gagal mengambil data dashboard analytics', error);
    }
  },

  // 9. Comparative report - Perbandingan periode
  getComparativeReport: async (request, h) => {
    try {
      const {
        currentStart,
        currentEnd,
        previousStart,
        previousEnd,
        metric = 'transactions', // transactions, revenue, students
      } = request.query;

      if (!currentStart || !currentEnd || !previousStart || !previousEnd) {
        throw Boom.badRequest(
          'Semua parameter tanggal wajib diisi untuk laporan perbandingan'
        );
      }

      const currentPeriodFilter = {
        createdAt: {
          [Op.between]: [new Date(currentStart), new Date(currentEnd)],
        },
        status: 'completed',
      };

      const previousPeriodFilter = {
        createdAt: {
          [Op.between]: [new Date(previousStart), new Date(previousEnd)],
        },
        status: 'completed',
      };

      // Get data for both periods
      const [currentData, previousData] = await Promise.all([
        Transaksi.findAll({
          where: currentPeriodFilter,
          attributes: [
            'Transaction_type',
            [fn('COUNT', col('id')), 'count'],
            [fn('SUM', col('total_amount')), 'total'],
          ],
          group: ['Transaction_type'],
          raw: true,
        }),
        Transaksi.findAll({
          where: previousPeriodFilter,
          attributes: [
            'Transaction_type',
            [fn('COUNT', col('id')), 'count'],
            [fn('SUM', col('total_amount')), 'total'],
          ],
          group: ['Transaction_type'],
          raw: true,
        }),
      ]);

      // Helper function to calculate percentage change
      const calculateChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      // Process data
      const processData = (data) => {
        const result = {};
        data.forEach((item) => {
          result[item.Transaction_type] = {
            count: parseInt(item.count),
            total: parseFloat(item.total || 0),
          };
        });
        return result;
      };

      const current = processData(currentData);
      const previous = processData(previousData);

      // Calculate comparisons
      const comparison = {};
      const allTypes = new Set([
        ...Object.keys(current),
        ...Object.keys(previous),
      ]);

      allTypes.forEach((type) => {
        const currentCount = current[type]?.count || 0;
        const previousCount = previous[type]?.count || 0;
        const currentTotal = current[type]?.total || 0;
        const previousTotal = previous[type]?.total || 0;

        comparison[type] = {
          current_period: {
            count: currentCount,
            total_amount: currentTotal,
          },
          previous_period: {
            count: previousCount,
            total_amount: previousTotal,
          },
          change: {
            count: currentCount - previousCount,
            count_percentage: calculateChange(currentCount, previousCount),
            amount: currentTotal - previousTotal,
            amount_percentage: calculateChange(currentTotal, previousTotal),
          },
          trend: {
            count:
              currentCount > previousCount
                ? 'up'
                : currentCount < previousCount
                ? 'down'
                : 'stable',
            amount:
              currentTotal > previousTotal
                ? 'up'
                : currentTotal < previousTotal
                ? 'down'
                : 'stable',
          },
        };
      });

      // Overall summary
      const currentTotal = Object.values(current).reduce(
        (sum, item) => ({
          count: sum.count + item.count,
          total: sum.total + item.total,
        }),
        { count: 0, total: 0 }
      );

      const previousTotal = Object.values(previous).reduce(
        (sum, item) => ({
          count: sum.count + item.count,
          total: sum.total + item.total,
        }),
        { count: 0, total: 0 }
      );

      return h
        .response({
          success: true,
          message: 'Laporan perbandingan berhasil diambil',
          data: {
            comparison_periods: {
              current: {
                start: currentStart,
                end: currentEnd,
              },
              previous: {
                start: previousStart,
                end: previousEnd,
              },
            },
            overall_comparison: {
              current_period: currentTotal,
              previous_period: previousTotal,
              change: {
                count: currentTotal.count - previousTotal.count,
                count_percentage: calculateChange(
                  currentTotal.count,
                  previousTotal.count
                ),
                amount: currentTotal.total - previousTotal.total,
                amount_percentage: calculateChange(
                  currentTotal.total,
                  previousTotal.total
                ),
              },
              trend: {
                count:
                  currentTotal.count > previousTotal.count
                    ? 'up'
                    : currentTotal.count < previousTotal.count
                    ? 'down'
                    : 'stable',
                amount:
                  currentTotal.total > previousTotal.total
                    ? 'up'
                    : currentTotal.total < previousTotal.total
                    ? 'down'
                    : 'stable',
              },
            },
            by_transaction_type: comparison,
            insights: generateInsights(comparison, currentTotal, previousTotal),
          },
        })
        .code(200);
    } catch (error) {
      if (Boom.isBoom(error)) {
        throw error;
      }
      console.error('Error getting comparative report:', error);
      throw Boom.internal('Gagal mengambil laporan perbandingan', error);
    }
  },
};

// Helper functions
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  return `${diffDays} hari yang lalu`;
}

function generateInsights(comparison, currentTotal, previousTotal) {
  const insights = [];

  // Growth insights
  if (currentTotal.count > previousTotal.count) {
    const growth = (
      ((currentTotal.count - previousTotal.count) / previousTotal.count) *
      100
    ).toFixed(1);
    insights.push({
      type: 'positive',
      title: 'Peningkatan Transaksi',
      description: `Terjadi peningkatan ${growth}% dalam jumlah transaksi dibanding periode sebelumnya`,
    });
  } else if (currentTotal.count < previousTotal.count) {
    const decline = (
      ((previousTotal.count - currentTotal.count) / previousTotal.count) *
      100
    ).toFixed(1);
    insights.push({
      type: 'negative',
      title: 'Penurunan Transaksi',
      description: `Terjadi penurunan ${decline}% dalam jumlah transaksi dibanding periode sebelumnya`,
    });
  }

  // Revenue insights
  if (currentTotal.total > previousTotal.total) {
    const growth = (
      ((currentTotal.total - previousTotal.total) / previousTotal.total) *
      100
    ).toFixed(1);
    insights.push({
      type: 'positive',
      title: 'Peningkatan Pendapatan',
      description: `Pendapatan meningkat ${growth}% dibanding periode sebelumnya`,
    });
  }

  // Transaction type specific insights
  Object.entries(comparison).forEach(([type, data]) => {
    if (data.change.count_percentage > 50) {
      insights.push({
        type: 'info',
        title: `Lonjakan ${type}`,
        description: `Transaksi ${type} mengalami peningkatan signifikan sebesar ${data.change.count_percentage.toFixed(
          1
        )}%`,
      });
    }
  });

  return insights;
}

module.exports = reportController;

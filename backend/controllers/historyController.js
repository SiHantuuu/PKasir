const { Transaction, Product, User, Balance, sequelize } = require('../models');

// CREATE - Proses riwayat baru
const processHistory = async (request, h) => {
  const { userId, totalPrice, productId } = request.payload;

  // Validasi input
  if (
    isNaN(userId) ||
    isNaN(totalPrice) ||
    isNaN(productId) ||
    totalPrice <= 0
  ) {
    return h.response({ message: 'Parameter input tidak valid' }).code(400);
  }

  const t = await sequelize.transaction();

  try {
    // 1. Verifikasi produk ada
    const product = await Product.findByPk(productId, { transaction: t });
    if (!product) {
      await t.rollback();
      return h.response({ message: 'Produk tidak ditemukan' }).code(404);
    }

    // 2. Dapatkan user dan cek saldo
    const user = await User.findByPk(userId, {
      include: [{ model: Balance, as: 'balance' }],
      transaction: t,
    });

    if (!user) {
      await t.rollback();
      return h.response({ message: 'User tidak ditemukan' }).code(404);
    }

    if (!user.balance) {
      await t.rollback();
      return h.response({ message: 'User tidak memiliki catatan saldo' }).code(400);
    }

    const currentBalance = user.balance.Amount;

    // 3. Cek apakah user memiliki saldo cukup
    if (currentBalance < totalPrice) {
      await t.rollback();
      return h.response({ message: 'Saldo tidak mencukupi' }).code(400);
    }

    // 4. Membuat history baru
    const newHistory = await Transaction.create(
      {
        TransactionDate: new Date(),
        ProductId: productId,
        CustomerId: userId,
        Amount: totalPrice,
        HistoryType: 'PURCHASE',
        Description: `Pembelian produk ID: ${productId}`,
      },
      { transaction: t }
    );

    // 5. Update saldo user
    const newBalance = currentBalance - totalPrice;
    await user.balance.update({ Amount: newBalance }, { transaction: t });

    // Commit transaksi database
    await t.commit();

    return h
      .response({
        message: 'History berhasil dibuat',
        historyId: newHistory.id,
        newBalance: newBalance,
      })
      .code(200);
  } catch (error) {
    await t.rollback();
    console.error('Error pemrosesan history:', error.message);
    return h
      .response({ error: 'History gagal. Silakan coba lagi nanti.' })
      .code(500);
  }
};

// READ - Dapatkan semua history
const getAllHistory = async (request, h) => {
  try {
    const histories = await Transaction.findAll({
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'Nama', 'NFCId'],
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'ProductName', 'Price', 'CategoryId'],
        },
      ],
    });

    return h.response(histories).code(200);
  } catch (error) {
    console.error('Error mendapatkan semua history:', error.message);
    return h
      .response({
        error: 'Gagal mengambil history. Silakan coba lagi nanti.',
      })
      .code(500);
  }
};

// READ - Dapatkan history berdasarkan ID
const getHistoryById = async (request, h) => {
  const { id } = request.params;

  // Validasi input
  if (isNaN(id)) {
    return h.response({ message: 'ID history tidak valid' }).code(400);
  }

  try {
    const history = await Transaction.findByPk(id, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'Nama', 'NFCId'],
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'ProductName', 'Price', 'CategoryId'],
        },
      ],
    });

    if (!history) {
      return h.response({ message: 'History tidak ditemukan' }).code(404);
    }

    return h.response(history).code(200);
  } catch (error) {
    console.error('Error mendapatkan history berdasarkan ID:', error.message);
    return h
      .response({
        error: 'Gagal mengambil history. Silakan coba lagi nanti.',
      })
      .code(500);
  }
};

// READ - Dapatkan history berdasarkan ID user
const getHistoryByUser = async (request, h) => {
  const { userId } = request.params;

  if (isNaN(userId)) {
    return h.response({ message: 'ID user tidak valid' }).code(400);
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return h.response({ message: 'User tidak ditemukan' }).code(404);
    }

    const histories = await Transaction.findAll({
      where: { CustomerId: userId },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'ProductName', 'Price', 'CategoryId'],
        },
      ],
      order: [['TransactionDate', 'DESC']],
    });

    return h.response(histories).code(200);
  } catch (error) {
    console.error('Error detail:', error); // Tampilkan seluruh error
    return h
      .response({
        error: 'Gagal mengambil history user. Silakan coba lagi nanti.',
        detail: error.message, // Tambahkan detail error di response
      })
      .code(500);
  }
};

// UPDATE - Update detail history
const updateHistory = async (request, h) => {
  const { id } = request.params;
  const { description } = request.payload;

  // Validasi input
  if (isNaN(id)) {
    return h.response({ message: 'ID history tidak valid' }).code(400);
  }

  if (!description || description.trim() === '') {
    return h.response({ message: 'Deskripsi tidak boleh kosong' }).code(400);
  }

  const t = await sequelize.transaction();

  try {
    const history = await Transaction.findByPk(id, { transaction: t });

    if (!history) {
      await t.rollback();
      return h.response({ message: 'History tidak ditemukan' }).code(404);
    }

    // Hanya mengizinkan update deskripsi dalam contoh ini
    await history.update({ Description: description }, { transaction: t });

    await t.commit();

    return h
      .response({
        message: 'History berhasil diperbarui',
        history,
      })
      .code(200);
  } catch (error) {
    await t.rollback();
    console.error('Error update history:', error.message);
    return h
      .response({
        error: 'Gagal memperbarui history. Silakan coba lagi nanti.',
      })
      .code(500);
  }
};

// DELETE - Batalkan/hapus history
const deleteHistory = async (request, h) => {
  const { id } = request.params;

  // Validasi input
  if (isNaN(id)) {
    return h.response({ message: 'ID history tidak valid' }).code(400);
  }

  const t = await sequelize.transaction();

  try {
    const history = await Transaction.findByPk(id, {
      transaction: t,
    });

    if (!history) {
      await t.rollback();
      return h.response({ message: 'History tidak ditemukan' }).code(404);
    }

    // Periksa apakah history masih dalam jendela waktu refund (24 jam)
    const historyTime = new Date(history.TransactionDate);
    const currentTime = new Date();
    const diffHours = (currentTime - historyTime) / (1000 * 60 * 60);

    if (diffHours > 24) {
      await t.rollback();
      return h
        .response({ message: 'History tidak dapat direfund setelah 24 jam' })
        .code(400);
    }

    // Dapatkan user dan saldo
    const user = await User.findByPk(history.CustomerId, {
      include: [{ model: Balance, as: 'balance' }],
      transaction: t,
    });

    if (!user || !user.balance) {
      await t.rollback();
      return h.response({ message: 'User atau saldo tidak ditemukan' }).code(404);
    }

    // Refund ke user
    const currentBalance = user.balance.Amount;
    const newBalance = currentBalance + history.Amount;

    await user.balance.update({ Amount: newBalance }, { transaction: t });

    // Hapus history
    await history.destroy({ transaction: t });

    await t.commit();

    return h
      .response({
        message: 'History dihapus dan pembayaran direfund',
        refundAmount: history.Amount,
        newBalance,
      })
      .code(200);
  } catch (error) {
    await t.rollback();
    console.error('Error hapus history:', error.message);
    return h
      .response({
        error: 'Gagal menghapus history. Silakan coba lagi nanti.',
      })
      .code(500);
  }
};

module.exports = {
  processHistory,
  getAllHistory,
  getHistoryById,
  getHistoryByUser,
  updateHistory,
  deleteHistory,
};
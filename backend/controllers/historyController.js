const { Transaction, Product, User, Balance, sequelize } = require('../models');

// CREATE - Proses riwayat baru
const processHistory = async (request, h) => {
  const { NFCId, totalPrice, productId } = request.payload;

  // Console log data dari frontend
  console.log('Data dari frontend:', {
    NFCId,
    totalPrice,
    productId,
    rawPayload: request.payload,
  });

  // Validasi input
  if (
    isNaN(NFCId) ||
    isNaN(totalPrice) ||
    isNaN(productId) ||
    totalPrice <= 0
  ) {
    console.log('Validasi gagal:', { NFCId, totalPrice, productId });
    return h.response({ message: 'Parameter input tidak valid' }).code(400);
  }

  const t = await sequelize.transaction();

  try {
    // 1. Verifikasi produk ada
    const product = await Product.findByPk(productId, { transaction: t });
    if (!product) {
      console.log(`Produk dengan ID ${productId} tidak ditemukan`);
      await t.rollback();
      return h.response({ message: 'Produk tidak ditemukan' }).code(404);
    }
    console.log('Produk ditemukan:', product.dataValues);

    // 2. Dapatkan user dan cek saldo
    const user = await User.findOne({
      where: { NFCId },
      include: [{ model: Balance, as: 'balance' }],
      transaction: t,
    });

    if (!user) {
      console.log(`User dengan NFCId ${NFCId} tidak ditemukan`);
      await t.rollback();
      return h.response({ message: 'User tidak ditemukan' }).code(404);
    }
    console.log('User ditemukan:', {
      id: user.id,
      nama: user.Nama,
      NFCId: user.NFCId,
    });

    if (!user.balance) {
      console.log(`User ${user.id} tidak memiliki catatan saldo`);
      await t.rollback();
      return h
        .response({ message: 'User tidak memiliki catatan saldo' })
        .code(400);
    }

    const currentBalance = user.balance.Amount;
    console.log('Saldo saat ini:', currentBalance);

    // 3. Cek apakah user memiliki saldo cukup
    if (currentBalance < totalPrice) {
      console.log(
        `Saldo tidak cukup. Dibutuhkan: ${totalPrice}, Tersedia: ${currentBalance}`
      );
      await t.rollback();
      return h.response({ message: 'Saldo tidak mencukupi' }).code(400);
    }

    // 4. Membuat history baru
    const newHistory = await Transaction.create(
      {
        TransactionDate: new Date(),
        ProductId: productId,
        CustomerId: user.id,
        Amount: totalPrice,
        HistoryType: 'PURCHASE',
        Description: `Pembelian produk ID: ${productId}`,
      },
      { transaction: t }
    );
    console.log('Transaksi baru dibuat:', newHistory.dataValues);

    // 5. Update saldo user
    const newBalance = currentBalance - totalPrice;
    await user.balance.update({ Amount: newBalance }, { transaction: t });
    console.log('Saldo diperbarui:', {
      userId: user.id,
      oldBalance: currentBalance,
      newBalance,
      deducted: totalPrice,
    });

    // Commit transaksi database
    await t.commit();
    console.log('Transaksi berhasil dicommit');

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
    console.error('Stack trace:', error.stack);
    return h
      .response({ error: 'History gagal. Silakan coba lagi nanti.' })
      .code(500);
  }
};

// READ - Dapatkan semua history
const getAllHistory = async (request, h) => {
  console.log('Memulai getAllHistory', { query: request.query });
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
    console.log(`Retrieved ${histories.length} history records`);

    return h.response(histories).code(200);
  } catch (error) {
    console.error('Error mendapatkan semua history:', error.message);
    console.error('Stack trace:', error.stack);
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
  console.log(`Mencari history dengan ID: ${id}`);

  // Validasi input
  if (isNaN(id)) {
    console.log(`ID history tidak valid: ${id}`);
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
      console.log(`History dengan ID ${id} tidak ditemukan`);
      return h.response({ message: 'History tidak ditemukan' }).code(404);
    }

    console.log(`History ditemukan:`, history.dataValues);
    return h.response(history).code(200);
  } catch (error) {
    console.error('Error mendapatkan history berdasarkan ID:', error.message);
    console.error('Stack trace:', error.stack);
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
  console.log(`Mencari history untuk user ID: ${userId}`);

  if (isNaN(userId)) {
    console.log(`ID user tidak valid: ${userId}`);
    return h.response({ message: 'ID user tidak valid' }).code(400);
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      console.log(`User dengan ID ${userId} tidak ditemukan`);
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
    console.log(
      `Ditemukan ${histories.length} history untuk user ID ${userId}`
    );

    return h.response(histories).code(200);
  } catch (error) {
    console.error('Error detail:', error); // Tampilkan seluruh error
    console.error('Stack trace:', error.stack);
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
  console.log(`Update history ID ${id} dengan deskripsi: ${description}`);

  // Validasi input
  if (isNaN(id)) {
    console.log(`ID history tidak valid: ${id}`);
    return h.response({ message: 'ID history tidak valid' }).code(400);
  }

  if (!description || description.trim() === '') {
    console.log('Deskripsi kosong dalam payload update');
    return h.response({ message: 'Deskripsi tidak boleh kosong' }).code(400);
  }

  const t = await sequelize.transaction();

  try {
    const history = await Transaction.findByPk(id, { transaction: t });

    if (!history) {
      console.log(`History dengan ID ${id} tidak ditemukan`);
      await t.rollback();
      return h.response({ message: 'History tidak ditemukan' }).code(404);
    }

    // Hanya mengizinkan update deskripsi dalam contoh ini
    await history.update({ Description: description }, { transaction: t });
    console.log(`History berhasil diupdate:`, history.dataValues);

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
    console.error('Stack trace:', error.stack);
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
  console.log(`Mencoba menghapus history dengan ID: ${id}`);

  // Validasi input
  if (isNaN(id)) {
    console.log(`ID history tidak valid: ${id}`);
    return h.response({ message: 'ID history tidak valid' }).code(400);
  }

  const t = await sequelize.transaction();

  try {
    const history = await Transaction.findByPk(id, {
      transaction: t,
    });

    if (!history) {
      console.log(`History dengan ID ${id} tidak ditemukan`);
      await t.rollback();
      return h.response({ message: 'History tidak ditemukan' }).code(404);
    }

    // Periksa apakah history masih dalam jendela waktu refund (24 jam)
    const historyTime = new Date(history.TransactionDate);
    const currentTime = new Date();
    const diffHours = (currentTime - historyTime) / (1000 * 60 * 60);
    console.log(
      `Waktu transaksi: ${historyTime}, Waktu sekarang: ${currentTime}, Selisih jam: ${diffHours}`
    );

    if (diffHours > 24) {
      console.log(
        `Refund ditolak: transaksi lebih dari 24 jam (${diffHours.toFixed(
          2
        )} jam)`
      );
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
      console.log(`User ${history.CustomerId} atau saldo tidak ditemukan`);
      await t.rollback();
      return h
        .response({ message: 'User atau saldo tidak ditemukan' })
        .code(404);
    }

    // Refund ke user
    const currentBalance = user.balance.Amount;
    const newBalance = currentBalance + history.Amount;
    console.log(
      `Refund: User ${user.id}, Jumlah: ${history.Amount}, Saldo baru: ${newBalance}`
    );

    await user.balance.update({ Amount: newBalance }, { transaction: t });

    // Hapus history
    await history.destroy({ transaction: t });
    console.log(`History ID ${id} dihapus`);

    await t.commit();
    console.log('Transaksi refund berhasil dicommit');

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
    console.error('Stack trace:', error.stack);
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

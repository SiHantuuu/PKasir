require("dotenv").config();
const mysql = require("mysql2/promise");
const processTransaction = async (request, h) => {
    const { userId, totalPrice, productId } = request.payload; // Ambil data dari request body
  
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction(); // Mulai transaksi database
  
      // 1. Simpan transaksi ke tabel Transaction
      const insertTransactionQuery = `
        INSERT INTO Transaction (TransactionDate, ProductId, CustomerId) 
        VALUES (NOW(), ?, ?)
      `;
      await connection.execute(insertTransactionQuery, [productId, userId]);
  
      // 2. Ambil balance user
      const [userRows] = await connection.execute(
        "SELECT Amount FROM User WHERE Id = ?",
        [userId]
      );
  
      if (userRows.length === 0) {
        await connection.rollback();
        return h.response({ message: "User not found" }).code(404);
      }
  
      let currentBalance = userRows[0].Amount;
  
      // 3. Kurangi balance user dengan total price
      if (currentBalance < totalPrice) {
        await connection.rollback();
        return h.response({ message: "Insufficient balance" }).code(400);
      }
  
      let newBalance = currentBalance - totalPrice;
  
      // 4. Update balance user
      const updateBalanceQuery = "UPDATE User SET Amount = ? WHERE Id = ?";
      await connection.execute(updateBalanceQuery, [newBalance, userId]);
  
      await connection.commit(); // Simpan perubahan
  
      return h.response({
        message: "Transaction successful",
        newBalance: newBalance,
      }).code(200);
  
    } catch (error) {
      await connection.rollback(); // Jika error, batalkan transaksi
      console.error(error);
      return h.response({ error: "Transaction failed" }).code(500);
    } finally {
      connection.release(); // Pastikan koneksi ditutup setelah digunakan
    }
  };
  
  module.exports = { processTransaction };
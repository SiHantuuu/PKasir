require("dotenv").config();
const mysql = require("mysql2/promise");
const postUserId = async (request, h) => {
    const { userId } = request.payload;
    try {
      const [rows] = await pool.execute("SELECT Id FROM User WHERE Id = ?", [userId]);
      if (rows.length === 0) return h.response({ message: "User not found" }).code(404);
      
      return h.response({ message: "User verified", userId }).code(200);
    } catch (error) {
      console.error(error);
      return h.response({ error: "Failed to verify user" }).code(500);
    }
  };

  const getUserInfo = async (request, h) => {
    const { userId } = request.params;
    try {
      const [rows] = await pool.execute("SELECT Name, Amount AS Balance FROM User WHERE Id = ?", [userId]);
      if (rows.length === 0) return h.response({ message: "User not found" }).code(404);
      
      return h.response(rows[0]).code(200);
    } catch (error) {
      console.error(error);
      return h.response({ error: "Failed to fetch user info" }).code(500);
    }
  };
  
  const getUserTransactionHistory = async (request, h) => {
    const { userId } = request.params;
    const limit = 5;
    const offset = 0;
  
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM Transaction WHERE CustomerId = ? ORDER BY TransactionDate DESC LIMIT ? OFFSET ?",
        [userId, limit, offset]
      );
  
      return h.response(rows).code(200);
    } catch (error) {
      console.error(error);
      return h.response({ error: "Failed to fetch transaction history" }).code(500);
    }
  };

  const topUpBalance = async (request, h) => {
    const { userId, amount } = request.payload;
  
    try {
      // Ambil balance user saat ini
      const [user] = await pool.execute("SELECT Amount FROM User WHERE Id = ?", [userId]);
      if (user.length === 0) return h.response({ message: "User not found" }).code(404);
  
      const currentBalance = user[0].Amount;
      const newBalance = currentBalance + amount;
  
      // Update balance user di database
      await pool.execute("UPDATE User SET Amount = ? WHERE Id = ?", [newBalance, userId]);
  
      return h.response({ message: "Balance updated successfully", newBalance }).code(200);
    } catch (error) {
      console.error(error);
      return h.response({ error: "Failed to update balance" }).code(500);
    }
  };

  module.exports = {
    postUserId,
    getUserInfo,
    getUserTransactionHistory,
    topUpBalance,
  };
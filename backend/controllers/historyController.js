require("dotenv").config();
const mysql = require("mysql2/promise");
const getAllHistory = async (request, h) => {
    const limit = 7; // Batas jumlah data yang diambil
    const offset = 0; // Mulai dari data ke-0
  
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM Transaction ORDER BY TransactionDate DESC LIMIT ? OFFSET ?",
        [limit, offset]
      );
      return h.response(rows).code(200);
    } catch (error) {
      console.error(error);
      return h.response({ error: "Failed to fetch transaction history" }).code(500);
    }
  };
  
  module.exports = { getAllHistory };
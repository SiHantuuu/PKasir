const { Sequelize } = require("sequelize");

// Buat koneksi ke database
const sequelize = new Sequelize("pkasir", "root", "", {
  host: "localhost",
  dialect: "mysql",
  logging: false, // Matikan log SQL jika tidak diperlukan
});

// Cek koneksi database
sequelize
  .authenticate()
  .then(() => console.log("Connected to MySQL with Sequelize"))
  .catch((err) => console.error("Database connection failed:", err));

module.exports = sequelize;

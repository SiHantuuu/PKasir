"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Misalnya siswa dengan id 1
    await queryInterface.bulkInsert("Transaksis", [
      {
        Customer_id: 1,
        Transaction_type: "pembelian",
        Note: "Beli makan siang",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        Customer_id: 1,
        Transaction_type: "pembelian",
        Note: "Beli minuman dan roti",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Transaksis", null, {});
  },
};


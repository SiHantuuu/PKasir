"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Asumsikan produk dengan id 1: Nasi Goreng, 2: Teh Botol, 3: Roti Bakar
    // Transaksi dengan id 1 dan 2
    await queryInterface.bulkInsert("Transaction_details", [
      {
        Transaction_id: 1,
        Product_id: 1,
        amount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        Transaction_id: 2,
        Product_id: 2,
        amount: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        Transaction_id: 2,
        Product_id: 3,
        amount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Transaction_details", null, {});
  },
};


"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    return queryInterface.bulkInsert("Transaksis", [
      {
        Customer_id: 2,
        Transaction_type: "purchase",
        total_amount: 13000,
        Note: "Pembelian alat tulis dan minuman",
        status: "completed",
        createdAt: now,
        updatedAt: now,
      },
      {
        Customer_id: 3,
        Transaction_type: "topup",
        total_amount: 100000,
        Note: "Isi saldo",
        status: "completed",
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Transaksis", null, {});
  },
};

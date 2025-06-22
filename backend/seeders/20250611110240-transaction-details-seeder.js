"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    return queryInterface.bulkInsert("Transaction_details", [
      {
        Transaction_id: 1,
        Product_id: 1,
        amount: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        Transaction_id: 1,
        Product_id: 2,
        amount: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        Transaction_id: 1,
        Product_id: 4,
        amount: 1,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Transaction_details", null, {});
  },
};

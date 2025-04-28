'use strict';
const { faker } = require('@faker-js/faker');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get users (excluding admin) to link transactions to them
    const users = await queryInterface.sequelize.query(
      "SELECT id FROM `users` WHERE role = 'murid';",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Get products to create transactions for them
    const products = await queryInterface.sequelize.query(
      'SELECT id, Price FROM `Products`;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const transactions = [];

    // Create random transactions for each user
    for (const user of users) {
      // Generate between 5-15 transactions per user
      const transactionCount = Math.floor(Math.random() * 10) + 5;

      for (let i = 0; i < transactionCount; i++) {
        // Randomly select a product
        const product = products[Math.floor(Math.random() * products.length)];

        // Create transaction date within last 30 days
        const transactionDate = faker.date.between({
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          to: new Date(),
        });

        // Mostly purchases, but some top-ups
        const transactionType = Math.random() > 0.2 ? 'purchase' : 'topup';

        // Amount is product price for purchases, random amount for top-ups
        const amount =
          transactionType === 'purchase'
            ? product.Price
            : Math.floor(Math.random() * 100000) + 50000; // 50,000 - 150,000 for top-ups

        transactions.push({
          CustomerId: user.id,
          ProductId: product.id,
          Amount: amount,
          TransactionType: transactionType,
          TransactionDate: transactionDate,
          Description:
            transactionType === 'purchase'
              ? `Purchase of product #${product.id}`
              : 'Account top-up',
          createdAt: transactionDate,
          updatedAt: transactionDate,
        });
      }
    }

    return queryInterface.bulkInsert('Transactions', transactions);
  },

  async down(queryInterface, Sequelize) {
    // Remove all seeded transactions
    return queryInterface.bulkDelete('Transactions', null, {});
  },
};

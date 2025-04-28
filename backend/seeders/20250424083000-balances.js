'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get all users to link balances to them
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const balances = [];

    // Create balance for each user
    for (const user of users) {
      balances.push({
        Amount: Math.floor(Math.random() * 500000) + 50000, // Random amount between 50,000 and 550,000
        UserId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return queryInterface.bulkInsert('Balances', balances);
  },

  async down(queryInterface, Sequelize) {
    // Remove all seeded balances
    return queryInterface.bulkDelete('Balances', null, {});
  },
};

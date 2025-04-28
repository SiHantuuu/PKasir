'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create product categories
    const categories = await queryInterface.bulkInsert(
      'Categories',
      [
        {
          name: 'Makanan',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Minuman',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Snack',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Alat Tulis',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Lainnya',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { returning: true }
    );

    return categories;
  },

  async down(queryInterface, Sequelize) {
    // Remove all seeded categories
    return queryInterface.bulkDelete('Categories', null, {});
  },
};

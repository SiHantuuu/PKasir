'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get categories to link products to them
    const categories = await queryInterface.sequelize.query(
      'SELECT id, name FROM `Categories`;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Create category id mapping
    const categoryMap = {};
    categories.forEach((category) => {
      categoryMap[category.name] = category.id;
    });

    // Create products
    return queryInterface.bulkInsert('Products', [
      // Makanan
      {
        ProductName: 'Nasi Goreng',
        Price: 15000,
        CategoryId: categoryMap['Makanan'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ProductName: 'Mie Ayam',
        Price: 12000,
        CategoryId: categoryMap['Makanan'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ProductName: 'Ayam Bakar',
        Price: 18000,
        CategoryId: categoryMap['Makanan'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Minuman
      {
        ProductName: 'Es Teh',
        Price: 5000,
        CategoryId: categoryMap['Minuman'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ProductName: 'Es Jeruk',
        Price: 6000,
        CategoryId: categoryMap['Minuman'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ProductName: 'Air Mineral',
        Price: 3000,
        CategoryId: categoryMap['Minuman'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Snack
      {
        ProductName: 'Keripik Singkong',
        Price: 8000,
        CategoryId: categoryMap['Snack'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ProductName: 'Pisang Goreng',
        Price: 2000,
        CategoryId: categoryMap['Snack'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Alat Tulis
      {
        ProductName: 'Pulpen',
        Price: 3500,
        CategoryId: categoryMap['Alat Tulis'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ProductName: 'Buku Tulis',
        Price: 5000,
        CategoryId: categoryMap['Alat Tulis'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Lainnya
      {
        ProductName: 'Masker',
        Price: 2000,
        CategoryId: categoryMap['Lainnya'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ProductName: 'Hand Sanitizer',
        Price: 15000,
        CategoryId: categoryMap['Lainnya'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    // Remove all seeded products
    return queryInterface.bulkDelete('Products', null, {});
  },
};

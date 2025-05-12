"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Misalnya kategori dengan id 1: Makanan, id 2: Minuman
    await queryInterface.bulkInsert("Produks", [
      {
        Nama: "Nasi Goreng",
        Harga: 15000,
        Stok: 50,
        Category_id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        Nama: "Teh Botol",
        Harga: 5000,
        Stok: 100,
        Category_id: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        Nama: "Roti Bakar",
        Harga: 10000,
        Stok: 40,
        Category_id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Produks", null, {});
  },
};


"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    return queryInterface.bulkInsert("Produks", [
      {
        Nama: "Buku Tulis",
        Harga: 5000,
        Stok: 100,
        Category_id: 3,
        createdAt: now,
        updatedAt: now,
      },
      {
        Nama: "Pensil",
        Harga: 2000,
        Stok: 150,
        Category_id: 3,
        createdAt: now,
        updatedAt: now,
      },
      {
        Nama: "Roti Coklat",
        Harga: 8000,
        Stok: 50,
        Category_id: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        Nama: "Air Mineral",
        Harga: 3000,
        Stok: 100,
        Category_id: 2,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Produks", null, {});
  },
};

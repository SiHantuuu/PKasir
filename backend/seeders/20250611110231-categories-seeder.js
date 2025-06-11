"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    return queryInterface.bulkInsert("Categories", [
      { Nama: "Makanan", createdAt: now, updatedAt: now },
      { Nama: "Minuman", createdAt: now, updatedAt: now },
      { Nama: "Alat Tulis", createdAt: now, updatedAt: now },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Categories", null, {});
  },
};

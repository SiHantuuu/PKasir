"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("Siswa", [
      {
        NIS: "12345",
        NISN: "67890",
        Nama: "Budi",
        Gen: "L",
        NFC_id: "ABC123",
        PIN: "1234",
        Balance: 50000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Siswa", null, {});
  },
};


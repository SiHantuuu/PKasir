"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Siswa", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      NIS: { type: Sequelize.STRING, unique: true },
      NISN: { type: Sequelize.STRING, unique: true },
      Nama: { type: Sequelize.STRING },
      Gen: { type: Sequelize.ENUM("L", "P") },
      NFC_id: { type: Sequelize.STRING, unique: true },
      PIN: { type: Sequelize.STRING },
      Balance: { type: Sequelize.INTEGER, defaultValue: 0 },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Siswa");
  },
};


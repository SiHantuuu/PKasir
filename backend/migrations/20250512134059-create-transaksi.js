"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Transaksis", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      Customer_id: {
        type: Sequelize.INTEGER,
        references: { model: "Siswa", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      Transaction_type: { type: Sequelize.STRING },
      Note: { type: Sequelize.TEXT },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Transaksis");
  },
};


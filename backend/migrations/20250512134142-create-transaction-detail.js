"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Transaction_details", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      Transaction_id: {
        type: Sequelize.INTEGER,
        references: { model: "Transaksis", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      Product_id: {
        type: Sequelize.INTEGER,
        references: { model: "Produks", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      amount: { type: Sequelize.INTEGER },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Transaction_details");
  },
};


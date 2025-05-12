"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Produks", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      Nama: { type: Sequelize.STRING },
      Harga: { type: Sequelize.INTEGER },
      Stok: { type: Sequelize.INTEGER },
      Category_id: {
        type: Sequelize.INTEGER,
        references: { model: "Categories", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Produks");
  },
};


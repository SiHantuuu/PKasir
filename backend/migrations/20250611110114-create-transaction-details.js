"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Transaction_details", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      Transaction_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Transaksis",
          key: "id",
        },
      },
      Product_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Produks",
          key: "id",
        },
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex("Transaction_details", ["Transaction_id"]);
    await queryInterface.addIndex("Transaction_details", ["Product_id"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("Transaction_details");
  },
};

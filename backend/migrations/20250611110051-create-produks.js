"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Produks", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      Nama: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      Harga: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      Stok: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      Category_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Categories",
          key: "id",
        },
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

    await queryInterface.addIndex("Produks", ["Category_id"]);
    await queryInterface.addIndex("Produks", ["Nama"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("Produks");
  },
};

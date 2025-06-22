"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      NIS: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
      },
      NISN: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
      },
      username: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
      },
      Nama: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      Gen: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      NFC_id: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
      },
      PIN: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      Balance: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Roles",
          key: "id",
        },
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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

    await queryInterface.addIndex("Users", ["role_id"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("Users");
  },
};

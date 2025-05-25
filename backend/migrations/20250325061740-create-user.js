'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      NIS: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true, // Untuk admin mungkin tidak punya NIS
      },
      NISN: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true, // Untuk admin mungkin tidak punya NISN
      },
      username: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false, // Username wajib untuk semua user
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
        allowNull: true, // Admin mungkin tidak punya generasi
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
        allowNull: true, // Untuk login admin
      },
      Balance: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Roles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // Jangan hapus role jika masih ada user yang menggunakannya
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

    // Tambahkan index untuk performa
    await queryInterface.addIndex('Users', ['role_id'], {
      name: 'users_role_id_index',
    });

    await queryInterface.addIndex('Users', ['username'], {
      name: 'users_username_index',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  },
};

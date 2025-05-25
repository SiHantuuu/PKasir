'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Transaction_details', {
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
          model: 'Transaksis',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      Product_id: {
        type: Sequelize.INTEGER,
        allowNull: true, // Bisa null jika produk dihapus
        references: {
          model: 'Produks', // Pastikan tabel Produks ada
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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

    // Tambahkan index untuk performa
    await queryInterface.addIndex('Transaction_details', ['Transaction_id'], {
      name: 'transaction_details_transaction_id_index',
    });

    await queryInterface.addIndex('Transaction_details', ['Product_id'], {
      name: 'transaction_details_product_id_index',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Transaction_details');
  },
};

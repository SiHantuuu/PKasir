// 20250525061741-create-transaksi.js
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Transaksis', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      Customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      Transaction_type: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isIn: [['purchase', 'topup', 'refund', 'transfer']],
        },
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      Note: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'completed',
        validate: {
          isIn: [['pending', 'completed', 'cancelled', 'refunded']],
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

    // Tambahkan index untuk performa query
    await queryInterface.addIndex('Transaksis', ['Customer_id'], {
      name: 'transaksis_customer_id_index',
    });

    await queryInterface.addIndex('Transaksis', ['Transaction_type'], {
      name: 'transaksis_transaction_type_index',
    });

    await queryInterface.addIndex('Transaksis', ['status'], {
      name: 'transaksis_status_index',
    });

    await queryInterface.addIndex('Transaksis', ['createdAt'], {
      name: 'transaksis_created_at_index',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Transaksis');
  },
};

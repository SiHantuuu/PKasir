'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define associations here
      Transaction.belongsTo(models.User, {
        foreignKey: 'CustomerId',
        as: 'customer',
      });

      // Add Product association
      Transaction.belongsTo(models.Product, {
        foreignKey: 'ProductId',
        as: 'product',
      });
    }
  }
  Transaction.init(
    {
      CustomerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      ProductId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id',
        },
      },
      Amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      TransactionType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      TransactionDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      Description: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Transaction',
    }
  );
  return Transaction;
};

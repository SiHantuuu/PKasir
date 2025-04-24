'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasOne(models.Balance, {
        foreignKey: 'UserId',
        as: 'balance',
      });

      // Add the missing association with Transaction
      User.hasMany(models.Transaction, {
        foreignKey: 'CustomerId',
        as: 'transactions',
      });
    }
  }
  User.init(
    {
      Nama: DataTypes.STRING,
      NFCId: DataTypes.STRING,
      Pin: DataTypes.STRING,
      Password: DataTypes.STRING,
      role: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'User',
    }
  );
  return User;
};

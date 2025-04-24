'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Balance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Balance.belongsTo(models.User, {
        foreignKey: 'UserId',
        as: 'user',
      });
    }
  }
  Balance.init(
    {
      Amount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'Balance',
    }
  );
  return Balance;
};

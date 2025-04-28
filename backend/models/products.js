'use strict';
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    'Product',
    {
      ProductName: DataTypes.STRING,
      Price: DataTypes.INTEGER,
      CategoryId: DataTypes.INTEGER,
    },
    {}
  );
  Product.associate = function (models) {
    Product.belongsTo(models.Category, { foreignKey: 'CategoryId' });
  };
  return Product;
};

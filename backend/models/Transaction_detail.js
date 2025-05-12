// models/Transaction_detail.js
module.exports = (sequelize, DataTypes) => {
  const Transaction_detail = sequelize.define(
    "Transaction_detail",
    {
      Transaction_id: DataTypes.INTEGER,
      Product_id: DataTypes.INTEGER,
      amount: DataTypes.INTEGER,
    },
    {
      tableName: "Transaction_detail",
      timestamps: false,
    }
  );

  Transaction_detail.associate = (models) => {
    Transaction_detail.belongsTo(models.Transaksi, {
      foreignKey: "Transaction_id",
    });
    Transaction_detail.belongsTo(models.Produk, { foreignKey: "Product_id" });
  };

  return Transaction_detail;
};

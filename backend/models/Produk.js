// models/Produk.js
module.exports = (sequelize, DataTypes) => {
  const Produk = sequelize.define(
    "Produk",
    {
      Nama: DataTypes.STRING,
      Harga: DataTypes.DECIMAL(10, 2),
      Category_id: DataTypes.INTEGER,
      Stok: DataTypes.INTEGER,
    },
    {
      tableName: "Produk",
      timestamps: false,
    }
  );

  Produk.associate = (models) => {
    Produk.belongsTo(models.Category, { foreignKey: "Category_id" });
    Produk.hasMany(models.Transaction_detail, { foreignKey: "Product_id" });
  };

  return Produk;
};

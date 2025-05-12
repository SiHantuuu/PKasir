// models/Category.js
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Category",
    {
      Nama: DataTypes.STRING,
    },
    {
      tableName: "Category",
      timestamps: false,
    }
  );

  Category.associate = (models) => {
    Category.hasMany(models.Produk, { foreignKey: "Category_id" });
  };

  return Category;
};

// models/Category.js
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    'Category',
    {
      Nama: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
    },
    {
      tableName: 'Categories', // Sesuaikan dengan migration
      timestamps: true, // Sesuaikan dengan migration
    }
  );

  Category.associate = (models) => {
    Category.hasMany(models.Produk, {
      foreignKey: 'Category_id',
      as: 'products',
    });
  };

  return Category;
};

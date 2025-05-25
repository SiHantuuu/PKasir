// models/Produk.js
module.exports = (sequelize, DataTypes) => {
  const Produk = sequelize.define(
    'Produk',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      Nama: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 255],
        },
      },
      Harga: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
          isDecimal: true,
        },
      },
      Stok: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
          isInt: true,
        },
      },
      Category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Categories',
          key: 'id',
        },
      },
    },
    {
      tableName: 'Produks',
      timestamps: true,
      indexes: [
        {
          fields: ['Category_id'],
          name: 'produks_category_id_index',
        },
        {
          fields: ['Nama'],
          name: 'produks_nama_index',
        },
      ],
    }
  );

  Produk.associate = (models) => {
    // Relasi dengan Category
    Produk.belongsTo(models.Category, {
      foreignKey: 'Category_id',
      as: 'category',
    });

    // Relasi dengan Transaction_detail
    Produk.hasMany(models.Transaction_detail, {
      foreignKey: 'Product_id',
      as: 'transaction_details',
    });
  };

  return Produk;
};

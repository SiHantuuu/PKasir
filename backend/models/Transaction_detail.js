// models/Transaction_detail.js
module.exports = (sequelize, DataTypes) => {
  const Transaction_detail = sequelize.define(
    'Transaction_detail',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      Transaction_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Transaksis',
          key: 'id',
        },
      },
      Product_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Bisa null jika produk dihapus
        references: {
          model: 'Produks', // Pastikan model Produk ada
          key: 'id',
        },
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1, // Amount harus minimal 1
        },
      },
    },
    {
      tableName: 'Transaction_details', // Konsisten dengan migration
      timestamps: true, // Konsisten dengan migration
      underscored: false,
    }
  );

  Transaction_detail.associate = (models) => {
    // Relasi dengan Transaksi
    Transaction_detail.belongsTo(models.Transaksi, {
      foreignKey: 'Transaction_id',
      as: 'transaction',
    });

    // Relasi dengan Produk (pastikan model Produk ada)
    Transaction_detail.belongsTo(models.Produk, {
      foreignKey: 'Product_id',
      as: 'product',
    });
  };

  return Transaction_detail;
};

// models/Transaksi.js
module.exports = (sequelize, DataTypes) => {
  const Transaksi = sequelize.define(
    "Transaksi",
    {
      Customer_id: DataTypes.STRING,
      Transaction_type: DataTypes.STRING,
      Note: DataTypes.TEXT,
    },
    {
      tableName: "Transaksi",
      timestamps: false,
    }
  );

  Transaksi.associate = (models) => {
    Transaksi.belongsTo(models.Siswa, { foreignKey: "Customer_id" });
    Transaksi.hasMany(models.Transaction_detail, {
      foreignKey: "Transaction_id",
    });
  };

  return Transaksi;
};

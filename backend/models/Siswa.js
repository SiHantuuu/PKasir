// models/Siswa.js
module.exports = (sequelize, DataTypes) => {
  const Siswa = sequelize.define(
    "Siswa",
    {
      NIS: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      NISN: DataTypes.STRING,
      Nama: DataTypes.STRING,
      Gen: DataTypes.STRING,
      NFC_id: DataTypes.STRING,
      PIN: DataTypes.STRING,
      Balance: DataTypes.DECIMAL(10, 2),
    },
    {
      tableName: "Siswa",
      timestamps: false,
    }
  );

  Siswa.associate = (models) => {
    Siswa.hasMany(models.Transaksi, { foreignKey: "Customer_id" });
  };

  return Siswa;
};

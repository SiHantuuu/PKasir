const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Koneksi database

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  Nama: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
  },
  NFCId: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
  },
  Pin: {
    type: DataTypes.STRING(255), // Bisa menyimpan hash
    allowNull: true,
    validate: {
      is: /^[0-9a-zA-Z./$]{6,}$/, // Hanya menerima hash dengan format ini
    },
  },
  Password: {
    type: DataTypes.STRING(255), // Bisa menyimpan hash
    allowNull: true,
  },
  Amount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  role: {
    type: DataTypes.ENUM("murid", "admin"),
    allowNull: false,
    defaultValue: "murid",
  },
}, {
  hooks: {
    beforeValidate: (user) => {
      if (user.role === "murid") {
        if (!user.Pin || user.Password) {
          throw new Error("Murid harus memiliki Pin dan tidak boleh memiliki Password");
        }
      } else if (user.role === "admin") {
        if (!user.Password || user.Pin) {
          throw new Error("Admin harus memiliki Password dan tidak boleh memiliki Pin");
        }
      }
    }
  }
});

// Export model
module.exports = User;

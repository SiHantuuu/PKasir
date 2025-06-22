// models/User.js
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      NIS: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
      },
      NISN: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          len: [3, 50],
          notEmpty: true,
        },
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },
      Nama: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      Gen: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      NFC_id: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
      },
      PIN: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [6, 100],
        },
      },
      Balance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Roles',
          key: 'id',
        },
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: 'Users',
      timestamps: true,
      hooks: {
        // Hash password sebelum disimpan
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('password') && user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
      },
    }
  );

  User.associate = (models) => {
    // Asosiasi dengan Role
    User.belongsTo(models.Role, {
      foreignKey: 'role_id',
      as: 'role',
    });

    // Asosiasi dengan Transaksi
    User.hasMany(models.Transaksi, {
      foreignKey: 'Customer_id',
    });
  };

  // Instance methods
  User.prototype.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
  };

  User.prototype.isAdmin = function () {
    return this.role && this.role.name === 'admin';
  };

  User.prototype.isStudent = function () {
    return this.role && this.role.name === 'student';
  };

  return User;
};

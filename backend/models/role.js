'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      // Asosiasi dengan User (bukan Siswa)
      Role.hasMany(models.User, {
        foreignKey: 'role_id',
        as: 'users',
      });
    }
  }

  Role.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          isIn: [['admin', 'student', 'teacher']], // Sesuaikan dengan kebutuhan
        },
      },
    },
    {
      sequelize,
      modelName: 'Role',
      tableName: 'Roles',
      timestamps: true,
    }
  );

  return Role;
};

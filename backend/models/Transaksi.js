// models/Transaksi.js
module.exports = (sequelize, DataTypes) => {
  const Transaksi = sequelize.define(
    'Transaksi',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      Transaction_type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [['purchase', 'topup', 'refund', 'transfer']],
        },
      },
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      Note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'completed',
        validate: {
          isIn: [['pending', 'completed', 'cancelled', 'refunded']],
        },
      },
    },
    {
      tableName: 'Transaksis',
      timestamps: true, // Akan membuat createdAt dan updatedAt
      underscored: false, // Gunakan camelCase untuk timestamps
    }
  );

  Transaksi.associate = (models) => {
    // Asosiasi dengan User (customer)
    Transaksi.belongsTo(models.User, {
      foreignKey: 'Customer_id',
      as: 'customer',
    });

    // Asosiasi dengan Transaction_detail
    Transaksi.hasMany(models.Transaction_detail, {
      foreignKey: 'Transaction_id',
      as: 'details',
    });
  };

  return Transaksi;
};

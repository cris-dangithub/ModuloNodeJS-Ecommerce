const { DataTypes } = require('sequelize');
const { db } = require('../database/db');

const Cart = db.define('cart', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(['active', 'inactive', 'purchased']),
    allowNull: false,
    defaultValue: 'active',
  },
});

module.exports = Cart;

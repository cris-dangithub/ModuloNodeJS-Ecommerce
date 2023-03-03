const { DataTypes } = require('sequelize');
const { db } = require('../database/db');

const ProductInCart = db.define('productInCart', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  cartId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    // cambiar el inactgive a removed
    type: DataTypes.ENUM(['active', 'inactive', 'purchased']),
    allowNull: false,
    defaultValue: 'active',
  },
});

module.exports = ProductInCart;

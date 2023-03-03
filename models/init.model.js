const Cart = require('./cart.model');
const Category = require('./category.model');
const Order = require('./order.model');
const Product = require('./product.model');
const ProductImgs = require('./productImgs.model');
const ProductInCart = require('./productInCart.model');
const User = require('./user.model');

// Esta función me establece las relaciones entre los modelos
const initModel = () => {
  /*
    1 Relación user - product; Un usuario tiene muchos productos; y ese único producto (registro) le
    pertenece a un usuario
  */
  // 1.1 User - Product
  User.hasMany(
    Product,
    // Si no se tienen las llaves foraneas con camelCase, se deben establecer de esta forma. Sino no hay necesidad
    { sourceKey: 'id', foreignKey: 'userId' }
  );
  Product.belongsTo(User);
  // 1.2 User Order
  User.hasMany(Order);
  Order.belongsTo(User);
  // 1.3 User - Carts
  User.hasOne(Cart);
  Cart.belongsTo(User);
  // 2.1 Cart - Order
  Cart.hasOne(Order);
  Order.belongsTo(Cart);
  // 2.2 Cart- ProductInCart
  Cart.hasMany(ProductInCart);
  ProductInCart.belongsTo(Cart);
  // 3.1 Products - ProductImg
  Product.hasMany(ProductImgs);
  ProductImgs.belongsTo(Product);
  // 3.2 Products - ProductInCart
  Product.hasOne(ProductInCart);
  ProductInCart.belongsTo(Product);
  // 4. Category - Product
  Category.hasMany(Product);
  Product.belongsTo(Category);
};

module.exports = initModel;

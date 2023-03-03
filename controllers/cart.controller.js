const Cart = require('../models/cart.model');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const ProductInCart = require('../models/productInCart.model');
const User = require('../models/user.model');
const AppError = require('../utils/appError');
const { appSuccess } = require('../utils/appSuccess');
const { catchAsync } = require('../utils/catchAsync');

exports.addProductCart = catchAsync(async (req, res, next) => {
  // Validaciones finales
  let newProductInCart;
  const { productId, quantity } = req.body;
  const { productInCart, cart } = req;
  /* Si no existe, crear un registro nuevo en productInCart */
  if (!productInCart) {
    newProductInCart = await ProductInCart.create({
      cartId: cart.id,
      productId,
      quantity,
    });
  }
  /* Si existe pero con estado removido, cambiarle el estado con la nueva cantidad*/
  if (productInCart?.status === 'inactive') {
    newProductInCart = await productInCart.update({
      status: 'active',
      quantity,
    });
  }
  const { id, cartId } = newProductInCart;

  // Enviar respuesta al cliente
  appSuccess(res, 201, `Product added successfully`, {
    newProductInCart: {
      id,
      cartId,
      productId,
      quantity,
    },
  });
});

exports.updateCart = catchAsync(async (req, res, next) => {
  const { newQuantity } = req.body;
  const { productInCart } = req;
  if (newQuantity < 0) {
    return next(
      new AppError('The new quantity must be greater than or equal to 0', 400)
    );
  }

  if (newQuantity === 0) {
    await productInCart.update({ status: 'inactive', quantity: newQuantity });
    return appSuccess(res, 200, 'The product was removed successfully');
  }
  await productInCart.update({ status: 'active', quantity: newQuantity });
  appSuccess(res, 200, 'The product was updated successfully', {
    productInCart,
  });
});

exports.removeProductFromCart = catchAsync(async (req, res, next) => {
  const { productInCart } = req;
  if (productInCart.status === 'inactive') {
    return next(new AppError(`The product was already removed`, 400));
  }
  await productInCart.update({ status: 'inactive', quantity: 0 });
  appSuccess(res, 200, 'The product was deleted successfully');
});

exports.buyProductOnCart = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  // 1. Buscar carrito del usuario con status active junto con los respectivo producto
  const cart = await Cart.findOne({
    attributes: ['id', 'userId'],
    where: {
      userId: sessionUser.id,
      status: 'active',
    },
    include: [
      {
        model: ProductInCart,
        where: { status: 'active' },
        attributes: {
          exclude: ['status', 'createdAt', 'updatedAt'],
        },
        include: [
          {
            model: Product,
            // where: { status: true }, Da error si se pone esto acá, aún no sé por qué.
            attributes: {
              exclude: ['createdAt', 'updatedAt'],
            },
          },
        ],
      },
    ],
  });
  if (!cart) {
    return next(new AppError('There is no active cart product', 404));
  }

  // 2. Averiguar el precio total de la compra
  const totalPrice = cart.productInCarts.reduce((total, productCart) => {
    return total + productCart.quantity * +productCart.product.price;
  }, 0);
  // 3. Actualizar stock o cantidad del modelo Product
  const purchasedProductPromises = cart.productInCarts.map(
    async productCart => {
      const product = productCart.product;
      const newStock = product.quantity - productCart.quantity;

      return await product.update({ quantity: newStock });
    }
  );
  await Promise.all(purchasedProductPromises);
  // 4. Actualizar los productos en el carrito con status purchased
  /*
    a) Creación de una constante para asignarla al map
    b) Dentro de esa función, buscaremos el producto en el carrito a actualizar
    c) Retornar las actualizaciones del producto en el carrito encontrado y el status purchased
    d) Resolver luego las promesas mediante el Promise.aLl
  */
  const statusProductsInCartPromises = cart.productInCarts.map(
    async productCart => await productCart.update({ status: 'purchased' })
  );
  await Promise.all(statusProductsInCartPromises);
  // 5. Actualizar el estado del carrito a purchased
  await cart.update({ status: 'purchased' });
  // 6. Generar una orden
  const order = await Order.create({
    userId: sessionUser.id,
    cartId: cart.id,
    totalPrice,
  });

  // 7. Enviar respuesta al cliente
  appSuccess(res, 201, `The order has been generated successfully`, { order });
});

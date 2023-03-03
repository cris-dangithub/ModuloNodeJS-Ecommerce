const { catchAsync } = require('../utils/catchAsync');
const Cart = require('../models/cart.model');
const ProductInCart = require('../models/productInCart.model');
const AppError = require('../utils/appError');

const searchCart = async req => {
  const { sessionUser } = req;
  let cart = await Cart.findOne({
    attributes: ['id', 'userId'],
    where: {
      id: sessionUser.id,
      status: 'active',
    },
  });
  return cart;
};

const getProductId = req => {
  let { productId } = req.body;
  if (!productId) {
    ({ productId } = req.params);
  }
  return productId;
};

// Busca que el usuario tenga un carrito activo, sino, crea uno
exports.searchCartToAdd = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  let cart = await searchCart(req);

  if (!cart) {
    cart = await Cart.create({
      userId: sessionUser.id,
    });
  }

  req.cart = cart;
  next();
});

// Busca si un producto existe en el carrito
exports.validIfProductInCart = catchAsync(async (req, res, next) => {
  const { productId } = req.body;
  const { cart } = req;
  const productInCart = await ProductInCart.findOne({
    where: {
      productId,
      cartId: cart.id,
    },
  });
  /* Si existe, error: No se puede agregar el producto 2 veces */
  if (productInCart && productInCart.status === 'active') {
    return next(
      new AppError(
        `It's not possible to add two same products to the cart`,
        400
      )
    );
  }
  req.productInCart = productInCart;
  next();
});

exports.validIfProductInCartForUpdate = catchAsync(async (req, res, next) => {
  const productId = getProductId(req);
  // buscar carrito
  const cart = await searchCart(req);
  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }
  // Buscar si el producto está en el carrito
  const productInCart = await ProductInCart.findOne({
    where: {
      productId,
      cartId: cart.id,
    },
  });

  if (!productInCart) {
    return next(new AppError(`The product does not exist in the cart`, 404));
  }

  req.productInCart = productInCart;
  next();
});

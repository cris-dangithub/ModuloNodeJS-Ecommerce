const { Router } = require('express');
const {
  addProductCart,
  updateCart,
  removeProductFromCart,
  buyProductOnCart,
} = require('../controllers/cart.controller');
const { protect, restrictTo } = require('../middlewares/auth.middlewares');
const {
  validIfProductInCart,
  validIfProductInCartForUpdate,
  searchCartToAdd,
} = require('../middlewares/cart.middlewares');
const {
  validProductById,
  validProductStocks,
} = require('../middlewares/product.middlewares');
const { validateFields } = require('../middlewares/validateField.middlewares');
const {
  addProductCartValidation,
  updateCartValidation,
} = require('../middlewares/validations.middleware');

const router = Router();

// ------- Rutas protegidas -------
router.use(protect);

router.post(
  '/add-product',
  restrictTo('admin'),
  addProductCartValidation,
  validateFields,
  searchCartToAdd,
  validProductById,
  validProductStocks,
  validIfProductInCart,
  addProductCart
);

router.patch(
  '/update-cart',
  updateCartValidation,
  validateFields,
  validProductById,
  validProductStocks,
  validIfProductInCartForUpdate,
  updateCart
);

router.delete(
  '/:productId',
  [validProductById, validIfProductInCartForUpdate],
  removeProductFromCart
);

router.post('/purchase', buyProductOnCart);

module.exports = {
  cartRouter: router,
};

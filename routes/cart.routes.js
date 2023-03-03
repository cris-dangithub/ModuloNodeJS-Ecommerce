const { Router } = require('express');
const { check } = require('express-validator');
const {
  addProductCart,
  updateCart,
  removeProductFromCart,
  buyProductOnCart,
} = require('../controllers/cart.controller');
const { protect } = require('../middlewares/auth.middlewares');
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

const router = Router();

// ------- Rutas protegidas -------
router.use(protect);

router.post(
  '/add-product',
  [
    check('productId', 'productId must be mandatory').not().isEmpty(),
    check('productId', 'productId must be a number').isNumeric(),
    check('quantity', 'quantity must be mandatory').not().isEmpty(),
    check('quantity', 'quantity must be mandatory').isNumeric(),
    validateFields,
    searchCartToAdd,
    validProductById,
    validProductStocks,
    validIfProductInCart,
  ],
  addProductCart
);

router.patch(
  '/update-cart',
  [
    check('productId', 'productId must be mandatory').not().isEmpty(),
    check('productId', 'productId must be a number').isNumeric(),
    check('newQuantity', 'quantity must be mandatory').not().isEmpty(),
    check('newQuantity', 'quantity must be mandatory').isNumeric(),
    validateFields,
    validProductById,
    validProductStocks,
    validIfProductInCartForUpdate,
  ],
  updateCart
);

router.delete(
  '/:productId',
  [validateFields, validProductById, validIfProductInCartForUpdate],
  removeProductFromCart
);

router.post('/purchase', buyProductOnCart);

module.exports = {
  cartRouter: router,
};

const { Router } = require('express');
const {
  findProduct,
  findProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');
const { protect, restrictTo } = require('../middlewares/auth.middlewares');
const { validProductById } = require('../middlewares/product.middlewares');

const router = Router();

router.get('/', findProduct);
router.get('/:id', validProductById, findProductById);

// ---------------- Rutas protegidas por token ----------------
router.use(protect);
router.post('/', restrictTo('admin'), createProduct);
router.patch('/:id', restrictTo('admin'), validProductById, updateProduct);
router.delete('/:id', restrictTo('admin'), validProductById, deleteProduct);

module.exports = {
  productRouter: router,
};

const { Router } = require('express');
const {
  findProducts,
  findProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');
const { protect, restrictTo } = require('../middlewares/auth.middlewares');
const { validProductById } = require('../middlewares/product.middlewares');
const { upload } = require('../utils/multer');
const { validateFields } = require('../middlewares/validateField.middlewares');
const {
  createProductValidation,
  updateProductValidation,
} = require('../middlewares/validations.middleware');

const router = Router();

router.get('/', findProducts);
router.get('/:id', validProductById, findProductById);

// ---------------- Rutas protegidas por token ----------------
router.use(protect);
router.post(
  '/',
  upload.array('productImgs', 3),
  createProductValidation,
  validateFields,
  restrictTo('admin'),
  createProduct
);
router.patch(
  '/:id',
  restrictTo('admin'),
  updateProductValidation,
  validateFields,
  validProductById,
  updateProduct
);
router.delete('/:id', restrictTo('admin'), validProductById, deleteProduct);

module.exports = {
  productRouter: router,
};

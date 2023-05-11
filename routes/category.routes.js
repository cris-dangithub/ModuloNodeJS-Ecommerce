const { Router } = require('express');
const {
  findCategories,
  findCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller');
const { protect, restrictTo } = require('../middlewares/auth.middlewares');
const { validCategoryById } = require('../middlewares/category.middlewares');
const {
  createCategoryValidation,
} = require('../middlewares/validations.middleware');
const { validateFields } = require('../middlewares/validateField.middlewares');

const router = Router();

router.get('/', findCategories);
router.get('/:id', validCategoryById, findCategory);

// protect me protege la ruta antes de crear la categoría, y si no pasa pues
// no tendrá la autorización

// ------------ Rutas protegidas por token ------------
// Al usar "router.use", las demas rutas de abajo quedarán protegidas
router.use(protect);
router.post(
  '/',
  restrictTo('admin'),
  createCategoryValidation,
  validateFields,
  createCategory
);
router.patch(
  '/:id',
  restrictTo('admin'),
  createCategoryValidation,
  validCategoryById,
  updateCategory
);
router.delete('/:id', restrictTo('admin'), validCategoryById, deleteCategory);

module.exports = {
  categoryRouter: router,
};

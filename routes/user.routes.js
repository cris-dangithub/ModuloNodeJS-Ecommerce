const { Router } = require('express');
const { check } = require('express-validator');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getOrders,
  getOrderById,
  updatePassword,
} = require('../controllers/user.controller');
const {
  protectAccountOwner,
  protect,
} = require('../middlewares/auth.middlewares');
const { validUserById } = require('../middlewares/user.middlewares');
const { validateFields } = require('../middlewares/validateField.middlewares');
const {
  updatePasswordValidation,
  updateUserValidation,
} = require('../middlewares/validations.middleware');

const router = Router();

router.get('/', getAllUsers);
// Ruta para obtener las órdenes.
/*
  Como esta ruta debe estar protegida, le deberemos poenr el
  protect dentro. Este get debe estar por encima pues con esto
  se evita que las ordenes se tomen como parámetros
*/
router.get('/orders', protect, getOrders);
router.get('/:id', validUserById, getUserById);

// ---------------- Rutas protegidas por token ----------------
router.use(protect);

router.get('/orders/:id', getOrderById);
router.patch(
  '/password/:id',
  updatePasswordValidation,
  validateFields,
  // Acá usamos el middleware de validacion de usuario por id
  validUserById,
  protectAccountOwner,
  updatePassword
);
router.patch(
  '/:id',
  updateUserValidation,
  validateFields,
  validUserById,
  protectAccountOwner,
  updateUser
);
router.delete('/:id', validUserById, deleteUser);

module.exports = {
  userRouter: router,
};

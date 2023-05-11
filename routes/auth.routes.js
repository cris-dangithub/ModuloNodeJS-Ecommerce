const { Router } = require('express');
const { check } = require('express-validator');
const {
  createUser,
  login,
  renewToken,
} = require('../controllers/auth.controllers');
const { protect } = require('../middlewares/auth.middlewares');
const {
  validIfExistUserEmail,
  validateImgName,
} = require('../middlewares/user.middlewares');
const { validateFields } = require('../middlewares/validateField.middlewares');
const { upload } = require('../utils/multer');
const {
  createUserValidation,
  loginValidation,
} = require('../middlewares/validations.middleware');

const router = Router();

router.post(
  '/signup',
  upload.single('profileImageUrl'), // Colocaremos el nombre de como recibiremos el archivo dentro de las comillas.
  createUserValidation,
  validateFields,
  validIfExistUserEmail,
  validateImgName,
  createUser
);

router.post('/login', loginValidation, validateFields, login);

// ------------ Rutas protegidas ------------
router.use(protect);

// Ruta para revalidar el token
router.get('/renew', renewToken);

module.exports = {
  authRouter: router,
};

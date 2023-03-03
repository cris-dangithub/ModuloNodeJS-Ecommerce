const { Router } = require('express');
const { check } = require('express-validator');
const {
  createUser,
  login,
  renewToken,
} = require('../controllers/auth.controllers');
const { protect } = require('../middlewares/auth.middlewares');
const { validIfExistUserEmail } = require('../middlewares/user.middlewares');
const { validateFields } = require('../middlewares/validateField.middlewares');
const { upload } = require('../utils/multer');

const router = Router();

router.post(
  '/signup',
  [
    upload.single('profileImageUrl'), // Colocaremos el nombre de como recibiremos el archivo dentro de las comillas.
    check('username', 'The username must be mandatory').not().isEmpty(),
    check('email', 'The email must be mandatory').not().isEmpty(),
    check('email', 'The email must be a correct format').isEmail(),
    check('password', 'The password must be a correct format').not().isEmail(),
    check('role', 'The role must be mandatory').not().isEmpty(),
    validateFields,
    validIfExistUserEmail,
  ],
  createUser
);

router.post(
  '/login',
  [
    check('email', 'The email must be mandatory').not().isEmpty(),
    check('email', 'The email must be a correct format').isEmail(),
    check('password', 'The password must be mandatory').not().isEmpty(),
    check('password', 'The password must be a correct format').not().isEmail(),
    validateFields,
  ],
  login
);

// ------------ Rutas protegidas ------------
router.use(protect);

// Ruta para revalidar el token
router.get('/renew', renewToken);

module.exports = {
  authRouter: router,
};

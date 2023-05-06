const User = require('../models/user.model');
const { catchAsync } = require('../utils/catchAsync');
const bcryptjs = require('bcryptjs');
const AppError = require('../utils/appError');
const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const ProductInCart = require('../models/productInCart.model');
const { appSuccess } = require('../utils/appSuccess');
const Product = require('../models/product.model');
const { getDownloadURL, ref } = require('firebase/storage');
const { storage } = require('../utils/firebase');
const { mapAsync } = require('../utils/mapAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  // 1. Traernos nos usuarios donde el status sea verdadero
  const users = await User.findAll({
    where: {
      status: true,
    },
  });
  // 2. Usar mapAsync para obtener las url de las imagenes de perfil de usuario
  const usersResolved = await mapAsync(users, async user => {
    if (user.profileImageUrl) {
      const imgRef = ref(storage, user.profileImageUrl);
      url = await getDownloadURL(imgRef);
      user.profileImageUrl = url;
    }
    return user;
  });

  // 3. Mandar respuesta al cliente
  appSuccess(res, 200, 'Users obtained successfully', { users: usersResolved });
});

exports.getUserById = catchAsync(async (req, res, next) => {
  const { user } = req;
  // Si el usuario tiene un path de firebase, cambiarla por la url de la imagen
  if (user.profileImageUrl) {
    const imgRef = ref(storage, user.profileImageUrl);
    const url = await getDownloadURL(imgRef);
    user.profileImageUrl = url;
  }
  res.status(200).json({
    status: 'success',
    message: 'ROUTE - GET BY ID',
    user,
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;
  const { user } = req;
  await user.update({ username, email, password });
  res.json({
    status: 'success',
    message: 'User was updated successfully',
    user,
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { user } = req;
  await user.update({ status: false });
  res.json({
    status: 'success',
    message: 'The user has been deleted successfully',
  });
});

// Este controlador es para actualizar la contraseña del usuario
exports.updatePassword = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { currentPassword, newPassword } = req.body;
  // 1. Comparar contraseña del usuario con la contrasela que tiene el usuario actualmente
  /*
    Lo mismo que tenemos en auth controller para comparar contraseñas encriptadas-
    Esta función se puede poner en un middleware pues estamos copiando y pegando.
  */
  if (!(await bcryptjs.compare(currentPassword, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // 2. Encriptamos la nueva contraseña
  /*
    Lo unico diferente es la creación de la constante
  */
  const salt = await bcryptjs.genSalt(10);
  const encriptedPassword = await bcryptjs.hash(newPassword, salt);

  // 3. Hacemos un await del usuario
  /*
    Al password del modelo del usuario le colocaré la nueva contraseña encriptada y
    la checha en el que el usuario hizo la modificación de dicha contraseña (toca agregar esto
    antes en el modelo de usuarios)
  */
  await user.update({
    password: encriptedPassword,
    passwordChangedAt: new Date(),
  });

  // 4. Enviar respuesta al cliente
  res.status(200).json({
    status: 'success',
    message: 'The user password was updated successfully',
  });
});

// Controlador para obtener las ordenes activas de los usuarios
exports.getOrders = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  // 1. Buscamos las ordenes del usuario en sesión
  const orders = await Order.findAll({
    where: {
      userId: sessionUser.id,
      status: true,
    },
    include: [
      {
        model: Cart,
        where: { status: 'purchased' },
        include: {
          model: ProductInCart,
          where: {
            status: 'purchased',
          },
        },
      },
      {
        model: User,
        where: { status: true },
        attributes: {
          exclude: ['password', 'passwordChangedAt', 'createdAt', 'updatedAt'],
        },
      },
    ],
  });

  // 2. Mandar respuesta al cliente
  appSuccess(res, 200, 'Active orders obteined successfully', { orders });
});

// Controlador que obtiene las ordenes por id del usuario en sesión
exports.getOrderById = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { id } = req.params;

  // Buscar la orden del usuario en sesión por id
  const order = await Order.findOne({
    attributes: { exclude: ['status', 'createdAt', 'updatedAt'] },
    where: {
      id,
      userId: sessionUser.id,
      status: true,
    },
    include: [
      {
        model: User,
        where: { status: true },
        attributes: ['id', 'username', 'email', 'role'],
      },
      {
        model: Cart,
        where: { status: 'purchased' },
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        include: [
          {
            model: ProductInCart,
            where: {
              status: 'purchased',
            },
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            include: [
              {
                model: Product,
                where: { status: true },
                attributes: {
                  exclude: ['quantity', 'status', 'createdAt', 'updatedAt'],
                },
              },
            ],
          },
        ],
      },
    ],
  });

  // 2. Validar si no existe la orden
  if (!order) {
    return next(new AppError(`Order was not found`));
  }
  // 3. Enviar respuesta al cliente
  appSuccess(res, 200, `Order obtained successfully`, { order });
});

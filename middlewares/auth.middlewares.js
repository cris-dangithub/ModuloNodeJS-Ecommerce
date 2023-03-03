const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');
const User = require('../models/user.model');

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Verificar que el token venga
  /*
    En React le mandabamos al back el token por los headers y con una palabra clave
    "Bearer"
  */
  let token;
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith('Bearer')) {
    // Dividir el Bearer del token y obtener el token que será el segundo indice (1)
    token = authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401)
    );
  }

  // 2. Verificar y decodificar el token (Si no ha expirado)
  /*
    El token se puede decodificar con el payload y la llave secreta (de la misma manera que
    se codifica se puede decodificar)
    Problema es que esto no devuelve una promesa, entonces usaremos una funcion en javascript
    que convierte un callback en una promesa (promisify). Debemos importarla mediante require('util')
  */
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.SECRET_JWT_SEED
  );
  ////console.log(decoded)
  // 3. Checkear que el usuario exista
  const user = await User.findOne({
    where: {
      // le paso el id del usuario decodificado
      id: decoded.id,
      status: true,
    },
  });
  if (!user) {
    return next(
      new AppError('The owner of this token is not longer available', 401)
    );
  }

  // 4. Verificar si el usuario ha cambiado la contraseña después de que el token haya sido expirado
  //console.log(decoded.iat);
  //console.log(user.passwordChangedAt);
  /*
    Para cambiar de fecha a tiempo con función de javascript-> getTime
    En milisegundos, pero lo necesitamos en segundos. Usaremos parseInt para que
    sea menos suceptible a errores y lo dividimos entre mil para convertir a segundos
  */
  //console.log(user.passwordChangedAt.getTime());
  if (user.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      user.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changedTimeStamp);
    /*
      Si el usuario cambió la contraseña
    */
    if (decoded.iat < changedTimeStamp) {
      return next(
        new AppError('User recently changed password!, please login again', 401)
      );
    }
  }
  // Usuario en sesión
  req.sessionUser = user;
  next();
});

// Este middleware protege el token del usuario
/*
  Lo misión principal será validar que el usuario que esté intentando
  realizar la acción sea el mismo que se logeó
*/
exports.protectAccountOwner = catchAsync(async (req, res, next) => {
  // Obtener el usuario que viene de la request
  const { user, sessionUser } = req;
  // Validar que el usuario en sesion sea el usuario que está haciendo la petición
  /*
    En un caso podría haber un "suepradmin", entonces valida si el role del usuario
    en sesion es superadmin para saltarse dicho error
  */
  if (user.id !== sessionUser.id && sessionUser.role !== 'superadmin') {
    return next(new AppError('You are not the owner of this account', 401));
  }
  next();
});

// Para restringir por roles
/*
  El spread operator guarda las variables en un array con nombre "roles".
  Los que recibo por argumento son los roles permitidos
*/
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // 1. Comprar los roles con el rol del usuario en sesión (el que viene del token)
    if (!roles.includes(req.sessionUser.role)) {
      return next(
        /*
          Codigo de estado 403: Forbiden (una petición rechazada). Es mas especifico
          para este tipo de casos como los roles
        */
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

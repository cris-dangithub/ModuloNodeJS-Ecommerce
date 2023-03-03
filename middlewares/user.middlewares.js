const User = require('../models/user.model');
const AppError = require('../utils/appError');
const { appSuccess } = require('../utils/appSuccess');
const { catchAsync } = require('../utils/catchAsync');

exports.validUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findOne({
    where: {
      id,
      status: true,
    },
  });
  if (!user) {
    return next(new AppError('User has not been found', 404));
  }
  req.user = user;
  next();
});

exports.validIfExistUserEmail = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({
    where: {
      email: email.toLowerCase(),
    },
  });

  // Validar si el usuario existe y si tiene un estado en false... Si es así, actualizar el estado a true
  if (user && !user.status) {
    await user.update({ status: true });
    return appSuccess(
      res,
      200,
      `The user exists but his account is disabled. The account has already been activated`
    );
  }

  // Validar si existe el usuario
  if (user) {
    return next(new AppError(`The user's email aready exists`, 400));
  }
  //Si no existe, ir al siguiente middleware

  next();
};

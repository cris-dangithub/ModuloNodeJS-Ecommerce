const Product = require('../models/product.model');
const AppError = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

const getProduct = req => {
  // Obtener id del producto por los parametros
  let { id, productId } = req.params;
  // Validar por parametros
  if (!id && productId) {
    return productId;
  }
  // Si no existe, obtener el id del producto por el body
  if (!id && !productId) {
    ({ productId } = req.body);
    return productId;
  }
  return id;
};

// Obtener la cantidad dependiendo de lo mandado por el body
const getQuantity = req => {
  const { quantity, newQuantity } = req.body;
  console.log(quantity);
  if (!quantity) return newQuantity;
  return quantity;
};

exports.validProductById = catchAsync(async (req, res, next) => {

  const id = getProduct(req);
  const product = await Product.findOne({
    where: {
      id,
      status: true,
    },
  });
  if (!product) {
    return next(new AppError('The product was not found', 404));
  }
  req.product = product;
  next();
});

exports.validProductStocks = catchAsync(async (req, res, next) => {
  const { product } = req;
  const quantity = getQuantity(req);
  if (product.quantity < quantity) {
    return next(
      new AppError('There are fewer products in stock than requested', 400)
    );
  }

  next();
});

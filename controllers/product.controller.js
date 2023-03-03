const Product = require('../models/product.model');
const { catchAsync } = require('../utils/catchAsync');

exports.findProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findAll({
    where: {
      status: true,
    },
  });
  res.status(200).json({
    status: 'success',
    message: 'ROUTE - GET',
    product,
  });
});

exports.findProductById = catchAsync(async (req, res, next) => {
  const { product } = req;
  res.status(200).json({
    status: 'success',
    message: 'The product was find successfully',
    product,
  });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const { title, description, quantity, price, categoryId, userId } = req.body;
  const newProduct = await Product.create({
    title: title.toLowerCase(),
    description: description.toLowerCase(),
    quantity,
    price,
    categoryId,
    userId,
  });
  res.status(201).json({
    status: 'success',
    message: 'ROUTE - POST',
    newProduct,
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const { product } = req;
  const { title, description, quantity, price } = req.body;
  const updatedProduct = await product.update({
    title,
    description,
    quantity,
    price,
  });
  res.status(200).json({
    status: 'success',
    message: 'The product was updated succesfully',
    updatedProduct,
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const { product } = req;
  await product.update({ status: false });
  res.status(200).json({
    status: 'success',
    message: 'Product has been deleted successfully',
  });
});

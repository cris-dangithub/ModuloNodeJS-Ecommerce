const Category = require('../models/category.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const { catchAsync } = require('../utils/catchAsync');

exports.findCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.findAll({
    attributes: ['id', 'name'],
    where: {
      status: true,
    },

    // Adjuntar más modelos a esta búsqueda (Debe haber una relación entre ellos)
    /*
      En este caso, adjuntaré los productos que hagan parte de la categoría.
    */
    include: [
      // Me traigo el modelo de Productos
      {
        model: Product,
        // Enviar un objeto con exclude, en el que se indican las propiedades a excluir
        attributes: { exclude: ['createdAt', 'updatedAt', 'status'] },
        // Condicional para este modelo
        where: { status: true },
        // Me puedo seguir trayendo más modelos pero que estén en este caso relacionados a Products
        include: [
          {
            model: User,
            attributes: ['id', 'username', 'email', 'role'],
            where: { status: true },
          },
        ],
        // Si no hay productos aún asi traerá la categoría con esta propiedad (si no se pone no la traerá)
        required: false,
      },
      //Puedo seguir trayendome más modelos, pero estos deben estar relacionados también
    ],
  });
  res.status(200).json({
    status: 'success',
    message: 'ROUTE - GET',
    categories,
  });
});

exports.findCategory = catchAsync(async (req, res, next) => {
  const { category } = req;
  res.status(200).json({
    status: 'success',
    message: 'The category was find successfully',
    category,
  });
});

exports.createCategory = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  const newCategory = await Category.create({
    name,
  });
  res.status(201).json({
    status: 'success',
    message: 'ROUTE - POST',
    newCategory,
  });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  const { category } = req;
  const updateCategory = await category.update({
    name,
  });
  res.status(200).json({
    status: 'success',
    message: 'The category was updated succesfully',
    updateCategory,
  });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const { category } = req;
  await category.update({ status: false });
  res.status(200).json({
    status: 'success',
    message: 'Product has been deleted successfully',
  });
});

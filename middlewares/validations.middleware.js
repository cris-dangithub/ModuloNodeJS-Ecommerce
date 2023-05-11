const { check } = require('express-validator');
const { generateCheckers } = require('../utils/generateCheckers');
// ----------- auth validations -----------
exports.createUserValidation = [
  ...generateCheckers([
    {
      validType: 'string',
      fieldNames: ['username', 'password', 'role'],
    },
    {
      validType: 'email',
      fieldNames: ['email'],
    },
  ]),
];

exports.loginValidation = [
  ...generateCheckers([
    {
      validType: 'email',
      fieldNames: ['email'],
    },
    {
      validType: 'string',
      fieldNames: ['password'],
    },
  ]),
];

// ----------- cart validations -----------
exports.addProductCartValidation = [
  ...generateCheckers([
    {
      validType: 'numeric',
      fieldNames: ['productId', 'quantity'],
    },
  ]),
];

exports.updateCartValidation = [
  ...generateCheckers([
    {
      validType: 'numeric',
      fieldNames: ['productId', 'newQuantity'],
    },
  ]),
];

// ----------- category validations -----------
exports.createCategoryValidation = [
  ...generateCheckers([
    {
      validType: 'string',
      fieldNames: ['name'],
    },
  ]),
];

// ----------- product validations -----------
exports.createProductValidation = [
  ...generateCheckers([
    {
      validType: 'string',
      fieldNames: ['title', 'description'],
    },
    {
      validType: 'numeric',
      fieldNames: ['quantity', 'price', 'categoryId', 'userId'],
    },
  ]),
];

exports.updateProductValidation = [
  ...generateCheckers([
    {
      validType: 'string',
      fieldNames: ['title', 'description'],
      optionals: ['title', 'description'],
    },
    {
      validType: 'numeric',
      fieldNames: ['quantity', 'price', 'categoryId', 'userId'],
      optionals: ['quantity', 'price', 'categoryId', 'userId'],
    },
  ]),
];

// ----------- user validations -----------
exports.updatePasswordValidation = [
  ...generateCheckers([
    {
      validType: 'string',
      fieldNames: ['currentPassword', 'newPassword'],
    },
  ]),
];

exports.updateUserValidation = [
  ...generateCheckers([
    {
      validType: 'string',
      fieldNames: ['username', 'password'],
      optionals: ['username', 'password'],
    },
    {
      validType: 'email',
      fieldNames: ['email'],
      optionals: ['email'],
    },
  ]),
];

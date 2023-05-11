const { check } = require('express-validator');
const { generateCheckers } = require('../utils/generateCheckers');
// ----------- auth validations -----------
exports.createUserValidation = [
  ...generateCheckers({
    fields: [
      {
        validType: 'string',
        fieldNames: ['username', 'password', 'role'],
      },
      {
        validType: 'email',
        fieldNames: ['email'],
      },
    ],
  }),
];

exports.loginValidation = [
  ...generateCheckers({
    fields: [
      {
        validType: 'email',
        fieldNames: ['email'],
      },
      {
        validType: 'string',
        fieldNames: ['password'],
      },
    ],
  }),
];

// ----------- cart validations -----------
exports.addProductCartValidation = [
  ...generateCheckers({
    fields: [
      {
        validType: 'numeric',
        fieldNames: ['productId', 'quantity'],
      },
    ],
  }),
];

exports.updateCartValidation = [
  ...generateCheckers({
    fields: [
      {
        validType: 'numeric',
        fieldNames: ['productId', 'newQuantity'],
      },
    ],
  }),
];

// ----------- category validations -----------
exports.createCategoryValidation = [
  ...generateCheckers({
    fields: [
      {
        validType: 'string',
        fieldNames: ['name'],
      },
    ],
  }),
];

// ----------- product validations -----------
exports.createProductValidation = [
  ...generateCheckers({
    fields: [
      {
        validType: 'string',
        fieldNames: ['title', 'description'],
      },
      {
        validType: 'numeric',
        fieldNames: ['quantity', 'price', 'categoryId', 'userId'],
      },
    ],
  }),
];

exports.updateProductValidation = [
  ...generateCheckers({
    fields: [
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
    ],
    optionals: [
      'title',
      'description',
      'quantity',
      'price',
      'categoryId',
      'userId',
    ],
  }),
];

// ----------- user validations -----------
exports.updatePasswordValidation = [
  ...generateCheckers({
    fields: [
      {
        validType: 'string',
        fieldNames: ['currentPassword', 'newPassword'],
      },
    ],
  }),
];

exports.updateUserValidation = [
  ...generateCheckers({
    fields: [
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
    ],
    optionals: ['username', 'password', 'email'],
  }),
];

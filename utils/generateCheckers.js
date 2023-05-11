const { check } = require('express-validator');

function addOptionalField(arr) {
  const obj = arr.slice(-1)[0];
  obj['optional']();
}

function addRequiredField(arr, field) {
  const message = `The ${field} is required`;
  arr.push(check(`${field}`, message).not().isEmpty());
}

function genValidator(checkers, validator, message, cbString) {
  validator.fieldNames.forEach(fieldName => {
    if (!validator.optionals?.includes(fieldName))
      addRequiredField(checkers, fieldName);
    const mess = `The ${fieldName} ${message}`;
    checkers.push(check(fieldName, mess)[`${cbString}`]());
    if (validator.optionals?.includes(fieldName)) addOptionalField(checkers);
  });
}

/**
 *@param {[{validType: 'email' | 'numeric' |'string'; fieldNames:string[]; optionals?: string[] }]} validators
 *
 */
// Genera checkers a partir de los tipos numeric, email y string
exports.generateCheckers = validators => {
  const checkers = [];
  validators.forEach(validator => {
    const { validType } = validator;
    let message;

    if (validType === 'email') {
      message = `must be a valid email address`;
      genValidator(checkers, validator, message, 'isEmail');
    }
    if (validType === 'numeric') {
      message = `must be a number`;
      genValidator(checkers, validator, message, 'isNumeric');
    }
    if (validType === 'string') {
      message = `must be a string`;
      genValidator(checkers, validator, message, 'isString');
    }
  });
  return checkers;
};

//TODO 2:08:00

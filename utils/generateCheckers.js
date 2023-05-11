const { check } = require('express-validator');

function addOptionalField(arr) {
  const obj = arr.slice(-1)[0];
  obj['optional']();
}

function addRequiredField(arr, field) {
  const message = `The ${field} is required`;
  arr.push(check(`${field}`, message).not().isEmpty());
}

function genValidator(checkers, validator, message, cbString, validators) {
  validator.fieldNames.forEach(fieldName => {
    if (!validators.optionals?.includes(fieldName))
      addRequiredField(checkers, fieldName);
    const mess = `The ${fieldName} ${message}`;
    checkers.push(check(fieldName, mess)[`${cbString}`]());
    if (validators.optionals?.includes(fieldName)) addOptionalField(checkers);
  });
}

/**
 *@param { {fields: [{validType: 'email' | 'numeric' |'string'; fieldNames:string[] }],optionals?: string[]} } validators
 *
 */
// Genera checkers a partir de los tipos numeric, email y string
exports.generateCheckers = validators => {
  const checkers = [];
  validators.fields.forEach(validator => {
    const { validType } = validator;
    let message;

    if (validType === 'email') {
      message = `must be a valid email address`;
      genValidator(checkers, validator, message, 'isEmail', validators);
    }
    if (validType === 'numeric') {
      message = `must be a number`;
      genValidator(checkers, validator, message, 'isNumeric', validators);
    }
    if (validType === 'string') {
      message = `must be a string`;
      genValidator(checkers, validator, message, 'isString', validators);
    }
  });
  return checkers;
};

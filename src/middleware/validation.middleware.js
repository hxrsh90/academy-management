const { validationResult } = require('express-validator');
const { ValidationError } = require('./error.middleware');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    throw new ValidationError('Validation failed', details);
  }
  next();
};

module.exports = { validate };

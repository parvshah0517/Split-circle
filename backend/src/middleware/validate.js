'use strict';

const { validationResult } = require('express-validator');

/**
 * Middleware to collect express-validator errors and forward them
 * to the global error handler as a structured validation error.
 *
 * Usage: place after your validator() array in a route definition.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err    = new Error('Validation failed');
    err.type     = 'validation';
    err.errors   = errors.array().map(e => ({
      field:   e.path || e.param,
      message: e.msg,
      value:   e.value,
    }));
    return next(err);
  }
  return next();
}

module.exports = validate;

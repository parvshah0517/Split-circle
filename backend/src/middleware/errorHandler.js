'use strict';

const AppError = require('../utils/AppError');

/**
 * Global Express error handler middleware.
 * Must be registered LAST in app.js (after all routes).
 *
 * Converts any thrown error into a consistent JSON response:
 *   { success: false, code: string, message: string, [errors]: array }
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV === 'development';

  // express-validator ValidationError array
  if (err.type === 'validation' && Array.isArray(err.errors)) {
    return res.status(422).json({
      success: false,
      code:    'VALIDATION_ERROR',
      message: 'Request validation failed',
      errors:  err.errors,
    });
  }

  // Known application errors
  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      code:    err.code,
      message: err.message,
      ...(isDev && { stack: err.stack }),
    });
  }

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      code:    'DUPLICATE_ENTRY',
      message: 'A record with those values already exists.',
    });
  }

  // Unhandled / unknown errors
  console.error('[ERROR]', err);
  return res.status(500).json({
    success: false,
    code:    'INTERNAL_ERROR',
    message: isDev ? err.message : 'An unexpected error occurred.',
    ...(isDev && { stack: err.stack }),
  });
}

module.exports = errorHandler;

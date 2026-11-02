'use strict';

/**
 * Async wrapper — eliminates try/catch boilerplate in route handlers.
 *
 * Usage:
 *   router.get('/path', asyncHandler(async (req, res, next) => { ... }));
 */
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;

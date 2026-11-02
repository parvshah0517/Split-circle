'use strict';

/**
 * Centralised error response helper.
 * Provides a consistent JSON shape for all API errors.
 */

class AppError extends Error {
  /**
   * @param {string} message  Human-readable error message
   * @param {number} status   HTTP status code (default 500)
   * @param {string} code     Machine-readable error code (e.g. 'NOT_FOUND')
   */
  constructor(message, status = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.status = status;
    this.code   = code;
    this.name   = 'AppError';
  }
}

module.exports = AppError;

'use strict';

const jwt = require('jsonwebtoken');

const config = require('../config');
const UserModel = require('../models/UserModel');
const AppError = require('../utils/AppError');

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return next(
        new AppError(
          'Authentication token is required.',
          401,
          'UNAUTHORIZED'
        )
      );
    }

    const token = header.slice(7);

    let payload;

    try {
      payload = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      const message = err.name === 'TokenExpiredError'
        ? 'Authentication token has expired.'
        : 'Authentication token is invalid.';

      return next(
        new AppError(message, 401, 'UNAUTHORIZED')
      );
    }

    const user = await UserModel.findById(payload.sub);

    if (!user) {
      return next(
        new AppError(
          'User account not found.',
          401,
          'UNAUTHORIZED'
        )
      );
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = authenticate;
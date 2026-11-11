
'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const AuthController = require('../controllers/AuthController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const config = require('../config');

const {
  registerValidator,
  loginValidator,
  profileValidator,
} = require('../validators/authValidators');

const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    message: 'Too many failed authentication attempts. Please try again later.',
  },
});

// Public routes
router.post(
  '/register',
  authLimiter,
  registerValidator,
  validate,
  AuthController.register
);

router.post(
  '/login',
  authLimiter,
  loginValidator,
  validate,
  AuthController.login
);

// Protected routes
router.get(
  '/me',
  authenticate,
  AuthController.me
);

router.put(
  '/profile',
  authenticate,
  profileValidator,
  validate,
  AuthController.updateProfile
);

module.exports = router;

'use strict';

const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/AuthController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');

const {
  registerValidator,
  loginValidator,
  profileValidator,
} = require('../validators/authValidators');

// Public routes
router.post(
  '/register',
  registerValidator,
  validate,
  AuthController.register
);

router.post(
  '/login',
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
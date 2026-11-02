'use strict';

// ─── Phase 3: Authentication ─────────────────────────────────────────────────
// Validator schemas for /api/auth routes

const { body } = require('express-validator');
const profileValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty.')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters.'),

  body('avatar_url')
    .optional({ nullable: true })
    .isURL()
    .withMessage('Avatar must be a valid URL.'),

  body()
    .custom((value) => {
      if (
        value.name === undefined &&
        value.avatar_url === undefined
      ) {
        throw new Error('Provide at least one profile field to update.');
      }

      return true;
    }),
];
const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ max: 100 }).withMessage('Name must be at most 100 characters.'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Email must be a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.'),
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Email must be a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.'),
];

module.exports = { registerValidator, loginValidator,profileValidator };

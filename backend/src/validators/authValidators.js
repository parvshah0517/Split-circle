
'use strict';

const { body } = require('express-validator');

const usernameRule = () =>
  body('username')
    .trim()
    .toLowerCase()
    .matches(/^[a-z0-9_]{3,30}$/)
    .withMessage(
      'Username must be 3-30 characters and contain only letters, numbers, and underscores.'
    );

const mobileRule = () =>
  body('mobile')
    .trim()
    .matches(/^\+[1-9]\d{7,14}$/)
    .withMessage(
      'Enter a valid mobile number with country code, e.g. +919876543210.'
    );

const mpinRule = () =>
  body('mpin')
    .matches(/^\d{4}$/)
    .withMessage('MPIN must contain exactly four digits.');

const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required.')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters.'),

  usernameRule(),

  mobileRule(),

  mpinRule(),
];

const loginValidator = [
  usernameRule(),
  mpinRule(),
];

const profileValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty.')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters.'),

  body('mobile')
    .optional()
    .trim()
    .matches(/^\+[1-9]\d{7,14}$/)
    .withMessage('Enter a valid mobile number with country code.'),

  body('avatar_url')
    .optional({ nullable: true })
    .isURL()
    .withMessage('Avatar must be a valid URL.'),

  body().custom((value) => {
    if (
      value.name === undefined &&
      value.mobile === undefined &&
      value.avatar_url === undefined
    ) {
      throw new Error('Provide at least one profile field to update.');
    }

    return true;
  }),
];

module.exports = {
  registerValidator,
  loginValidator,
  profileValidator,
};

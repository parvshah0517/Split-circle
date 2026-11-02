'use strict';

const AuthService = require('../services/AuthService');
const asyncHandler = require('../utils/asyncHandler');

const AuthController = {
  register: asyncHandler(async (req, res) => {
    const result = await AuthService.register(req.body);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: result,
    });
  }),

  login: asyncHandler(async (req, res) => {
    const result = await AuthService.login(req.body);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: result,
    });
  }),

  me: asyncHandler(async (req, res) => {
    const user = await AuthService.getCurrentUser(req.user.id);

    res.status(200).json({
      success: true,
      data: { user },
    });
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const user = await AuthService.updateProfile(
      req.user.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user },
    });
  }),
};

module.exports = AuthController;
'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const config = require('../config');
const UserModel = require('../models/UserModel');
const AppError = require('../utils/AppError');

const SALT_ROUNDS = 12;

const AuthService = {
  async register({ name, email, password }) {
    const existingUser = await UserModel.findByEmail(email);

    if (existingUser) {
      throw new AppError(
        'An account with this email already exists.',
        409,
        'EMAIL_ALREADY_EXISTS'
      );
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    let userId;

    try {
      userId = await UserModel.create({
        name,
        email,
        password_hash,
      });
    } catch (err) {
      // Handles a duplicate email inserted concurrently.
      if (err.code === 'ER_DUP_ENTRY') {
        throw new AppError(
          'An account with this email already exists.',
          409,
          'EMAIL_ALREADY_EXISTS'
        );
      }

      throw err;
    }

    const user = await UserModel.findById(userId);

    return {
      user,
      token: this.generateToken(user),
    };
  },

  async login({ email, password }) {
    const userRecord = await UserModel.findByEmail(email);

    if (!userRecord) {
      throw new AppError(
        'Invalid email or password.',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    const passwordMatches = await bcrypt.compare(
      password,
      userRecord.password_hash
    );

    if (!passwordMatches) {
      throw new AppError(
        'Invalid email or password.',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    const user = await UserModel.findById(userRecord.id);

    return {
      user,
      token: this.generateToken(user),
    };
  },

  generateToken(user) {
    return jwt.sign(
      { sub: String(user.id) },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  },

  async getCurrentUser(userId) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError(
        'User account not found.',
        404,
        'USER_NOT_FOUND'
      );
    }

    return user;
  },

  async updateProfile(userId, updates) {
    const existingUser = await UserModel.findById(userId);

    if (!existingUser) {
      throw new AppError(
        'User account not found.',
        404,
        'USER_NOT_FOUND'
      );
    }

    const updatedName = updates.name ?? existingUser.name;
    const updatedAvatar = updates.avatar_url === undefined
      ? existingUser.avatar_url
      : updates.avatar_url;

    await UserModel.updateProfile(userId, {
      name: updatedName,
      avatar_url: updatedAvatar,
    });

    return UserModel.findById(userId);
  },
};

module.exports = AuthService;

'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const config = require('../config');
const UserModel = require('../models/UserModel');
const AppError = require('../utils/AppError');

const SALT_ROUNDS = 12;

const AuthService = {
  async register({ name, username, mobile, mpin }) {
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedMobile = mobile.trim();

    const existingUser = await UserModel.findByUsername(
      normalizedUsername
    );

    if (existingUser) {
      throw new AppError(
        'This username is already taken.',
        409,
        'USERNAME_ALREADY_EXISTS'
      );
    }

    const mpin_hash = await bcrypt.hash(mpin, SALT_ROUNDS);

    let userId;

    try {
      userId = await UserModel.create({
        name: name.trim(),
        username: normalizedUsername,
        mobile: normalizedMobile,
        mpin_hash,
      });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new AppError(
          'This username is already taken.',
          409,
          'USERNAME_ALREADY_EXISTS'
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

  async login({ username, mpin }) {
    const normalizedUsername = username.trim().toLowerCase();

    const userRecord = await UserModel.findByUsername(
      normalizedUsername
    );

    if (
      !userRecord ||
      !userRecord.mpin_hash ||
      !(await bcrypt.compare(mpin, userRecord.mpin_hash))
    ) {
      throw new AppError(
        'Invalid username or MPIN.',
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
      {
        sub: String(user.id),
      },
      config.jwt.secret,
      {
        algorithm: 'HS256',
        expiresIn: config.jwt.expiresIn,
        issuer: config.jwt.issuer,
        audience: config.jwt.audience,
        jwtid: require('crypto').randomUUID(),
      }
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

    await UserModel.updateProfile(userId, {
      name: updates.name,
      mobile: updates.mobile,
      avatar_url: updates.avatar_url,
    });

    return UserModel.findById(userId);
  },
};

module.exports = AuthService;

'use strict';

require('dotenv').config();

module.exports = {
  // ─── Database ────────────────────────────────────────────────────────────────
  db: {
    host:               process.env.DB_HOST     || 'localhost',
    port:           parseInt(process.env.DB_PORT || '3306', 10),
    user:               process.env.DB_USER     || 'root',
    password:           process.env.DB_PASSWORD || '',
    database:           process.env.DB_NAME     || 'splitcircle',
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0,
    timezone:           '+00:00',
    dateStrings:        false,
  },

  // ─── JWT ─────────────────────────────────────────────────────────────────────
  jwt: {
    secret:    process.env.JWT_SECRET     || 'dev_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // ─── App ─────────────────────────────────────────────────────────────────────
  app: {
    port:        parseInt(process.env.PORT || '3001', 10),
    env:         process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    // Comma-separated list of additional allowed origins (e.g. deployed frontend)
    allowedOrigins: process.env.ALLOWED_ORIGINS || '',
  },

  // ─── File Storage ────────────────────────────────────────────────────────────
  storage: {
    provider:      process.env.STORAGE_PROVIDER  || 'local',
    localUploadDir: process.env.LOCAL_UPLOAD_DIR || './uploads',
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
    ],
  },

  // ─── Rate Limiting ───────────────────────────────────────────────────────────
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max:      parseInt(process.env.RATE_LIMIT_MAX        || '100',    10),
    authMax:  parseInt(process.env.AUTH_RATE_LIMIT_MAX   || '20',     10),
  },
};

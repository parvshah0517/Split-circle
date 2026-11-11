
'use strict';

require('dotenv').config();

const env = process.env.NODE_ENV || 'development';

const jwtSecret = process.env.JWT_SECRET;

if (env === 'production' && (!jwtSecret || jwtSecret.length < 32)) {
  throw new Error(
    'Production requires a JWT_SECRET of at least 32 characters.'
  );
}

module.exports = {
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'splitcircle',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+00:00',
    dateStrings: false,
  },

  jwt: {
    secret: jwtSecret || 'development_only_change_this_secret_32_chars',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'splitcircle-api',
    audience: process.env.JWT_AUDIENCE || 'splitcircle-client',
  },

  app: {
    port: parseInt(process.env.PORT || '3001', 10),
    env,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    allowedOrigins: process.env.ALLOWED_ORIGINS || '',
  },

  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    localUploadDir: process.env.LOCAL_UPLOAD_DIR || './uploads',
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
    ],
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5', 10),
  },
};

'use strict';

const express     = require('express');
const helmet      = require('helmet');
const cors        = require('cors');
const rateLimit   = require('express-rate-limit');
const path        = require('path');
const config      = require('./config');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ─── Security Headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin:      config.app.frontendUrl,
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Global Rate Limiter ──────────────────────────────────────────────────────
app.use(rateLimit({
  windowMs: config.rateLimit.windowMs,
  max:      config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    code:    'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please try again later.',
  },
}));

// ─── Static File Serving (Local Storage) ─────────────────────────────────────
// Serves uploaded receipts/documents in development.
// In production this will be replaced by presigned S3 URLs.
app.use('/uploads', express.static(path.resolve(config.storage.localUploadDir)));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));

// ─── API Routes ───────────────────────────────────────────────────────────────
// Routes will be registered here as each module is implemented:
// app.use('/api/auth',          require('./routes/auth'));
// app.use('/api/users',         require('./routes/users'));
// app.use('/api/rooms',         require('./routes/rooms'));
// app.use('/api/approvals',     require('./routes/approvals'));
// app.use('/api/notifications', require('./routes/notifications'));

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    code:    'NOT_FOUND',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// ─── Global Error Handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

module.exports = app;

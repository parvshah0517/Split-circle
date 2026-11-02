'use strict';

require('dotenv').config();

const app    = require('./app');
const config = require('./config');
const db     = require('./config/database');

async function startServer() {
  // Verify database connectivity before accepting traffic
  await db.testConnection();

  const server = app.listen(config.app.port, () => {
    console.log(`
╔═══════════════════════════════════════════╗
║         SplitCircle API Server            ║
╠═══════════════════════════════════════════╣
║  Port    : ${String(config.app.port).padEnd(32)}║
║  Env     : ${config.app.env.padEnd(32)}║
║  DB      : ${config.db.database.padEnd(32)}║
╚═══════════════════════════════════════════╝
    `);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n[server] ${signal} received — shutting down gracefully`);
    server.close(() => {
      console.log('[server] HTTP server closed');
      process.exit(0);
    });
    // Force exit after 10s if connections don't close
    setTimeout(() => {
      console.error('[server] Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    console.error('[server] Unhandled promise rejection:', reason);
  });
}

startServer().catch(err => {
  console.error('[server] Fatal startup error:', err);
  process.exit(1);
});

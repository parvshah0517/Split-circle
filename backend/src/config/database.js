'use strict';

const mysql  = require('mysql2/promise');
const config = require('./index');

let pool;

/**
 * Returns the singleton MySQL connection pool.
 * Creates the pool on first call.
 */
function getPool() {
  if (!pool) {
    pool = mysql.createPool(config.db);
    console.log('[DB] Connection pool created');
  }
  return pool;
}

/**
 * Execute a query using the shared pool.
 * @param {string} sql
 * @param {Array}  params
 * @returns {Promise<[rows, fields]>}
 */
async function query(sql, params = []) {
  const p = getPool();
  return p.execute(sql, params);
}

/**
 * Get a dedicated connection for transactions.
 * Caller is responsible for calling connection.release().
 * @returns {Promise<PoolConnection>}
 */
async function getConnection() {
  return getPool().getConnection();
}

/**
 * Test the database connection on startup.
 */
async function testConnection() {
  try {
    const [rows] = await query('SELECT 1 AS ok');
    if (rows[0].ok === 1) {
      console.log('[DB] Connected to MySQL successfully');
    }
  } catch (err) {
    console.error('[DB] Failed to connect to MySQL:', err.message);
    process.exit(1);
  }
}

module.exports = { getPool, query, getConnection, testConnection };

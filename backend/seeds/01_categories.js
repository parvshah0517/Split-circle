'use strict';

require('dotenv').config({
  path: require('path').join(__dirname, '../.env'),
});

const mysql = require('mysql2/promise');
const config = require('../src/config');

const CATEGORIES = [
  { name: 'Food & Drink', icon: '🍽️' },
  { name: 'Transport', icon: '🚗' },
  { name: 'Accommodation', icon: '🏨' },
  { name: 'Entertainment', icon: '🎬' },
  { name: 'Shopping', icon: '🛍️' },
  { name: 'Utilities', icon: '💡' },
  { name: 'Healthcare', icon: '🏥' },
  { name: 'Groceries', icon: '🛒' },
  { name: 'Travel', icon: '✈️' },
  { name: 'Education', icon: '📚' },
  { name: 'Other', icon: '📦' },
];

async function run() {
  const conn = await mysql.createConnection(config.db);

  try {
    console.log(`[seed] Categories database: ${config.db.database}`);

    for (const category of CATEGORIES) {
      await conn.execute(
        `INSERT INTO categories (name, icon, is_system)
         VALUES (?, ?, 1)
         ON DUPLICATE KEY UPDATE icon = VALUES(icon)`,
        [category.name, category.icon]
      );
    }

    console.log('[seed] Categories ready.');
  } finally {
    await conn.end();
  }
}

module.exports = { run };
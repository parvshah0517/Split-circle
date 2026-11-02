'use strict';

/**
 * Category seed.
 * Inserts the default system expense categories.
 * Safe to run multiple times (INSERT IGNORE).
 *
 * Run with:  npm run seed   (from /backend)
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mysql = require('mysql2/promise');
const cfg   = require('../src/config');

const CATEGORIES = [
  { name: 'Food & Drink',    icon: '🍽️' },
  { name: 'Transport',       icon: '🚗' },
  { name: 'Accommodation',   icon: '🏨' },
  { name: 'Entertainment',   icon: '🎬' },
  { name: 'Shopping',        icon: '🛍️' },
  { name: 'Utilities',       icon: '💡' },
  { name: 'Healthcare',      icon: '🏥' },
  { name: 'Groceries',       icon: '🛒' },
  { name: 'Travel',          icon: '✈️' },
  { name: 'Education',       icon: '📚' },
  { name: 'Other',           icon: '📦' },
];

async function run() {
  const conn = await mysql.createConnection({
    ...cfg.db,
    multipleStatements: false,
  });

  await conn.query(`USE \`${cfg.db.database}\``);
  console.log(`[seed] Seeding categories into: ${cfg.db.database}`);

  for (const cat of CATEGORIES) {
    await conn.execute(
      `INSERT IGNORE INTO categories (name, icon, is_system) VALUES (?, ?, 1)`,
      [cat.name, cat.icon]
    );
    console.log(`[seed] ✓ ${cat.name}`);
  }

  console.log('[seed] Categories seeded successfully.');
  await conn.end();
}

run().catch(err => {
  console.error('[seed] Fatal error:', err);
  process.exit(1);
});

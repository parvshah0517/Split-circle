
'use strict';

require('dotenv').config({
  path: require('path').join(__dirname, '../.env')
});

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const cfg = require('../src/config');

async function run() {
  // Connect to MySQL server without selecting a database
  const conn = await mysql.createConnection({
    ...cfg.db,
    database: undefined,
    multipleStatements: true,
  });

  try {
    // Create application database if it doesn't exist
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${cfg.db.database}\``
    );

    // Select application database
    await conn.query(`USE \`${cfg.db.database}\``);

    console.log(`[migrate] Using database: ${cfg.db.database}`);

    const migrationsDir = __dirname;

    const files = fs
      .readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const sqlPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(sqlPath, 'utf8');

      console.log(`[migrate] Running: ${file}`);

      await conn.query(sql);

      console.log(`[migrate] ✓ ${file}`);
    }

    console.log('[migrate] All migrations applied successfully.');

  } finally {
    await conn.end();
  }
}

run().catch(err => {
  console.error('[migrate] Fatal error:', err);
  process.exit(1);
});

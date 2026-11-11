
'use strict';

require('dotenv').config({
  path: require('path').join(__dirname, '../.env'),
});

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const cfg = require('../src/config');

const EXISTING_TABLES = [
  'users',
  'rooms',
  'room_members',
  'categories',
  'expenses',
  'expense_splits',
  'expense_revisions',
  'expense_approvals',
  'documents',
  'settlements',
  'settlement_allocations',
  'room_budgets',
  'notifications',
  'activity_logs',
];

async function createMigrationTable(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      migration_name VARCHAR(255) NOT NULL,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_migration_name (migration_name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

async function baselineExistingMigrations(conn, files) {
  const [records] = await conn.query(
    'SELECT COUNT(*) AS total FROM schema_migrations'
  );

  if (records[0].total > 0) return;

  const [rows] = await conn.query(
    `SELECT TABLE_NAME
     FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ?
       AND TABLE_TYPE = 'BASE TABLE'`,
    [cfg.db.database]
  );

  const existingTables = new Set(rows.map(row => row.TABLE_NAME));

  const applicationTablesExist = EXISTING_TABLES.every(
    table => existingTables.has(table)
  );

  const anyApplicationTableExists = EXISTING_TABLES.some(
    table => existingTables.has(table)
  );

  if (applicationTablesExist) {
    console.log('[migrate] Existing application schema detected.');
    console.log('[migrate] Recording migrations 001–014 as baseline.');

    for (const file of files) {
      if (/^0(0[1-9]|1[0-4])_/.test(file)) {
        await conn.query(
          'INSERT INTO schema_migrations (migration_name) VALUES (?)',
          [file]
        );
      }
    }

    return;
  }

  if (anyApplicationTableExists) {
    throw new Error(
      'Partially existing application schema detected. ' +
      'Migration baseline requires manual verification.'
    );
  }

  console.log('[migrate] Fresh database detected.');
}

async function run() {
  const conn = await mysql.createConnection({
    ...cfg.db,
    database: undefined,
    multipleStatements: true,
  });

  try {
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${cfg.db.database}\``
    );

    await conn.query(`USE \`${cfg.db.database}\``);

    console.log(`[migrate] Using database: ${cfg.db.database}`);

    await createMigrationTable(conn);

    const files = fs
      .readdirSync(__dirname)
      .filter(file => /^\d+_.*\.sql$/.test(file))
      .sort();

    await baselineExistingMigrations(conn, files);

    for (const file of files) {
      const [rows] = await conn.query(
        'SELECT migration_name FROM schema_migrations WHERE migration_name = ?',
        [file]
      );

      if (rows.length > 0) {
        console.log(`[migrate] Skipping already applied: ${file}`);
        continue;
      }

      const sqlPath = path.join(__dirname, file);
      const sql = fs.readFileSync(sqlPath, 'utf8');

      console.log(`[migrate] Running: ${file}`);

      await conn.query(sql);

      await conn.query(
        'INSERT INTO schema_migrations (migration_name) VALUES (?)',
        [file]
      );

      console.log(`[migrate] Applied: ${file}`);
    }

    console.log('[migrate] All pending migrations completed.');
  } finally {
    await conn.end();
  }
}

run().catch(err => {
  console.error('[migrate] Fatal error:', err);
  process.exit(1);
});

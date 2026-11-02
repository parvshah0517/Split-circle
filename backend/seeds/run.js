'use strict';

/**
 * Seeds runner — executes all seed files in filename order.
 * Run with:  npm run seed   (from /backend)
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const fs   = require('fs');
const path = require('path');

async function run() {
  const seedsDir = __dirname;
  const files = fs
    .readdirSync(seedsDir)
    .filter(f => f.endsWith('.js') && f !== 'run.js')
    .sort();

  for (const file of files) {
    console.log(`\n[seeds] Running: ${file}`);
    // Each seed file exports its own connection and run() logic
    require(path.join(seedsDir, file));
    // Give async seeds time to complete
    await new Promise(r => setTimeout(r, 1000));
  }
}

run().catch(err => {
  console.error('[seeds] Fatal error:', err);
  process.exit(1);
});

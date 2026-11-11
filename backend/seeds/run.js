'use strict';

require('dotenv').config({
  path: require('path').join(__dirname, '../.env'),
});

const fs = require('fs');
const path = require('path');

async function run() {
  const files = fs
    .readdirSync(__dirname)
    .filter(file => file.endsWith('.js') && file !== 'run.js')
    .sort();

  for (const file of files) {
    console.log(`\n[seeds] Running: ${file}`);

    const seed = require(path.join(__dirname, file));

    if (!seed || typeof seed.run !== 'function') {
      throw new Error(`${file} must export an async run() function.`);
    }

    await seed.run();

    console.log(`[seeds] Completed: ${file}`);
  }

  console.log('\n[seeds] All seeds completed successfully.');
}

run().catch(error => {
  console.error('\n[seeds] Fatal error:', error);
  process.exit(1);
});
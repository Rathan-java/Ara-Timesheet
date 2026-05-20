// Applies schema.sql to whichever database the pool is pointed at.
// Safe to re-run on an empty database; will fail on a populated one
// (because CREATE TYPE / CREATE TABLE conflict). Use `npm run seed`
// to repopulate after init.

const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function main() {
  const schemaPath = path.join(__dirname, '..', 'config', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  const client = await pool.connect();
  try {
    console.log(`Applying schema from ${schemaPath}...`);
    await client.query(sql);
    console.log('Schema applied successfully.');
  } catch (err) {
    console.error('Schema apply failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();

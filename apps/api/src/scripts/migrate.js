const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function main() {
  const sqlPath = path.resolve(__dirname, '../../../../packages/db/migrations/001_init.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  await pool.query(sql);
  console.log('Migrations applied.');
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

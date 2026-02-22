const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function main() {
  const sqlPath = path.resolve(__dirname, '../../../../packages/db/seed/seed.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  await pool.query(sql);

  const passwordHash = await bcrypt.hash('Admin@12345', 10);

  const userResult = await pool.query(
    `INSERT INTO users(id, tenant_id, full_name, email, password_hash, auth_provider)
     VALUES($1,$2,$3,$4,$5,'local')
     ON CONFLICT (tenant_id, email) DO UPDATE SET full_name = EXCLUDED.full_name
     RETURNING id`,
    [
      '11111111-1111-1111-1111-111111111301',
      '11111111-1111-1111-1111-111111111111',
      'Platform Admin',
      'admin@shreshlabs.com',
      passwordHash
    ]
  );

  await pool.query(
    `INSERT INTO user_roles(tenant_id, user_id, role_id)
     VALUES($1,$2,$3)
     ON CONFLICT DO NOTHING`,
    [
      '11111111-1111-1111-1111-111111111111',
      userResult.rows[0].id,
      '11111111-1111-1111-1111-111111111201'
    ]
  );

  await pool.query(
    `INSERT INTO employees(id, tenant_id, employee_code, full_name, email, department, job_title, employment_type, joining_date)
     VALUES
     ('11111111-1111-1111-1111-111111111401', $1, 'EMP-001', 'Aarav Sharma', 'aarav@shreshlabs.com', 'Engineering', 'SRE', 'Full-time', CURRENT_DATE),
     ('11111111-1111-1111-1111-111111111402', $1, 'EMP-002', 'Neha Verma', 'neha@shreshlabs.com', 'People Ops', 'HR Manager', 'Full-time', CURRENT_DATE)
     ON CONFLICT (tenant_id, employee_code) DO NOTHING`,
    ['11111111-1111-1111-1111-111111111111']
  );

  console.log('Seed complete. Login: admin@shreshlabs.com / Admin@12345');
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

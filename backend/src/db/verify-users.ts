import 'dotenv/config';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DB_URL });

(async () => {
  const r = await pool.query(
    'SELECT email, role, password FROM users ORDER BY role',
  );
  const candidates = [
    'admin12345',
    'Password123!',
    'password',
    'admin',
    'Admin@123',
    'password123',
    '123456',
  ];

  for (const u of r.rows) {
    let found = '';
    for (const pw of candidates) {
      if (await bcrypt.compare(pw, u.password)) {
        found = pw;
        break;
      }
    }
    console.log(
      `${u.role.padEnd(24)} | ${u.email.padEnd(34)} | ${found ? 'password=' + found : 'NO MATCH hash=' + u.password}`,
    );
  }
  await pool.end();
})();

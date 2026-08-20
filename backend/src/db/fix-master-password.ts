import 'dotenv/config';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DB_URL });

(async () => {
  const hashed = await bcrypt.hash('admin12345', 10);
  const r = await pool.query(
    'UPDATE users SET password = $1 WHERE email = $2 RETURNING email, role',
    [hashed, 'master@college.com'],
  );
  if (r.rows.length === 0) {
    console.log('⚠️ master@college.com not found — nothing updated.');
  } else {
    console.log(
      `✅ Reset password for ${r.rows[0].role} <${r.rows[0].email}> to admin12345`,
    );
  }
  await pool.end();
})();

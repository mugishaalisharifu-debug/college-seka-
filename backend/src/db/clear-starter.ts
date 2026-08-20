import 'dotenv/config';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

export async function clearStarterData() {
  console.log('Purging starter & demo data from database...\n');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Delete sample data in dependency order
    await client.query('DELETE FROM store_transactions');
    await client.query('DELETE FROM student_store_deposits');
    await client.query('DELETE FROM store_items');
    await client.query('DELETE FROM inventory_transactions');
    await client.query('DELETE FROM student_requirement_checks');
    await client.query('DELETE FROM student_requirement_notes');
    await client.query('DELETE FROM requirement_items');
    await client.query('DELETE FROM application_documents');
    await client.query('DELETE FROM applications');
    await client.query('DELETE FROM payments');
    await client.query('DELETE FROM fee_structures');
    await client.query('DELETE FROM students');
    await client.query('DELETE FROM classes');
    await client.query('DELETE FROM news');
    await client.query('DELETE FROM gallery');
    await client.query('DELETE FROM downloads');
    await client.query('DELETE FROM contact_messages');
    await client.query('DELETE FROM inventory_items');

    // Re-seed or update default staff accounts with valid bcrypt password hash
    const defaultPassword = 'admin12345';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const STAFF_ACCOUNTS = [
      {
        role: 'Admin',
        email: 'admin@college.com',
        name: 'System Administrator',
        scope: 'All',
      },
      {
        role: 'Secondary-HeadMaster',
        email: 'master@college.com',
        name: 'Secondary Headmaster',
        scope: 'LOWER SECONDARY',
      },
      {
        role: 'Primary-HeadMaster',
        email: 'headmaster.primary@college.com',
        name: 'Primary Headmaster',
        scope: 'PRIMARY',
      },
      {
        role: 'DOS-Secondary',
        email: 'dos.secondary@college.com',
        name: 'DOS Secondary',
        scope: 'LOWER SECONDARY',
      },
      {
        role: 'DOS-Tvet',
        email: 'dos.tvet@college.com',
        name: 'DOS TVET',
        scope: 'TVET',
      },
      {
        role: 'Bursar',
        email: 'bursar@college.com',
        name: 'Bursar',
        scope: 'All',
      },
      {
        role: 'Cashier',
        email: 'cashier@college.com',
        name: 'Cashier',
        scope: 'All',
      },
      {
        role: 'Store-Manager',
        email: 'store.manager@school.rw',
        name: 'Store Manager',
        scope: 'All',
      },
      {
        role: 'School-receptionist',
        email: 'reception@college.com',
        name: 'Receptionist',
        scope: 'All',
      },
    ];

    for (const acc of STAFF_ACCOUNTS) {
      const existing = await client.query(
        'SELECT id FROM users WHERE email = $1 OR role = $2',
        [acc.email, acc.role],
      );
      if (existing.rows.length === 0) {
        await client.query(
          `INSERT INTO users (email, name, role, password, scope) VALUES ($1, $2, $3, $4, $5)`,
          [acc.email, acc.name, acc.role, hashedPassword, acc.scope],
        );
      } else {
        await client.query(
          `UPDATE users SET password = $1, email = $2, name = $3, scope = $4 WHERE id = $5`,
          [hashedPassword, acc.email, acc.name, acc.scope, existing.rows[0].id],
        );
      }
      console.log(`Staff account active: ${acc.role} <${acc.email}>`);
    }

    await client.query('COMMIT');
    console.log(
      '\nStarter data purged successfully. Default staff accounts ready.',
    );
    return { success: true, message: 'Starter data cleared successfully.' };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error clearing starter data:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  clearStarterData()
    .then(() => pool.end())
    .catch(() => process.exit(1));
}

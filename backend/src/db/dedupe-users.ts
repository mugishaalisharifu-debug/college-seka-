import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, sql } from 'drizzle-orm';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

const db = drizzle(pool, { schema });

async function main() {
  console.log('🔍 Checking for duplicate users...\n');

  // Find duplicate emails
  const duplicates = await db.execute(sql`
    SELECT email, COUNT(*) as count
    FROM users
    GROUP BY email
    HAVING COUNT(*) > 1
  `);

  const duplicateRows = duplicates.rows as { email: string; count: number }[];

  if (duplicateRows.length === 0) {
    console.log('✅ No duplicate users found.');
    await pool.end();
    return;
  }

  console.log(`⚠️ Found ${duplicateRows.length} email(s) with duplicates:\n`);

  for (const dup of duplicateRows) {
    const email = String(dup.email);
    const count = Number(dup.count);
    console.log(`  ${email} — ${count} entries`);

    // Get all users with this email, ordered by id
    const users = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));

    // Keep the first one (smallest id), delete the rest
    const [keep, ...toDelete] = users;

    console.log(`    Keeping: ${keep.id} (${keep.name})`);

    for (const user of toDelete) {
      await db.delete(schema.users).where(eq(schema.users.id, user.id));
      console.log(`    Deleted: ${user.id} (${user.name})`);
    }
  }

  console.log('\n✅ Deduplication complete.');
  await pool.end();
}

main().catch((err) => {
  console.error('❌ Deduplication failed:', err);
  process.exit(1);
});

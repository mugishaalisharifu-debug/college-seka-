import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

const db = drizzle(pool, { schema });

async function main() {
  console.log("Fixing users: remove duplicates and ensure one per role...\n");

  const defaultPassword = "admin12345";
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const ROLE_SCOPES: Record<string, "PRIMARY" | "LOWER SECONDARY" | "TVET" | "NURSERY" | "All"> = {
    "Secondary-HeadMaster": "LOWER SECONDARY",
    "Primary-HeadMaster": "PRIMARY",
    "DOS-Secondary": "LOWER SECONDARY",
    "DOS-Tvet": "TVET",
    Admin: "All",
    Bursar: "All",
    Cashier: "All",
    "School-receptionist": "All",
    "Store-Manager": "All",
  };

  const roles = Object.keys(ROLE_SCOPES);

  // Find duplicates
  const dupResult = await db.execute(sql`
    SELECT email, COUNT(*) as count
    FROM users
    GROUP BY email
    HAVING COUNT(*) > 1
  `);
  const duplicates = dupResult.rows as { email: string; count: number }[];

  for (const dup of duplicates) {
    const email = String(dup.email);
    const users = await db.select().from(schema.users).where(eq(schema.users.email, email));
    const [keep, ...toDelete] = users;
    
    // Update dependent records to point to kept user
    await db.execute(sql`
      UPDATE news SET author_id = ${keep.id} WHERE author_id = ${toDelete[0].id}
    `);
    await db.execute(sql`
      UPDATE gallery SET author_id = ${keep.id} WHERE author_id = ${toDelete[0].id}
    `);
    
    for (const u of toDelete) {
      await db.delete(schema.users).where(eq(schema.users.id, u.id));
      console.log(`Deleted duplicate: ${u.email} (${u.id})`);
    }
  }

  // Ensure exactly one user per role
  for (const role of roles) {
    const existing = await db.select().from(schema.users).where(eq(schema.users.role, role as any));
    
    if (existing.length === 0) {
      await db.insert(schema.users).values({
        email: `${role.toLowerCase().replace(/[^a-z0-9]/g, "")}@cfsg.ac.rw`,
        name: role,
        role: role as any,
        password: hashedPassword,
        scope: ROLE_SCOPES[role],
      });
      console.log(`Created: ${role}`);
    } else {
      await db
        .update(schema.users)
        .set({ scope: ROLE_SCOPES[role] })
        .where(eq(schema.users.role, role as any));
      if (existing.length > 1) {
        const [keep, ...toDelete] = existing;
        for (const u of toDelete) {
          await db.delete(schema.users).where(eq(schema.users.id, u.id));
          console.log(`Deleted duplicate role: ${role} (${u.id})`);
        }
      }
    }
  }

  console.log("\nUsers are now clean.");
  const allUsers = await db.select().from(schema.users);
  console.log(`Total users: ${allUsers.length}`);
  allUsers.forEach(u => console.log(`  - ${u.role}: ${u.email}`));
  
  await pool.end();
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

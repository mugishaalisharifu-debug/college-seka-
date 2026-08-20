import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

const db = drizzle(pool, { schema });

async function main() {
  console.log("🌱 Starting CFSG users seed...");

  try {
    // ============================================================
    // DEFAULT PASSWORD
    // ============================================================

    const defaultPassword = "admin12345";

    // Hash password ONCE and reuse it
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // ============================================================
    // PREDEFINED USERS
    // ============================================================

    const users = [
      {
        name: "Master Administrator",
        email: "admin@college.com",
        role: "Admin" as const,
        scope: "All" as const,
      },

      {
        name: "Primary Headmaster",
        email: "headmaster.primary@college.com",
        role: "Primary-HeadMaster" as const,
        scope: "PRIMARY" as const,
      },

      {
        name: "Secondary Headmaster",
        email: "headmaster.secondary@college.com",
        role: "Secondary-HeadMaster" as const,
        scope: "LOWER SECONDARY" as const,
      },

      {
        name: "Secondary DOS",
        email: "dos.secondary@college.com",
        role: "DOS-Secondary" as const,
        scope: "LOWER SECONDARY" as const,
      },

      {
        name: "TVET DOS",
        email: "dos.tvet@college.com",
        role: "DOS-Tvet" as const,
        scope: "TVET" as const,
      },

      {
        name: "School Bursar",
        email: "bursar@college.com",
        role: "Bursar" as const,
        scope: "All" as const,
      },

      {
        name: "School Cashier",
        email: "cashier@college.com",
        role: "Cashier" as const,
        scope: "All" as const,
      },

      {
        name: "School Receptionist",
        email: "reception@college.com",
        role: "School-receptionist" as const,
        scope: "All" as const,
      },

      {
        name: "Store Manager",
        email: "store@college.com",
        role: "Store-Manager" as const,
        scope: "All" as const,
      },
    ];

    // ============================================================
    // INSERT USERS
    // ============================================================

    for (const user of users) {
      const existingUser = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, user.email))
        .limit(1);

      if (existingUser.length > 0) {
        console.log(`⚠️ Already exists: ${user.email}`);
        continue;
      }

      await db.insert(schema.users).values({
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
        scope: user.scope,
      });

      console.log(`✓ Created: ${user.email}`);
    }

    // ============================================================
    // SUMMARY
    // ============================================================

    console.log("");
    console.log("==========================================");
    console.log("🎉 CFSG USERS SEEDED SUCCESSFULLY");
    console.log("==========================================");
    console.log("");
    console.log("Default password for all accounts:");
    console.log(`Password: ${defaultPassword}`);
    console.log("");
    console.log("Accounts:");

    for (const user of users) {
      console.log(`• ${user.email} → ${user.role}`);
    }

    console.log("");
    console.log("==========================================");
    console.log("⚠️ Development password only.");
    console.log("Change passwords before production.");
    console.log("==========================================");

  } catch (error) {
    console.error("");
    console.error("❌ USER SEED FAILED");
    console.error(error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
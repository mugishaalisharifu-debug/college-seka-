import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../db/schema";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.DB_URL) {
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

const db = drizzle(pool, { schema });

async function main() {
  const defaultPassword = "Password123!";
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const usersToSeed: (typeof schema.users.$inferInsert)[] = [
    {
      name: "Jean Paul Ndayishimiye",
      email: "admin@school.rw",
      password: hashedPassword,
      role: "Admin",
      scope: "All",
    },
    {
      name: "Dr. Emmanuel Habimana",
      email: "sec.headmaster@school.rw",
      password: hashedPassword,
      role: "Secondary-HeadMaster",
      scope: "LOWER SECONDARY",
    },
    {
      name: "Marie Claire Uwimana",
      email: "prim.headmaster@school.rw",
      password: hashedPassword,
      role: "Primary-HeadMaster",
      scope: "PRIMARY",
    },
    {
      name: "Innocent Mugisha",
      email: "dos.secondary@school.rw",
      password: hashedPassword,
      role: "DOS-Secondary",
      scope: "LOWER SECONDARY",
    },
    {
      name: "Patrick Nshimiyimana",
      email: "dos.tvet@school.rw",
      password: hashedPassword,
      role: "DOS-Tvet",
      scope: "TVET",
    },
    {
      name: "Grace Mukamana",
      email: "bursar@school.rw",
      password: hashedPassword,
      role: "Bursar",
      scope: "All",
    },
    {
      name: "Eric Bizimana",
      email: "cashier@school.rw",
      password: hashedPassword,
      role: "Cashier",
      scope: "All",
    },
    {
      name: "Chantal Mutoni",
      email: "receptionist@school.rw",
      password: hashedPassword,
      role: "School-receptionist",
      scope: "All",
    },
    {
      name: "Bosco Gasana",
      email: "store.manager@school.rw",
      password: hashedPassword,
      role: "Store-Manager",
      scope: "All",
    },
  ];

  await db
    .insert(schema.users)
    .values(usersToSeed)
    .onConflictDoNothing({ target: schema.users.email });

  await pool.end();
  process.exit(0);
}

main().catch(() => {
  process.exit(1);
});

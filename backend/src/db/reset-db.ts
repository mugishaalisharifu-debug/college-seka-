import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

async function main() {
  console.log("Resetting database with clean data...\n");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Delete all data in dependency order
    await client.query("DELETE FROM inventory_transactions");
    await client.query("DELETE FROM application_documents");
    await client.query("DELETE FROM applications");
    await client.query("DELETE FROM news");
    await client.query("DELETE FROM gallery");
    await client.query("DELETE FROM downloads");
    await client.query("DELETE FROM contact_messages");
    await client.query("DELETE FROM requirement_collections");
    await client.query("DELETE FROM school_supplies");
    await client.query("DELETE FROM students");
    await client.query("DELETE FROM classes");
    await client.query("DELETE FROM users");
    await client.query("DELETE FROM cashier_transactions");
    await client.query("DELETE FROM fee_structures");
    await client.query("DELETE FROM payments");

    // Create exactly one user per role
    const roles = [
      "Secondary-HeadMaster",
      "Primary-HeadMaster",
      "DOS-Secondary",
      "DOS-Tvet",
      "Admin",
      "Bursar",
      "Cashier",
      "School-receptionist",
      "Store-Manager",
    ];

    const passwordHash = "$2b$10$dummy.hash.for.seed";
    
    for (const role of roles) {
      const email = `${role.toLowerCase().replace(/[^a-z0-9]/g, "")}@cfsg.ac.rw`;
      await client.query(
        `INSERT INTO users (email, name, role, password, scope) VALUES ($1, $2, $3, $4, $5)`,
        [email, role, role, passwordHash, "All"]
      );
      console.log(`Created: ${role} <${email}>`);
    }

    await client.query("COMMIT");
    console.log("\nDatabase reset complete. Total users:", roles.length);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();

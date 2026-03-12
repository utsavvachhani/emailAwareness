import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./database.js";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPERADMIN_EMAIL = "superadmin@cybershieldguard.com";
const SUPERADMIN_PASSWORD = "SuperAdmin@123";

export const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    console.log("🔄 Initializing database...");

    // ── 1. Execute the full schema as one query ───────────────────────────────
    //    PostgreSQL handles the entire script atomically; IF NOT EXISTS and
    //    ALTER TABLE ADD COLUMN IF NOT EXISTS make it fully idempotent.
    const schemaPath = path.join(__dirname, "../../database/schema.sql");
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }

    const schema = fs.readFileSync(schemaPath, "utf8");
    await client.query(schema);
    console.log("✅ Database schema applied");

    // ── 2. Seed / sync superadmin with a fresh bcrypt hash ───────────────────
    const hash = await bcrypt.hash(SUPERADMIN_PASSWORD, 10);

    await client.query(
      `INSERT INTO superadmins
         (first_name, last_name, email, password_hash, role, is_verified, status)
       VALUES ('Super', 'Admin', $1, $2, 'superadmin', TRUE, 'active')
       ON CONFLICT (email) DO UPDATE
         SET password_hash = EXCLUDED.password_hash,
             role           = 'superadmin',
             is_verified    = TRUE,
             status         = 'active'`,
      [SUPERADMIN_EMAIL, hash]
    );

    await client.query(
      `INSERT INTO profiles (superadmin_id, organization)
       SELECT id, 'CyberShield Guard' FROM superadmins WHERE email = $1
       ON CONFLICT (superadmin_id) DO NOTHING`,
      [SUPERADMIN_EMAIL]
    );

    console.log("✅ Superadmin synced:", SUPERADMIN_EMAIL);
    console.log("✅ Database initialization complete");
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    throw error;
  } finally {
    client.release();
  }
};

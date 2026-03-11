import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const initializeDatabase = async () => {
  try {
    console.log("🔄 Initializing database...");

    // Test database connection
    const client = await pool.connect();
    console.log("✅ Database connection successful");

    // Read and execute schema file
    const schemaPath = path.join(__dirname, "../../database/schema.sql");

    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, "utf8");
      await client.query(schema);
      console.log("✅ Database schema initialized");
    } else {
      console.warn("⚠️  Schema file not found, skipping initialization");
    }

    client.release();
    console.log("✅ Database initialization complete");
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    console.error(
      "Please ensure PostgreSQL is running and DATABASE_URL is correct in .env",
    );
    throw error;
  }
};

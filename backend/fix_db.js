import pool from "./src/config/database.js";

async function fixSchema() {
  console.log("Synchronizing PostgreSQL schema with new module structure...");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Add 'content' to course_modules if not exists
    await client.query(`ALTER TABLE course_modules ADD COLUMN IF NOT EXISTS content TEXT`);
    console.log("- Ensured 'content' exists in 'course_modules'");

    // 2. Rename 'content' to 'contentextra' in course_modules_docs if needed
    const colRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'course_modules_docs' AND column_name = 'content'
    `);
    
    if (colRes.rows.length > 0) {
      await client.query(`ALTER TABLE course_modules_docs RENAME COLUMN content TO contentextra`);
      console.log("- Renamed 'content' to 'contentextra' in 'course_modules_docs'");
    } else {
      console.log("- 'contentextra' already confirmed in 'course_modules_docs'");
    }

    // 3. Remove 'content' from course_modules_video
    await client.query(`ALTER TABLE course_modules_video DROP COLUMN IF EXISTS content`);
    console.log("- Removed legacy 'content' from 'course_modules_video'");

    await client.query("COMMIT");
    console.log("✅ Database schema is now synchronized perfectly!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Database synchronization failed:", err.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

fixSchema();

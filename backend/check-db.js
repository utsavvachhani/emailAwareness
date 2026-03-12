import pool from "./src/config/database.js";

async function check() {
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("Tables in database:");
    res.rows.forEach(r => console.log(`- ${r.table_name}`));
  } catch (err) {
    console.error("Error checking tables:", err);
  } finally {
    process.exit(0);
  }
}

check();

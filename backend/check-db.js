import pool from "./src/config/database.js";

async function checkUsers() {
  try {
    const result = await pool.query(
      "SELECT id, email, first_name, last_name, is_verified FROM users",
    );
    console.log("Current Users in DB:");
    console.table(result.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUsers();

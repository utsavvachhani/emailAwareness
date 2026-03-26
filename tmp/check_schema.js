import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://postgres:utsav21@localhost:5432/emailawareness"
});

async function check() {
  const res = await pool.query(`
    SELECT column_name, ordinal_position, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'course_modules'
    ORDER BY ordinal_position;
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  process.exit(0);
}

check().catch(console.error);

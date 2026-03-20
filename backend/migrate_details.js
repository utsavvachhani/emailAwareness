import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function migrate() {
  try {
    // 1. Create Employees table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id            SERIAL PRIMARY KEY,
        first_name    VARCHAR(100) NOT NULL,
        last_name     VARCHAR(100) NOT NULL,
        email         VARCHAR(255) NOT NULL,
        company_id    INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        designation   VARCHAR(100),
        status        VARCHAR(20) DEFAULT 'active',
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create Courses table (Shared library)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id            SERIAL PRIMARY KEY,
        title         VARCHAR(255) NOT NULL,
        description   TEXT,
        thumbnail     TEXT,
        category      VARCHAR(50),
        duration      VARCHAR(20),
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Create Company-Course mapping
    await pool.query(`
      CREATE TABLE IF NOT EXISTS company_courses (
        id            SERIAL PRIMARY KEY,
        company_id    INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        course_id     INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        assigned_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Create Employee-Course Progress
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employee_progress (
        id            SERIAL PRIMARY KEY,
        employee_id   INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        course_id     INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        status        VARCHAR(20) DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
        progress      INTEGER DEFAULT 0,
        score         INTEGER,
        completed_at  TIMESTAMP,
        updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed some initial courses if none exist
    const courseCheck = await pool.query("SELECT count(*) FROM courses");
    if (courseCheck.rows[0].count === "0") {
      await pool.query(`
        INSERT INTO courses (title, description, category, duration) 
        VALUES 
        ('Phishing Awareness 101', 'Learn how to identify and avoid phishing emails.', 'Email Security', '30 mins'),
        ('Password Best Practices', 'Everything you need to know about creating secure passwords.', 'General Security', '15 mins'),
        ('Social Engineering Tactics', 'Advanced session on how attackers manipulate people.', 'General Security', '45 mins'),
        ('Safe Remote Working', 'Best practices for securing your home office setup.', 'Remote Work', '20 mins');
      `);
      console.log("Seeded initial courses");
    }

    console.log("Migration successful: added employees, courses, and progress tables");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await pool.end();
  }
}

migrate();

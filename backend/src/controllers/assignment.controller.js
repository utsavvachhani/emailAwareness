import pool from "../config/database.js";
import { hashPassword } from "../utils/auth.js";
import { sendCourseAssignmentEmail, sendCertificateEmail } from "../utils/email.js";
import { generateCertificatePDF } from "../utils/certificate.js";

// ─── INTERNAL: Schema Enforcement ─────────────────────────────────────────────
const ensureSchema = async (clientOrPool) => {
  await clientOrPool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'user',
      is_verified BOOLEAN NOT NULL DEFAULT FALSE,
      assigned_courses INTEGER[] DEFAULT ARRAY[]::INTEGER[],
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_courses INTEGER[] DEFAULT ARRAY[]::INTEGER[];

    CREATE TABLE IF NOT EXISTS employee_progress (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      employee_id INTEGER,
      course_id INTEGER,
      module_id INTEGER,
      status VARCHAR(20) DEFAULT 'not_started',
      completed_at TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      quiz_score INTEGER,
      quiz_responses JSONB,
      UNIQUE(user_id, module_id)
    );
    ALTER TABLE employee_progress ADD COLUMN IF NOT EXISTS user_id INTEGER;
    ALTER TABLE employee_progress ADD COLUMN IF NOT EXISTS course_id INTEGER;
    
    ALTER TABLE employee_progress ADD COLUMN IF NOT EXISTS quiz_score INTEGER;
    ALTER TABLE employee_progress ADD COLUMN IF NOT EXISTS quiz_responses JSONB;

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'employee_progress_user_id_module_id_key') THEN
        ALTER TABLE employee_progress ADD CONSTRAINT employee_progress_user_id_module_id_key UNIQUE(user_id, module_id);
      END IF;
    END $$;
  `);
};

// ─── ADMIN: Assign course to employees ─────────────────────────────────────────
export const assignCourseToEmployees = async (req, res) => {
  const { courseId } = req.params;
  const { employeeIds } = req.body; // Array of employee internal IDs

  if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
    return res.status(400).json({ success: false, message: "No employees selected" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Get Course Info
    const courseRes = await client.query("SELECT title FROM courses WHERE id = $1", [courseId]);
    if (courseRes.rows.length === 0) throw new Error("Course not found");
    const courseTitle = courseRes.rows[0].title;

    // 2. Ensure Schema exists (insurance)
    await ensureSchema(client);

    // 3. Process each employee
    for (const empId of employeeIds) {
      const empRes = await client.query("SELECT * FROM employees WHERE id = $1", [empId]);
      if (empRes.rows.length === 0) continue;
      const emp = empRes.rows[0];

      // Update employee table with assigned course
      await client.query(
        "UPDATE employees SET assigned_courses = array_append(COALESCE(assigned_courses, '{}'), $1) WHERE id = $2 AND NOT ($1 = ANY(COALESCE(assigned_courses, '{}')))",
        [courseId, empId]
      );

      // 3. User account management
      const userRes = await client.query("SELECT id FROM users WHERE email = $1", [emp.email]);
      let userId;

      if (userRes.rows.length === 0) {
        // Create new user
        const passwordPlain = emp.email.split('@')[0].substring(0, 5) + "@123";
        const hashedPassword = await hashPassword(passwordPlain);
        
        const newUserRes = await client.query(
          `INSERT INTO users (first_name, last_name, email, password_hash, role, is_verified, assigned_courses)
           VALUES ($1, $2, $3, $4, 'user', true, ARRAY[$5]::INTEGER[]) RETURNING id`,
          [emp.first_name, emp.last_name, emp.email, hashedPassword, courseId]
        );
        userId = newUserRes.rows[0].id;

        // Send Welcome & Assignment Email
        await sendCourseAssignmentEmail(emp.email, `${emp.first_name} ${emp.last_name}`, courseTitle, passwordPlain);
      } else {
        userId = userRes.rows[0].id;
        // Update existing user with new course
        await client.query(
          "UPDATE users SET assigned_courses = array_append(COALESCE(assigned_courses, '{}'), $1) WHERE id = $2 AND NOT ($1 = ANY(COALESCE(assigned_courses, '{}')))",
          [courseId, userId]
        );
        // Maybe send a simpler notification here? The user said "sends the all user thi kind of mauil"
        const passwordPlain = emp.email.split('@')[0].substring(0, 5) + "@123"; // Re-calculate to show in email if needed (risky but requested)
        await sendCourseAssignmentEmail(emp.email, `${emp.first_name} ${emp.last_name}`, courseTitle, passwordPlain);
      }
    }

    await client.query("COMMIT");
    return res.status(200).json({ success: true, message: "Course assigned and users notified successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("assignCourseToEmployees error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  } finally {
    client.release();
  }
};

// ─── USER: Mark Module Complete ────────────────────────────────────────────────
export const markModuleComplete = async (req, res) => {
  const { moduleId } = req.params;
  const userId = req.user.id;

  try {
    // 1. Get Course ID
    const moduleRes = await pool.query("SELECT course_id FROM course_modules WHERE id = $1", [moduleId]);
    if (moduleRes.rows.length === 0) return res.status(404).json({ success: false, message: "Module not found" });
    const courseId = moduleRes.rows[0].course_id;

    // 2. Ensure Schema exists
    await ensureSchema(pool);

    const { score, responses } = req.body;

    // 3. Upsert into employee_progress
    await pool.query(
      `INSERT INTO employee_progress (user_id, course_id, module_id, status, completed_at, quiz_score, quiz_responses)
       VALUES ($1, $2, $3, 'completed', CURRENT_TIMESTAMP, $4, $5)
       ON CONFLICT (user_id, module_id) DO UPDATE 
       SET status = 'completed', 
           completed_at = CURRENT_TIMESTAMP, 
           updated_at = CURRENT_TIMESTAMP,
           quiz_score = COALESCE(EXCLUDED.quiz_score, employee_progress.quiz_score),
           quiz_responses = COALESCE(EXCLUDED.quiz_responses, employee_progress.quiz_responses)`,
      [userId, courseId, moduleId, score !== undefined ? score : null, responses ? JSON.stringify(responses) : null]
    );

    // FIRE AND FORGET: Trigger certificate check asynchronously
    checkCourseCompletionAndSendCertificate(userId, courseId).catch(console.error);

    return res.status(200).json({ success: true, message: "Module marked as completed" });
  } catch (err) {
    console.error("markModuleComplete error:", err);
    return res.status(500).json({ success: false, message: err.message || "Internal server error" });
  }
};

// ─── USER: Unmark Module Complete ──────────────────────────────────────────────
export const unmarkModuleComplete = async (req, res) => {
  const { moduleId } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "DELETE FROM employee_progress WHERE user_id = $1 AND module_id = $2 RETURNING *",
      [userId, moduleId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "No progress record found to unmark" });
    }

    return res.status(200).json({ success: true, message: "Module unmarked as incomplete" });
  } catch (err) {
    console.error("unmarkModuleComplete error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── USER: Get Course Progress ────────────────────────────────────────────────
export const getUserCourseProgress = async (req, res) => {
  const userId = req.user.id;
  try {
    // Self-healing: ensure schema
    await ensureSchema(pool);

    const result = await pool.query(
      "SELECT module_id, status, quiz_score, quiz_responses FROM employee_progress WHERE user_id = $1",
      [userId]
    );
    return res.status(200).json({ success: true, progress: result.rows });
  } catch (err) {
    console.error("getUserCourseProgress error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── USER: Get my assigned courses ────────────────────────────────────────────
export const getAssignedCourses = async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const userId = req.user.id;

  try {
    // 1. Get the assigned courses array from users table
    const userRes = await pool.query("SELECT assigned_courses FROM users WHERE id = $1", [userId]);
    
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const assignedIds = userRes.rows[0].assigned_courses || [];

    // 2. Fetch specific course details if any are assigned
    if (!assignedIds || assignedIds.length === 0 || assignedIds.filter(id => id !== null).length === 0) {
      return res.status(200).json({ success: true, courses: [] });
    }

    // Filter out nulls and ensure integer array
    const validIds = assignedIds.filter(id => id !== null);

    const result = await pool.query(
      `SELECT c.*, comp.name as company_name 
       FROM courses c 
       JOIN companies comp ON c.company_id = comp.id
       WHERE c.id = ANY($1) AND c.status = 'approved'
       ORDER BY c.created_at DESC`,
      [validIds]
    );

    return res.status(200).json({ success: true, courses: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── INTERNAL: Check Completion & Send Email ──────────────────────────────────
async function checkCourseCompletionAndSendCertificate(userId, courseId) {
  try {
    // 1. Get total module count vs completed count
    const totalModulesRes = await pool.query("SELECT COUNT(*) FROM course_modules WHERE course_id = $1 AND status = 'published'", [courseId]);
    const completedModulesRes = await pool.query("SELECT COUNT(*) FROM employee_progress WHERE user_id = $1 AND course_id = $2 AND status = 'completed'", [userId, courseId]);

    const totalCount = parseInt(totalModulesRes.rows[0].count);
    const completedCount = parseInt(completedModulesRes.rows[0].count);

    if (totalCount > 0 && totalCount === completedCount) {
      // 1.5. NEW: Check if all quizzes meet the minimum score threshold (>= 3)
      const quizThresholdRes = await pool.query(
        `SELECT COUNT(*) FROM employee_progress p
         JOIN course_modules m ON p.module_id = m.id
         WHERE p.user_id = $1 AND p.course_id = $2 AND m.type = 'quiz' AND p.quiz_score < 3`,
        [userId, courseId]
      );
      
      const failingQuizzes = parseInt(quizThresholdRes.rows[0].count);
      if (failingQuizzes > 0) {
        console.log(`⚠️ Certification deferred for USER ${userId}: ${failingQuizzes} assessments below threshold.`);
        return; 
      }

      // 2. Fetch details for certificate
      const userRes = await pool.query("SELECT first_name, last_name, email FROM users WHERE id = $1", [userId]);
      const courseRes = await pool.query("SELECT title FROM courses WHERE id = $1", [courseId]);

      if (userRes.rows.length > 0 && courseRes.rows.length > 0) {
        const user = userRes.rows[0];
        const course = courseRes.rows[0];
        const fullName = `${user.first_name} ${user.last_name}`;
        const issueDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

        // 3. Generate high-fidelity PDF
        const pdfBuffer = await generateCertificatePDF(fullName, course.title, issueDate);

        // 4. Dispatch security-hardened email
        await sendCertificateEmail(user.email, fullName, course.title, pdfBuffer);
        console.log(`🏆 Certificate dispatched for: ${fullName} on course: ${course.title}`);
      }
    }
  } catch (err) {
    console.error("checkCourseCompletion error:", err);
  }
}

// ─── USER: Download Certificate ────────────────────────────────────────────────
export const generateCertificate = async (req, res) => {
  const { course_id } = req.params;
  const userId = req.user.id;

  try {
    // 1. Verification of completion
    const totalModulesRes = await pool.query("SELECT COUNT(*) FROM course_modules WHERE course_id = $1 AND status = 'published'", [course_id]);
    const completedModulesRes = await pool.query("SELECT COUNT(*) FROM employee_progress WHERE user_id = $1 AND course_id = $2 AND status = 'completed'", [userId, course_id]);

    const totalCount = parseInt(totalModulesRes.rows[0].count);
    const completedCount = parseInt(completedModulesRes.rows[0].count);

    if (totalCount === 0 || totalCount !== completedCount) {
      return res.status(403).json({ success: false, message: "Curriculum requirements not met for certification" });
    }

    // 1.5. Mastery Verification
    const quizThresholdRes = await pool.query(
      `SELECT COUNT(*) FROM employee_progress p
       JOIN course_modules m ON p.module_id = m.id
       WHERE p.user_id = $1 AND p.course_id = $2 AND m.type = 'quiz' AND p.quiz_score < 3`,
      [userId, course_id]
    );
    
    if (parseInt(quizThresholdRes.rows[0].count) > 0) {
      return res.status(403).json({ 
        success: false, 
        message: "Instructional competency threshold not met. All assessments must achieve a minimum score of 3/5." 
      });
    }

    // 2. Data Retrieval
    const userRes = await pool.query("SELECT first_name, last_name FROM users WHERE id = $1", [userId]);
    const courseRes = await pool.query("SELECT title FROM courses WHERE id = $1", [course_id]);

    const fullName = `${userRes.rows[0].first_name} ${userRes.rows[0].last_name}`;
    const issueDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    // 3. Synthesis
    const pdfBuffer = await generateCertificatePDF(fullName, courseRes.rows[0].title, issueDate);

    // 4. Response Header Configuration
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Certificate_${course_id}.pdf`);
    
    return res.end(pdfBuffer);
  } catch (err) {
    console.error("generateCertificate error:", err);
    return res.status(500).json({ success: false, message: "Synthesis error during certificate generation" });
  }
};

// ─── USER: Email Certificate to Self ───────────────────────────────────────────
export const emailCertificate = async (req, res) => {
  const { course_id } = req.params;
  const userId = req.user.id;

  try {
    // 1. Completion verification
    const totalModulesRes = await pool.query("SELECT COUNT(*) FROM course_modules WHERE course_id = $1 AND status = 'published'", [course_id]);
    const completedModulesRes = await pool.query("SELECT COUNT(*) FROM employee_progress WHERE user_id = $1 AND course_id = $2 AND status = 'completed'", [userId, course_id]);

    const totalCount = parseInt(totalModulesRes.rows[0].count);
    const completedCount = parseInt(completedModulesRes.rows[0].count);

    if (totalCount === 0 || totalCount !== completedCount) {
      return res.status(403).json({ success: false, message: "Curriculum requirements not met for certification" });
    }

    // 1.5. Mastery Verification
    const quizThresholdRes = await pool.query(
      `SELECT COUNT(*) FROM employee_progress p
       JOIN course_modules m ON p.module_id = m.id
       WHERE p.user_id = $1 AND p.course_id = $2 AND m.type = 'quiz' AND p.quiz_score < 3`,
      [userId, course_id]
    );
    if (parseInt(quizThresholdRes.rows[0].count) > 0) {
      return res.status(403).json({ success: false, message: "Competency threshold not met." });
    }

    // 2. Data Retrieval
    const userRes = await pool.query("SELECT first_name, last_name, email FROM users WHERE id = $1", [userId]);
    const courseRes = await pool.query("SELECT title FROM courses WHERE id = $1", [course_id]);

    const user = userRes.rows[0];
    const fullName = `${user.first_name} ${user.last_name}`;
    const issueDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    // 3. Generate PDF
    const pdfBuffer = await generateCertificatePDF(fullName, courseRes.rows[0].title, issueDate);

    // 4. Email it
    await sendCertificateEmail(user.email, fullName, courseRes.rows[0].title, pdfBuffer);

    return res.status(200).json({ success: true, message: `Certificate emailed to ${user.email}` });
  } catch (err) {
    console.error("emailCertificate error:", err);
    return res.status(500).json({ success: false, message: "Failed to email certificate" });
  }
};

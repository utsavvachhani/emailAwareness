import pool from "../config/database.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";

// ─── Plan limits ──────────────────────────────────────────────────────────────
const PLAN_COURSE_LIMITS = { basic: 2, standard: 4, premium: 6 };
const PLAN_MODULE_LIMITS = { basic: 5, standard: 8, premium: 12 };
const PLAN_VIDEO_LIMITS  = { basic: 1, standard: 3, premium: 5 };



// ─── Helper: resolve company from either numeric id or company_id string ──────
const resolveCompany = async (companyParam, adminId) => {
  const isNumeric = /^\d+$/.test(String(companyParam));
  const col = isNumeric ? "id" : "company_id";
  const result = await pool.query(
    `SELECT id, company_id, name, plan, is_paid
     FROM companies
     WHERE ${col} = $1 AND admin_id = $2`,
    [companyParam, adminId]
  );
  return result.rows[0] ?? null;
};

// ─── ADMIN: Get plan info (for frontend gate) ─────────────────────────────────
export const getCompanyPlanInfo = async (req, res) => {
  const { company_id } = req.params;
  try {
    const company = await resolveCompany(company_id, req.user.id);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    const limit = PLAN_COURSE_LIMITS[company.plan] ?? 0;
    const moduleLimit = PLAN_MODULE_LIMITS[company.plan] ?? 0;
    const videoLimit  = PLAN_VIDEO_LIMITS[company.plan] ?? 0;

    // Count existing non-rejected courses
    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS cnt FROM courses WHERE company_id = $1 AND status != 'rejected'`,
      [company.id]
    );
    const course_count = countRes.rows[0]?.cnt ?? 0;

    const can_create = !!company.is_paid && !!company.plan && company.plan !== "none" && course_count < limit;

    return res.status(200).json({
      success: true,
      plan: company.plan ?? "none",
      is_paid: company.is_paid ?? false,
      course_count,
      course_limit: limit,
      module_limit: moduleLimit,
      video_limit: videoLimit,
      can_create,
    });

  } catch (err) {
    console.error("getCompanyPlanInfo:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

// ─── ADMIN: Get courses for a company ────────────────────────────────────────
export const getAdminCoursesByCompany = async (req, res) => {
  const { company_id } = req.params;
  try {
    const company = await resolveCompany(company_id, req.user.id);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    const result = await pool.query(
      `SELECT c.*, comp.plan AS "companyPlan"
       FROM courses c
       JOIN companies comp ON c.company_id = comp.id
       WHERE c.company_id = $1
       ORDER BY c.created_at DESC`,
      [company.id]
    );
    return res.status(200).json({ success: true, courses: result.rows });
  } catch (err) {
    console.error("getAdminCoursesByCompany:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

// ─── ADMIN: Create a course (goes to pending, gated by plan) ─────────────────
export const createCourse = async (req, res) => {
  const { title, description, total_duration, difficulty } = req.body;
  // company_id param from URL (may be company_id string)
  const { company_id } = req.params;

  if (!title) {
    return res.status(400).json({ success: false, message: "Course title is required" });
  }

  const validDifficulty = ["low", "medium", "high"];
  if (difficulty && !validDifficulty.includes(difficulty)) {
    return res.status(400).json({ success: false, message: "Difficulty must be low, medium, or high" });
  }

  try {
    // Verify company belongs to this admin
    const company = await resolveCompany(company_id, req.user.id);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found or unauthorized" });
    }

    // Must have paid plan
    if (!company.is_paid || !company.plan || company.plan === "none") {
      return res.status(403).json({
        success: false,
        message: "Your company needs an active paid subscription to create courses.",
      });
    }

    const limit = PLAN_COURSE_LIMITS[company.plan] ?? 0;

    // Count non-rejected courses for this company
    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS cnt FROM courses WHERE company_id = $1 AND status != 'rejected'`,
      [company.id]
    );
    const currentCount = countRes.rows[0]?.cnt ?? 0;

    if (currentCount >= limit) {
      return res.status(403).json({
        success: false,
        message: `Your ${company.plan} plan allows max ${limit} course(s). Upgrade your plan to create more.`,
      });
    }

    const result = await pool.query(
      `INSERT INTO courses (title, description, total_duration, difficulty, admin_id, company_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`,
      [title, description ?? null, total_duration ?? null, difficulty ?? "medium", req.user.id, company.id]
    );
    return res.status(201).json({
      success: true,
      message: "Course submitted for superadmin approval",
      course: result.rows[0],
    });
  } catch (err) {
    console.error("createCourse:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

// ─── ADMIN: Delete own course ─────────────────────────────────────────────────
export const deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Verify and get module assets
    const modulesRes = await pool.query(
      `SELECT m.video_url, m.image_url FROM course_modules m
       JOIN courses c ON m.course_id = c.id
       JOIN companies comp ON c.company_id = comp.id
       WHERE c.id = $1 AND comp.admin_id = $2`,
      [id, req.user.id]
    );

    // 2. Delete the course (will cascade delete modules if setup in DB, 
    // but we can also delete them manually if not)
    // Actually, USING companies for verification is good.
    const result = await pool.query(
      `DELETE FROM courses c USING companies comp
       WHERE c.id = $1 AND c.company_id = comp.id AND comp.admin_id = $2
       RETURNING c.id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Course not found or unauthorized" });
    }

    // 3. Cleanup Cloudinary if DB delete succeeded
    for (const m of modulesRes.rows) {
      if (m.video_url) await deleteFromCloudinary(m.video_url);
      if (m.image_url) await deleteFromCloudinary(m.image_url);
    }

    return res.status(200).json({ success: true, message: "Course and associated assets deleted" });
  } catch (err) {
    console.error("deleteCourse:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

// ─── SUPERADMIN: Get ALL courses ──────────────────────────────────────────────
export const getAllCourses = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT c.*,
             comp.name AS "companyName", comp.plan AS "companyPlan",
             a.first_name AS "adminFirstName", a.last_name AS "adminLastName", a.email AS "adminEmail"
      FROM courses c
      LEFT JOIN companies comp ON c.company_id = comp.id
      LEFT JOIN admins a ON c.admin_id = a.id
    `;
    const params = [];
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      query += ` WHERE c.status = $1`;
      params.push(status);
    }
    query += ` ORDER BY c.created_at DESC`;
    const result = await pool.query(query, params);
    return res.status(200).json({ success: true, courses: result.rows });
  } catch (err) {
    console.error("getAllCourses:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

// ─── SUPERADMIN: Approve ──────────────────────────────────────────────────────
export const approveCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE courses SET status = 'approved', rejection_reason = NULL WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    return res.status(200).json({ success: true, message: "Course approved", course: result.rows[0] });
  } catch (err) {
    console.error("approveCourse:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

// ─── SUPERADMIN: Reject ───────────────────────────────────────────────────────
export const rejectCourse = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  try {
    const result = await pool.query(
      `UPDATE courses SET status = 'rejected', rejection_reason = $1 WHERE id = $2 RETURNING *`,
      [reason ?? null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    return res.status(200).json({ success: true, message: "Course rejected", course: result.rows[0] });
  } catch (err) {
    console.error("rejectCourse:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};
// ─── SUPERADMIN: Reset to Pending ─────────────────────────────────────────────
export const resetCourseToPending = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE courses SET status = 'pending', rejection_reason = NULL WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    return res.status(200).json({ success: true, message: "Course reset to pending", course: result.rows[0] });
  } catch (err) {
    console.error("resetCourseToPending:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

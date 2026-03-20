import pool from "../config/database.js";
import { sendCompanyCreatedNotification } from "../utils/email.js";

// ─── Helper: generate a unique company ID ─────────────────────────────────────
const genCompanyId = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const prefix = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * 26)]).join("");
  const nums = String(Math.floor(Math.random() * 90000) + 10000);
  return `${prefix}-${nums}`;
};

// ─── Get all companies for this admin ─────────────────────────────────────────
export const getMyCompanies = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, 
              a.first_name AS "adminFirstName", a.last_name AS "adminLastName", a.email AS "adminEmail"
       FROM companies c
       LEFT JOIN admins a ON c.admin_id = a.id
       WHERE c.admin_id = $1
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    return res.status(200).json({ success: true, companies: result.rows });
  } catch (err) {
    console.error("getMyCompanies:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

// ─── Create company ────────────────────────────────────────────────────────────
export const createCompany = async (req, res) => {
  const { name, email, phone, num_employees, industry, website, address, notes } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, message: "Company name and email are required" });
  }
  try {
    let company_id = genCompanyId();
    // ensure unique
    const check = await pool.query("SELECT id FROM companies WHERE company_id = $1", [company_id]);
    if (check.rows.length > 0) company_id = genCompanyId() + "-2";

    const result = await pool.query(
      `INSERT INTO companies (company_id, name, email, phone, num_employees, admin_id, industry, website, address, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [company_id, name, email, phone, num_employees || 0, req.user.id, industry, website, address, notes]
    );
    const company = result.rows[0];

    // Send notification email to admin
    const adminRes = await pool.query(
      `SELECT first_name AS "firstName", last_name AS "lastName", email FROM admins WHERE id = $1`,
      [req.user.id]
    );
    if (adminRes.rows.length > 0) {
      const admin = adminRes.rows[0];
      sendCompanyCreatedNotification(
        admin.email,
        `${admin.firstName} ${admin.lastName}`,
        name,
        company_id
      ).catch(() => {});
    }

    return res.status(201).json({ success: true, message: "Company created", company });
  } catch (err) {
    console.error("createCompany:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

// ─── Update company ────────────────────────────────────────────────────────────
export const updateCompany = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, num_employees, industry, website, address, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE companies SET name=$1, email=$2, phone=$3, num_employees=$4, industry=$5,
              website=$6, address=$7, notes=$8
       WHERE id=$9 AND admin_id=$10
       RETURNING *`,
      [name, email, phone, num_employees, industry, website, address, notes, id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Company not found or unauthorized" });
    return res.status(200).json({ success: true, message: "Company updated", company: result.rows[0] });
  } catch (err) {
    console.error("updateCompany:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

// ─── Delete company (admin deletes own) ───────────────────────────────────────
export const deleteMyCompany = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM companies WHERE id=$1 AND admin_id=$2 RETURNING id",
      [id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Company not found or unauthorized" });
    return res.status(200).json({ success: true, message: "Company deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

// ─── Superadmin: Get ALL companies ────────────────────────────────────────────
export const getAllCompanies = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*,
              a.first_name AS "adminFirstName", a.last_name AS "adminLastName",
              a.email AS "adminEmail", a.id AS "adminId"
       FROM companies c
       LEFT JOIN admins a ON c.admin_id = a.id
       ORDER BY c.created_at DESC`
    );
    return res.status(200).json({ success: true, companies: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

// ─── Superadmin: Delete any company ──────────────────────────────────────────
export const deleteCompany = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM companies WHERE id=$1 RETURNING id", [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Company not found" });
    return res.status(200).json({ success: true, message: "Company deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};
// ─── Superadmin: Update company status ─────────────────────────────────────────
export const updateCompanyStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved', 'rejected', 'pending'

  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  try {
    const result = await pool.query(
      "UPDATE companies SET status=$1 WHERE id=$2 RETURNING *",
      [status, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Company not found" });
    
    return res.status(200).json({ 
      success: true, 
      message: `Company ${status}`, 
      company: result.rows[0] 
    });
  } catch (err) {
    console.error("updateCompanyStatus:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};
// ─── Get Company Details (By ID) ──────────────────────────────────────────────
export const getMyCompanyDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM companies WHERE id=$1 AND admin_id=$2",
      [id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Company not found" });
    return res.status(200).json({ success: true, company: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

// ─── Employee Management ─────────────────────────────────────────────────────
export const getCompanyEmployees = async (req, res) => {
  const { id: company_id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM employees WHERE company_id=$1 ORDER BY created_at DESC",
      [company_id]
    );
    return res.status(200).json({ success: true, employees: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

export const createEmployee = async (req, res) => {
  const { id: company_id } = req.params;
  const { first_name, last_name, email, designation } = req.body;
  if (!first_name || !last_name || !email) {
    return res.status(400).json({ success: false, message: "First name, last name, and email are required" });
  }
  try {
    const result = await pool.query(
      `INSERT INTO employees (first_name, last_name, email, company_id, designation)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [first_name, last_name, email, company_id, designation]
    );
    return res.status(201).json({ success: true, message: "Employee created", employee: result.rows[0] });
  } catch (err) {
    console.error("createEmployee:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

// ─── Course Management ───────────────────────────────────────────────────────
export const getCompanyCourses = async (req, res) => {
  const { id: company_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT c.*, cc.assigned_at 
       FROM courses c
       JOIN company_courses cc ON c.id = cc.course_id
       WHERE cc.company_id = $1`,
      [company_id]
    );
    return res.status(200).json({ success: true, courses: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

export const getAllAvailableCourses = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM courses");
    return res.status(200).json({ success: true, courses: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

export const assignCourseToCompany = async (req, res) => {
  const { id: company_id } = req.params;
  const { course_id } = req.body;
  try {
    // Check if already assigned
    const check = await pool.query("SELECT id FROM company_courses WHERE company_id=$1 AND course_id=$2", [company_id, course_id]);
    if (check.rows.length > 0) return res.status(400).json({ success: false, message: "Course already assigned" });

    await pool.query("INSERT INTO company_courses (company_id, course_id) VALUES ($1, $2)", [company_id, course_id]);
    return res.status(200).json({ success: true, message: "Course assigned successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

// ─── Company Stats (Reports) ──────────────────────────────────────────────────
export const getCompanyStats = async (req, res) => {
  const { id: company_id } = req.params;
  try {
    const employeesCount = await pool.query("SELECT count(*) FROM employees WHERE company_id=$1", [company_id]);
    const coursesCount = await pool.query("SELECT count(*) FROM company_courses WHERE company_id=$1", [company_id]);
    
    // Progress stats
    const progress = await pool.query(
      `SELECT status, count(*) 
       FROM employee_progress ep
       JOIN employees e ON ep.employee_id = e.id
       WHERE e.company_id = $1
       GROUP BY status`,
      [company_id]
    );

    return res.status(200).json({ 
      success: true, 
      stats: {
        totalEmployees: parseInt(employeesCount.rows[0].count),
        assignedCourses: parseInt(coursesCount.rows[0].count),
        progress: progress.rows
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

// ─── Admin Global Stats ──────────────────────────────────────────────────────
export const getAdminGlobalStats = async (req, res) => {
  try {
    const companies = await pool.query("SELECT count(*) FROM companies WHERE admin_id=$1", [req.user.id]);
    const employees = await pool.query(
      "SELECT count(*) FROM employees e JOIN companies c ON e.company_id = c.id WHERE c.admin_id = $1",
      [req.user.id]
    );
    const courses = await pool.query("SELECT count(*) FROM courses");

    return res.status(200).json({
      success: true,
      stats: {
        totalCompanies: parseInt(companies.rows[0].count),
        totalEmployees: parseInt(employees.rows[0].count),
        totalCourses: parseInt(courses.rows[0].count),
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

// ─── Admin Global Employees ──────────────────────────────────────────────────
export const getAdminEmployees = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, c.name AS "companyName"
       FROM employees e
       JOIN companies c ON e.company_id = c.id
       WHERE c.admin_id = $1
       ORDER BY e.created_at DESC`,
      [req.user.id]
    );
    return res.status(200).json({ success: true, employees: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

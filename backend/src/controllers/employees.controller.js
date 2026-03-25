import pool from "../config/database.js";

// ─── Resolve the internal company serial ID from the provided identifier ───────
const getInternalCompanyId = async (id) => {
  // If it's pure digits, consider it a potential serial ID
  if (/^\d+$/.test(id)) {
      return parseInt(id, 10);
  }
  
  // Otherwise, lookup by the public company_id (e.g., TOB-45660)
  const result = await pool.query("SELECT id FROM companies WHERE company_id = $1", [id]);
  if (result.rows.length === 0) return null;
  return result.rows[0].id;
};

// ─── Get all employees for a specific company ─────────────────────────────────
export const getEmployeesByCompany = async (req, res) => {
  const { id: identifier } = req.params; 
  try {
    const internalId = await getInternalCompanyId(identifier);
    if (!internalId) {
        return res.status(404).json({ success: false, message: "Company not found" });
    }

    const result = await pool.query(
      "SELECT * FROM employees WHERE company_id = $1 ORDER BY created_at DESC",
      [internalId]
    );
    return res.status(200).json({ success: true, employees: result.rows });
  } catch (err) {
    console.error("getEmployeesByCompany error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Get all employees in the system (Superadmin) ──────────────────────────────
export const getAllEmployees = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, c.name AS company_name 
       FROM employees e 
       JOIN companies c ON e.company_id = c.id 
       ORDER BY e.created_at DESC`
    );
    return res.status(200).json({ success: true, employees: result.rows });
  } catch (err) {
    console.error("getAllEmployees error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// ─── Create a new employee ─────────────────────────────────────────────────────
export const createEmployee = async (req, res) => {
  const { id: identifier } = req.params;
  const { first_name, last_name, email, designation } = req.body;

  if (!first_name || !last_name || !email) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const PLAN_LIMITS = { basic: 30, standard: 75, premium: 120 };

  try {
    const internalId = await getInternalCompanyId(identifier);
    if (!internalId) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    // ── Plan & payment check ─────────────────────────────────────────────────
    const companyRes = await pool.query(
      "SELECT plan, is_paid FROM companies WHERE id = $1",
      [internalId]
    );
    const company = companyRes.rows[0];

    if (!company) {
      return res.status(404).json({ success: false, message: "Company record not found" });
    }

    const plan = (company.plan || "none").toLowerCase();
    const isPaid = company.is_paid;

    if (plan === "none" || !isPaid) {
      return res.status(403).json({
        success: false,
        limitReached: false,
        unpaid: true,
        message: "Payment required. Please subscribe to a plan and complete payment before adding employees.",
      });
    }

    const limit = PLAN_LIMITS[plan];
    if (!limit) {
      return res.status(400).json({ success: false, message: "Invalid subscription plan." });
    }

    // ── Duplicate Cleanup (Optional: 'deleted your particular added names') ────
    // Before checking limit or inserting, we delete any existing employee with SAME email
    // This allows re-adding/replacing someone without hitting the limit twice for the same email
    await pool.query(
      "DELETE FROM employees WHERE company_id = $1 AND email = $2",
      [internalId, email]
    );

    // ── Count existing employees ─────────────────────────────────────────────
    const countRes = await pool.query(
      "SELECT COUNT(*)::int AS total FROM employees WHERE company_id = $1",
      [internalId]
    );

    const currentCount = countRes.rows[0].total;

    if (currentCount >= limit) {
      return res.status(403).json({
        success: false,
        limitReached: true,
        current: currentCount,
        limit,
        plan,
        message: `Employee limit reached for your ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan (${currentCount}/${limit}). Please upgrade your plan to add more employees.`,
      });
    }

    // ── Insert ───────────────────────────────────────────────────────────────
    const result = await pool.query(
      `INSERT INTO employees (first_name, last_name, email, company_id, designation, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [first_name, last_name, email, internalId, designation || "Associate", "active"]
    );
    return res.status(201).json({ success: true, employee: result.rows[0] });
  } catch (err) {
    console.error("createEmployee error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// ─── Update employee ───────────────────────────────────────────────────────────
export const updateEmployee = async (req, res) => {
  const { employeeId } = req.params;
  const { first_name, last_name, email, designation, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE employees 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           email = COALESCE($3, email),
           designation = COALESCE($4, designation),
           status = COALESCE($5, status),
           updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [first_name, last_name, email, designation, status, employeeId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Employee not found" });
    }

    return res.status(200).json({ success: true, employee: result.rows[0] });
  } catch (err) {
    console.error("updateEmployee error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Delete employee ───────────────────────────────────────────────────────────
export const deleteEmployee = async (req, res) => {
  const { employeeId } = req.params;
  try {
    const result = await pool.query("DELETE FROM employees WHERE id = $1 RETURNING *", [employeeId]);
    if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Employee not found" });
    }
    return res.status(200).json({ success: true, message: "Employee deleted successfully" });
  } catch (err) {
    console.error("deleteEmployee error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

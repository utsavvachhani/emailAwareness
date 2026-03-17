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

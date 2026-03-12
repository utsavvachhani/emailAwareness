import pool from "../config/database.js";
import { comparePassword, issueTokens, clearAuthCookies } from "../utils/auth.js";
import { sendAdminApprovalResult, sendSuperadminLoginAlert } from "../utils/email.js";

// ─── Superadmin Signin ──────────────────────────────────────────────────────────
export const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      `SELECT id, first_name AS "firstName", last_name AS "lastName", email, password_hash, role
       FROM superadmins WHERE email = $1 AND role = 'superadmin'`,
      [email.toLowerCase().trim()]
    );
    const user = result.rows[0];

    if (!user || !(await comparePassword(password, user.password_hash))) {
      return res.status(401).json({ success: false, message: "Invalid superadmin credentials" });
    }

    const { accessToken, refreshToken } = issueTokens(res, user);
    await pool.query("UPDATE superadmins SET last_login = NOW() WHERE id = $1", [user.id]);
    await pool.query("INSERT INTO refresh_tokens (superadmin_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')", [user.id, refreshToken]);

    // Audit and Alert
    const ip = req.ip || req.headers["x-forwarded-for"] || "Unknown";
    await pool.query(
      "INSERT INTO login_audit (superadmin_id, email, role, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)",
      [user.id, user.email, user.role, ip, req.headers["user-agent"]]
    );
    sendSuperadminLoginAlert(user.email, new Date().toLocaleString(), ip).catch(() => {});

    const { password_hash, ...safeUser } = user;
    return res.status(200).json({ success: true, message: "Superadmin login successful", user: safeUser, accessToken, refreshToken });
  } catch (error) {
    console.error("Superadmin Signin error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Superadmin Logout ─────────────────────────────────────────────────────────
export const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [refreshToken]);
  clearAuthCookies(res);
  return res.status(200).json({ success: true, message: "Logged out" });
};

// ─── Management: Admins ────────────────────────────────────────────────────────
export const getPendingAdmins = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name AS "firstName", last_name AS "lastName", email, mobile, role, status, is_verified, created_at
       FROM admins WHERE role = 'admin' AND status = 'pending' ORDER BY created_at DESC`
    );
    return res.status(200).json({ success: true, admins: result.rows });
  } catch (error) { return res.status(500).json({ success: false, message: "Internal error" }); }
};

export const getAllAdmins = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name AS "firstName", last_name AS "lastName", email, mobile, status, is_verified, created_at, last_login
       FROM admins WHERE role = 'admin' ORDER BY created_at DESC`
    );
    return res.status(200).json({ success: true, admins: result.rows });
  } catch (error) { return res.status(500).json({ success: false, message: "Internal error" }); }
};

export const approveAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE admins SET status = 'active' WHERE id = $1 AND role = 'admin' RETURNING id, first_name AS "firstName", last_name AS "lastName", email, status`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Admin not found" });
    const admin = result.rows[0];
    sendAdminApprovalResult(admin.email, `${admin.firstName} ${admin.lastName}`, true).catch(() => {});
    return res.status(200).json({ success: true, message: "Admin approved", admin });
  } catch (error) { return res.status(500).json({ success: false, message: "Internal error" }); }
};

export const rejectAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE admins SET status = 'rejected' WHERE id = $1 AND role = 'admin' RETURNING id, first_name AS "firstName", last_name AS "lastName", email, status`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Admin not found" });
    const admin = result.rows[0];
    sendAdminApprovalResult(admin.email, `${admin.firstName} ${admin.lastName}`, false).catch(() => {});
    return res.status(200).json({ success: true, message: "Admin rejected", admin });
  } catch (error) { return res.status(500).json({ success: false, message: "Internal error" }); }
};

// ─── Management: Users ──────────────────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const admins = await pool.query(`SELECT id, first_name AS "firstName", last_name AS "lastName", email, mobile, role, status, is_verified, created_at, last_login FROM admins`);
    const users = await pool.query(`SELECT id, first_name AS "firstName", last_name AS "lastName", email, mobile, role, status, is_verified, created_at, last_login FROM users`);
    
    return res.status(200).json({ 
      success: true, 
      users: [...admins.rows, ...users.rows].sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
    });
  } catch (error) { return res.status(500).json({ success: false, message: "Internal error" }); }
};

// ─── Management: Login Audit ────────────────────────────────────────────────────
export const getLoginAudit = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT la.id, la.email, la.role, la.ip_address, la.user_agent, la.logged_at, 
              COALESCE(u.first_name, a.first_name, sa.first_name) AS "firstName", 
              COALESCE(u.last_name, a.last_name, sa.last_name) AS "lastName"
       FROM login_audit la 
       LEFT JOIN users u ON la.user_id = u.id 
       LEFT JOIN admins a ON la.admin_id = a.id
       LEFT JOIN superadmins sa ON la.superadmin_id = sa.id
       ORDER BY la.logged_at DESC LIMIT 100`
    );
    return res.status(200).json({ success: true, audit: result.rows });
  } catch (error) { return res.status(500).json({ success: false, message: "Internal error" }); }
};

// ─── Superadmin Profile ────────────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.first_name AS "firstName", u.last_name AS "lastName", u.email, u.mobile, u.role, p.bio, p.designation, p.organization
       FROM superadmins u LEFT JOIN profiles p ON u.id = p.superadmin_id WHERE u.id = $1`, [req.user.id]
    );
    return res.status(200).json({ success: true, profile: result.rows[0] });
  } catch (err) { return res.status(500).json({ success: false, message: "Internal error" }); }
};

export const updateProfile = async (req, res) => {
  const { firstName, lastName, mobile, bio, designation, organization } = req.body;
  try {
    await pool.query("UPDATE superadmins SET first_name = $1, last_name = $2, mobile = $3 WHERE id = $4", [firstName, lastName, mobile, req.user.id]);
    await pool.query(
      `INSERT INTO profiles (superadmin_id, bio, designation, organization) VALUES ($1, $2, $3, $4)
       ON CONFLICT (superadmin_id) DO UPDATE SET bio = EXCLUDED.bio, designation = EXCLUDED.designation, organization = EXCLUDED.organization`,
      [req.user.id, bio, designation, organization]
    );
    return res.status(200).json({ success: true, message: "Profile updated" });
  } catch (err) { return res.status(500).json({ success: false, message: "Internal error" }); }
};

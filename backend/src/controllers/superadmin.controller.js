import pool from "../config/database.js";
import { 
  comparePassword, 
  issueTokens, 
  clearAuthCookies, 
  verifyRefreshToken,
  TOKEN_EXPIRY 
} from "../utils/auth.js";
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
    const interval = TOKEN_EXPIRY[user.role]?.interval || '12 hours';
    await pool.query(`INSERT INTO refresh_tokens (superadmin_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '${interval}')`, [user.id, refreshToken]);

    // Audit and Alert
    const ip = req.body.ip || req.ip || req.headers["x-forwarded-for"] || "Unknown";
    const userAgent = req.headers["user-agent"] || "Unknown";
    const location = req.body.location || "Unknown location";
    const loginUrl = req.body.url || "Admin Dashboard";

    await pool.query(
      "INSERT INTO login_audit (superadmin_id, email, role, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)",
      [user.id, user.email, user.role, ip, userAgent]
    );

    // Send enhanced alert (loginEmail, loginTime, ip, location, userAgent, url)
    sendSuperadminLoginAlert(
      user.email, 
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }), 
      ip, 
      location, 
      userAgent, 
      loginUrl
    ).catch(() => {});

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
  clearAuthCookies(res, 'superadmin');
  return res.status(200).json({ success: true, message: "Logged out" });
};

// ─── Superadmin Refresh Token ───────────────────────────────────────────────
export const refreshTokenController = async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) return res.status(401).json({ success: false, message: "No refresh token" });

  try {
    const decoded = verifyRefreshToken(token);
    if (!decoded) return res.status(401).json({ success: false, message: "Invalid refresh token" });

    const dbToken = await pool.query("SELECT id FROM refresh_tokens WHERE token = $1 AND superadmin_id = $2 AND expires_at > NOW()", [token, decoded.id]);
    if (dbToken.rows.length === 0) return res.status(401).json({ success: false, message: "Refresh token expired or revoked" });

    const userRes = await pool.query("SELECT id, email, role FROM superadmins WHERE id = $1", [decoded.id]);
    const user = userRes.rows[0];

    const { accessToken, refreshToken } = issueTokens(res, user);
    // Rotate refresh token
    await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [token]);
    const interval = TOKEN_EXPIRY[user.role]?.interval || '12 hours';
    await pool.query(`INSERT INTO refresh_tokens (superadmin_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '${interval}')`, [user.id, refreshToken]);

    return res.status(200).json({ success: true, accessToken, refreshToken });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
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
      `SELECT id, first_name AS "firstName", last_name AS "lastName", email, mobile, status, role, is_verified, created_at, last_login
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

export const blockAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE admins SET status = 'blocked' WHERE id = $1 AND role = 'admin' RETURNING id, first_name AS "firstName", last_name AS "lastName", email, status`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Admin not found" });
    return res.status(200).json({ success: true, message: "Admin blocked successfully", admin: result.rows[0] });
  } catch (error) { return res.status(500).json({ success: false, message: "Internal error" }); }
};

export const unblockAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE admins SET status = 'active' WHERE id = $1 AND role = 'admin' RETURNING id, first_name AS "firstName", last_name AS "lastName", email, status`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Admin not found" });
    return res.status(200).json({ success: true, message: "Admin unblocked successfully", admin: result.rows[0] });
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

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) { return res.status(500).json({ success: false, message: "Internal error" }); }
};

export const blockUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE users SET status = 'blocked' WHERE id = $1 AND role = 'user' RETURNING id, first_name AS "firstName", last_name AS "lastName", email, status`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, message: "User blocked successfully", user: result.rows[0] });
  } catch (error) { return res.status(500).json({ success: false, message: "Internal error" }); }
};

export const unblockUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE users SET status = 'active' WHERE id = $1 AND role = 'user' RETURNING id, first_name AS "firstName", last_name AS "lastName", email, status`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, message: "User unblocked successfully", user: result.rows[0] });
  } catch (error) { return res.status(500).json({ success: false, message: "Internal error" }); }
};

export const deleteAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM admins WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Admin not found" });
    return res.status(200).json({ success: true, message: "Admin deleted successfully" });
  } catch (error) { return res.status(500).json({ success: false, message: "Internal error" }); }
};


// ─── Superadmin: Dashboard Stats ───────────────────────────────────────────────
export const getGlobalStats = async (req, res) => {
  try {
    const companiesRes = await pool.query("SELECT COUNT(*)::int FROM companies");
    const adminsRes = await pool.query("SELECT COUNT(*)::int FROM admins WHERE role = 'admin'");
    const usersRes = await pool.query("SELECT COUNT(*)::int FROM users");
    const coursesRes = await pool.query("SELECT COUNT(*)::int FROM courses");
    const modulesRes = await pool.query("SELECT COUNT(*)::int FROM course_modules");

    // Get Company Distribution by Plan
    const planDistRes = await pool.query("SELECT plan, COUNT(*)::int FROM companies GROUP BY plan");
    const plans = planDistRes.rows;

    // Get 7-day Growth (Companies created in last 7 days)
    const recentCompaniesRes = await pool.query("SELECT COUNT(*)::int FROM companies WHERE created_at >= NOW() - INTERVAL '7 days'");
    
    // Revenue Estimation (Based on active paid companies)
    const revenueRes = await pool.query(`
      SELECT SUM(CASE 
        WHEN plan = 'premium' THEN 4999 
        WHEN plan = 'standard' THEN 2499 
        ELSE 999 
      END)::int as total_revenue
      FROM companies WHERE is_paid = true
    `);

    return res.status(200).json({
      success: true,
      stats: {
        totalCompanies: companiesRes.rows[0].count,
        totalAdmins: adminsRes.rows[0].count,
        totalUsers: usersRes.rows[0].count,
        totalCourses: coursesRes.rows[0].count,
        totalModules: modulesRes.rows[0].count,
        recentCompanies: recentCompaniesRes.rows[0].count,
        totalRevenue: revenueRes.rows[0].total_revenue || 0,
        plans
      }
    });
  } catch (error) {
    console.error("Superadmin getGlobalStats error:", error);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
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

// ─── Superadmin: Admin Drill-Down ──────────────────────────────────────────────
export const getAdminPortfolioStats = async (req, res) => {
  const { adminId } = req.params;
  try {
    const companiesRes = await pool.query("SELECT count(*)::int as count, plan FROM companies WHERE admin_id=$1 GROUP BY plan", [adminId]);
    const plans = companiesRes.rows.map(row => ({ plan: row.plan, count: row.count }));
    const totalCompanies = plans.reduce((acc, p) => acc + p.count, 0);

    const employeesRes = await pool.query(
      "SELECT count(*)::int FROM employees e JOIN companies c ON e.company_id = c.id WHERE c.admin_id = $1",
      [adminId]
    );
    const totalEmployees = parseInt(employeesRes.rows[0].count);

    const adminDetails = await pool.query(`SELECT first_name AS "firstName", last_name AS "lastName", email FROM admins WHERE id = $1`, [adminId]);

    return res.status(200).json({
      success: true,
      stats: { totalCompanies, totalEmployees, plans },
      admin: adminDetails.rows[0]
    });
  } catch (err) {
    console.error("getAdminPortfolioStats error:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

export const getAdminCompaniesUnderSuperadmin = async (req, res) => {
  const { adminId } = req.params;
  try {
    const result = await pool.query(
      `SELECT c.*, 
              (SELECT COUNT(*)::int FROM employees WHERE company_id = c.id) AS num_employees
       FROM companies c
       WHERE c.admin_id = $1
       ORDER BY c.created_at DESC`,
      [adminId]
    );
    return res.status(200).json({ success: true, companies: result.rows });
  } catch (err) {
    console.error("getAdminCompaniesUnderSuperadmin:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

export const getCompanyDetailsSuperadmin = async (req, res) => {
  const { companyId } = req.params;
  try {
    const isSerial = /^\d+$/.test(companyId);
    const result = await pool.query(
      `SELECT c.*, 
              (SELECT COUNT(*)::int FROM employees WHERE company_id = c.id) AS num_employees 
       FROM companies c 
       WHERE (${isSerial ? 'c.id' : 'c.company_id'} = $1)`,
      [companyId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Company not found" });
    return res.status(200).json({ success: true, company: result.rows[0] });
  } catch (err) {
    console.error("getCompanyDetailsSuperadmin:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

export const getCompanyStatsSuperadmin = async (req, res) => {
  const { companyId } = req.params;
  try {
    const isSerial = /^\d+$/.test(companyId);
    const companyRes = await pool.query(
      `SELECT id FROM companies WHERE ${isSerial ? 'id' : 'company_id'} = $1`,
      [companyId]
    );
    if (companyRes.rows.length === 0) return res.status(404).json({ success: false, message: "Company not found" });
    const internalId = companyRes.rows[0].id;

    const employeesCount = await pool.query("SELECT count(*) FROM employees WHERE company_id=$1", [internalId]);
    const coursesCount = await pool.query("SELECT count(*) FROM company_courses WHERE company_id=$1", [internalId]);
    
    let progress = [];
    try {
      const progressRes = await pool.query(
        `SELECT status, count(*)::int 
         FROM employee_progress ep
         JOIN employees e ON ep.employee_id = e.id
         WHERE e.company_id = $1
         GROUP BY status`,
        [internalId]
      );
      progress = progressRes.rows || [];
    } catch (e) {
      console.error("Progress fetch inner error:", e.message);
    }

    return res.status(200).json({ 
      success: true, 
      stats: {
        totalEmployees: parseInt(employeesCount.rows[0]?.count || "0"),
        assignedCourses: parseInt(coursesCount.rows[0]?.count || "0"),
        progress: progress
      }
    });
  } catch (err) {
    console.error("getCompanyStatsSuperadmin Error:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

export const getCompanyEmployeesSuperadmin = async (req, res) => {
  const { companyId } = req.params;
  try {
    const isSerial = /^\d+$/.test(companyId);
    const companyRes = await pool.query(`SELECT id FROM companies WHERE ${isSerial ? 'id' : 'company_id'} = $1`, [companyId]);
    if (companyRes.rows.length === 0) return res.status(404).json({ success: false, message: "Company not found" });
    const internalId = companyRes.rows[0].id;

    const result = await pool.query("SELECT * FROM employees WHERE company_id = $1", [internalId]);
    return res.status(200).json({ success: true, employees: result.rows });
  } catch (err) {
    console.error("getCompanyEmployeesSuperadmin:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

export const getCompanyCoursesSuperadmin = async (req, res) => {
  const { companyId } = req.params;
  try {
    const isSerial = /^\d+$/.test(companyId);
    const companyRes = await pool.query(`SELECT id FROM companies WHERE ${isSerial ? 'id' : 'company_id'} = $1`, [companyId]);
    if (companyRes.rows.length === 0) return res.status(404).json({ success: false, message: "Company not found" });
    const internalId = companyRes.rows[0].id;

    const result = await pool.query(
      `SELECT * FROM courses WHERE company_id = $1 ORDER BY created_at DESC`,
      [internalId]
    );
    return res.status(200).json({ success: true, courses: result.rows });
  } catch (err) {
    console.error("getCompanyCoursesSuperadmin:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

export const updateCompanyBillingSuperadmin = async (req, res) => {
  const { companyId } = req.params;
  const { plan, is_paid } = req.body;
  try {
    const isSerial = /^\d+$/.test(companyId);
    const result = await pool.query(
      `UPDATE companies 
       SET plan = COALESCE($1, plan), 
           is_paid = $2 
       WHERE ${isSerial ? 'id' : 'company_id'} = $3 
       RETURNING *`,
      [plan, is_paid, companyId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Company not found" });
    return res.status(200).json({ success: true, company: result.rows[0], message: "Billing updated" });
  } catch (err) {
    console.error("updateCompanyBillingSuperadmin:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

export const getCourseModulesSuperadmin = async (req, res) => {
  const { courseId } = req.params;
  try {
    const result = await pool.query(
      `SELECT m.*, 
              d.contentextra as doc_content, d.image_url,
              v.video_url
       FROM course_modules m
       LEFT JOIN course_modules_docs d ON m.id = d.course_module_id AND (m.type = 'docs' OR m.type = 'quiz')
       LEFT JOIN course_modules_video v ON m.id = v.course_module_id AND m.type = 'video'
       WHERE m.course_id = $1 
       ORDER BY m.order_index ASC, m.created_at ASC`,
      [courseId]
    );

    const modules = result.rows.map(m => ({
      ...m,
      contentextra: m.doc_content,
    }));

    return res.status(200).json({ success: true, modules });
  } catch (err) {
    console.error("getCourseModulesSuperadmin:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

export const getCourseDetailsSuperadmin = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT c.*, comp.name AS "companyName", comp.plan AS "companyPlan"
       FROM courses c
       JOIN companies comp ON c.company_id = comp.id
       WHERE c.id = $1`,
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Course not found" });
    return res.status(200).json({ success: true, course: result.rows[0] });
  } catch (err) {
    console.error("getCourseDetailsSuperadmin:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

export const getModuleDetailsSuperadmin = async (req, res) => {
  const { moduleId } = req.params;
  try {
    const result = await pool.query(
      `SELECT m.*,
              d.contentextra as doc_contentextra, d.image_url,
              v.video_url
       FROM course_modules m
       LEFT JOIN course_modules_docs d ON m.id = d.course_module_id AND (m.type = 'docs' OR m.type = 'quiz')
       LEFT JOIN course_modules_video v ON m.id = v.course_module_id AND m.type = 'video'
       WHERE m.id = $1`,
      [moduleId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Module not found" });

    const row = result.rows[0];
    const module = {
      ...row,
      contentextra: row.doc_contentextra,
    };

    return res.status(200).json({ success: true, module });
  } catch (err) {
    console.error("getModuleDetailsSuperadmin:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

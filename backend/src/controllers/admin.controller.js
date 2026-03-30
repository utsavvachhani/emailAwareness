import pool from "../config/database.js";
import {
  hashPassword,
  comparePassword,
  generateOTP,
  issueTokens,
  clearAuthCookies,
  verifyRefreshToken,
  TOKEN_EXPIRY
} from "../utils/auth.js";
import {
  sendOTP,
  sendPasswordResetEmail,
  sendAdminRegistrationAlert,
} from "../utils/email.js";

// ─── Admin Signup ─────────────────────────────────────────────────────────────
export const signup = async (req, res) => {
  const { firstName, lastName, email, password, mobile, organization } =
    req.body;
  const normalizedEmail = email?.toLowerCase().trim();

  if (!firstName || !lastName || !normalizedEmail || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const existing = await client.query(
      `SELECT id FROM admins WHERE email = $1
       `,
      [normalizedEmail],
    );
    if (existing.rows.length > 0)
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });

    const hashedPassword = await hashPassword(password);
    const userRes = await client.query(
      `INSERT INTO admins (first_name, last_name, email, password_hash, mobile, role, is_verified, status)
       VALUES ($1, $2, $3, $4, $5, 'admin', FALSE, 'pending')
       RETURNING id, email`,
      [firstName, lastName, normalizedEmail, hashedPassword, mobile],
    );
    const user = userRes.rows[0];

    // Create Profile with organization
    await client.query(
      "INSERT INTO profiles (admin_id, organization, designation) VALUES ($1, $2, 'Administrator')",
      [user.id, organization],
    );

    const otp = generateOTP();
    await client.query(
      "INSERT INTO otps (admin_id, otp, expires_at) VALUES ($1, $2, NOW() + INTERVAL '10 minutes')",
      [user.id, otp],
    );

    await client.query("COMMIT");
    sendOTP(normalizedEmail, otp).catch(() => {});
    sendAdminRegistrationAlert(
      `${firstName} ${lastName}`,
      normalizedEmail,
    ).catch(() => {});

    return res.status(201).json({
      success: true,
      message:
        "Admin registration successful. Please verify your email. Access pending superadmin approval.",
      email: normalizedEmail,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Admin Signup error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  } finally {
    client.release();
  }
};

// ─── Admin Signin ─────────────────────────────────────────────────────────────
export const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      `SELECT id, first_name AS "firstName", last_name AS "lastName", email, password_hash, role, is_verified, status
       FROM admins WHERE email = $1 AND role = 'admin'`,
      [email.toLowerCase().trim()],
    );
    const user = result.rows[0];

    if (!user || !(await comparePassword(password, user.password_hash))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        message: "Email not verified",
        needsVerification: true,
        email: user.email,
      });
    }

    if (user.status === "pending") {
      return res.status(403).json({
        success: false,
        message: "Account pending superadmin approval.",
      });
    }
    if (user.status === "rejected") {
      return res
        .status(403)
        .json({ success: false, message: "Account registration rejected." });
    }
    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked by the superadmin.",
      });
    }

    const { accessToken, refreshToken } = issueTokens(res, user);
    await pool.query("UPDATE admins SET last_login = NOW() WHERE id = $1", [
      user.id,
    ]);
    const interval = TOKEN_EXPIRY[user.role]?.interval || '1 day';
    await pool.query(
      `INSERT INTO refresh_tokens (admin_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '${interval}')`,
      [user.id, refreshToken],
    );

    const { password_hash, ...safeUser } = user;
    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      user: safeUser,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Admin Signin error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ─── Shared logic from user controller ───────────────────────────────────────
// (Could be extracted but user wanted separate controller files)
export const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken)
    await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [
      refreshToken,
    ]);
  clearAuthCookies(res, 'admin');
  return res.status(200).json({ success: true, message: "Logged out" });
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const userRes = await pool.query("SELECT id FROM admins WHERE email = $1", [
      email.toLowerCase(),
    ]);
    if (userRes.rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    const user = userRes.rows[0];

    const otpRes = await pool.query(
      "UPDATE otps SET is_used = TRUE WHERE admin_id = $1 AND otp = $2 AND is_used = FALSE AND expires_at > NOW() RETURNING id",
      [user.id, otp],
    );
    if (otpRes.rows.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "Invalid/Expired OTP" });

    await pool.query("UPDATE admins SET is_verified = TRUE WHERE id = $1", [
      user.id,
    ]);
    return res.status(200).json({
      success: true,
      message: "Email verified. Await superadmin approval.",
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const userRes = await pool.query(
      "SELECT id FROM admins WHERE email = $1 AND role = 'admin'",
      [email.toLowerCase()],
    );
    if (userRes.rows.length > 0) {
      const otp = generateOTP();
      await pool.query(
        "INSERT INTO otps (admin_id, otp, expires_at) VALUES ($1, $2, NOW() + INTERVAL '10 minutes')",
        [userRes.rows[0].id, otp],
      );
      sendPasswordResetEmail(email, otp).catch(() => {});
    }
    return res
      .status(200)
      .json({ success: true, message: "If account exists, OTP sent." });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const userRes = await pool.query(
      "SELECT id FROM admins WHERE email = $1 AND role = 'admin'",
      [email.toLowerCase()],
    );
    if (userRes.rows.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "Invalid request" });

    const otpRes = await pool.query(
      "UPDATE otps SET is_used = TRUE WHERE admin_id = $1 AND otp = $2 AND is_used = FALSE AND expires_at > NOW() RETURNING id",
      [userRes.rows[0].id, otp],
    );
    if (otpRes.rows.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "Invalid/Expired OTP" });

    const hashedPassword = await hashPassword(newPassword);
    await pool.query("UPDATE admins SET password_hash = $1 WHERE id = $2", [
      hashedPassword,
      userRes.rows[0].id,
    ]);
    return res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const refreshTokenController = async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "No refresh token" });
  try {
    const decoded = verifyRefreshToken(token);
    if (!decoded)
      return res
        .status(401)
        .json({ success: false, message: "Invalid/Expired token" });
    const userRes = await pool.query(
      "SELECT id, email, role, status FROM admins WHERE id = $1 AND role = 'admin'",
      [decoded.id],
    );
    const user = userRes.rows[0];
    if (user.status !== "active")
      return res
        .status(403)
        .json({ success: false, message: "Account not active" });

    const { accessToken, refreshToken } = issueTokens(res, user);
    await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [token]);
    const interval = TOKEN_EXPIRY[user.role]?.interval || '1 day';
    await pool.query(
      `INSERT INTO refresh_tokens (admin_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '${interval}')`,
      [user.id, refreshToken],
    );
    return res.status(200).json({ success: true, accessToken, refreshToken });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.first_name AS "firstName", u.last_name AS "lastName", u.email, u.mobile, u.role, u.status, p.bio, p.designation, p.organization
       FROM admins u LEFT JOIN profiles p ON u.id = p.admin_id WHERE u.id = $1`,
      [req.user.id],
    );
    return res.status(200).json({ success: true, profile: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

export const updateProfile = async (req, res) => {
  const { firstName, lastName, mobile, bio, designation, organization } =
    req.body;
  try {
    await pool.query(
      "UPDATE admins SET first_name = $1, last_name = $2, mobile = $3 WHERE id = $4",
      [firstName, lastName, mobile, req.user.id],
    );
    await pool.query(
      `INSERT INTO profiles (admin_id, bio, designation, organization) VALUES ($1, $2, $3, $4)
       ON CONFLICT (admin_id) DO UPDATE SET bio = EXCLUDED.bio, designation = EXCLUDED.designation, organization = EXCLUDED.organization`,
      [req.user.id, bio, designation, organization],
    );
    return res.status(200).json({ success: true, message: "Profile updated" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

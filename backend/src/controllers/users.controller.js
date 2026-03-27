import pool from "../config/database.js";
import {
  hashPassword,
  comparePassword,
  generateOTP,
  issueTokens,
  clearAuthCookies,
  verifyRefreshToken,
  isValidEmail,
  isValidPassword,
  TOKEN_EXPIRY
} from "../utils/auth.js";
import { sendOTP, sendPasswordResetEmail } from "../utils/email.js";

// ─── User Signup ─────────────────────────────────────────────────────────────
export const signup = async (req, res) => {
  const { firstName, lastName, email, password, mobile } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();

  if (!firstName || !lastName || !normalizedEmail || !password) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  if (!isValidEmail(normalizedEmail)) {
    return res.status(400).json({ success: false, message: "Invalid email format" });
  }

  const passCheck = isValidPassword(password);
  if (!passCheck.valid) {
    return res.status(400).json({ success: false, message: passCheck.message });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Check if exists
    const existing = await client.query(
      `SELECT id FROM users WHERE email = $1`,
      [normalizedEmail]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await hashPassword(password);
    const userRes = await client.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, mobile, role, is_verified, status)
       VALUES ($1, $2, $3, $4, $5, 'user', FALSE, 'active')
       RETURNING id, email`,
      [firstName, lastName, normalizedEmail, hashedPassword, mobile]
    );
    const user = userRes.rows[0];

    // Create Profile
    await client.query("INSERT INTO profiles (user_id) VALUES ($1)", [user.id]);

    // Send OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await client.query(
      "INSERT INTO otps (user_id, otp, expires_at) VALUES ($1, $2, $3)",
      [user.id, otp, expiresAt]
    );

    await client.query("COMMIT");
    sendOTP(normalizedEmail, otp).catch(() => {});

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email with the OTP sent.",
      email: normalizedEmail
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Signup error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  } finally {
    client.release();
  }
};

// ─── Verify Email ────────────────────────────────────────────────────────────
export const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, message: "Email and OTP required" });

  try {
    const userRes = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (userRes.rows.length === 0) return res.status(404).json({ success: false, message: "User not found" });
    const user = userRes.rows[0];

    const otpRes = await pool.query(
      "SELECT id FROM otps WHERE user_id = $1 AND otp = $2 AND is_used = FALSE AND expires_at > NOW()",
      [user.id, otp]
    );

    if (otpRes.rows.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    await pool.query("UPDATE otps SET is_used = TRUE, verified_at = NOW() WHERE id = $1", [otpRes.rows[0].id]);
    await pool.query("UPDATE users SET is_verified = TRUE WHERE id = $1", [user.id]);

    return res.status(200).json({ success: true, message: "Email verified successfully. You can now login." });
  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Resend OTP ───────────────────────────────────────────────────────────────
export const resendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email required" });

  try {
    const userRes = await pool.query("SELECT id, is_verified FROM users WHERE email = $1", [email.toLowerCase()]);
    if (userRes.rows.length === 0) return res.status(404).json({ success: false, message: "User not found" });
    if (userRes.rows[0].is_verified) return res.status(400).json({ success: false, message: "Email already verified" });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await pool.query("INSERT INTO otps (user_id, otp, expires_at) VALUES ($1, $2, $3)", [userRes.rows[0].id, otp, expiresAt]);
    
    sendOTP(email, otp).catch(() => {});
    return res.status(200).json({ success: true, message: "New OTP sent to your email." });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Signin ──────────────────────────────────────────────────────────────────
export const signin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });

  try {
    const result = await pool.query(
      `SELECT id, first_name AS "firstName", last_name AS "lastName", email, password_hash, role, is_verified, status
       FROM users WHERE email = $1 AND role = 'user'`,
      [email.toLowerCase().trim()]
    );
    const user = result.rows[0];

    if (!user || !(await comparePassword(password, user.password_hash))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (!user.is_verified) {
      return res.status(403).json({ success: false, message: "Email not verified", needsVerification: true, email: user.email });
    }

    const { accessToken, refreshToken } = issueTokens(res, user);
    await pool.query("UPDATE users SET last_login = NOW() WHERE id = $1", [user.id]);
    const interval = TOKEN_EXPIRY[user.role]?.interval || '7 days';
    await pool.query(`INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '${interval}')`, [user.id, refreshToken]);

    const { password_hash, ...safeUser } = user;
    return res.status(200).json({ success: true, message: "Login successful", user: safeUser, accessToken, refreshToken });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Logout ──────────────────────────────────────────────────────────────────
export const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [refreshToken]);
  }
  clearAuthCookies(res, 'user');
  return res.status(200).json({ success: true, message: "Logged out" });
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const userRes = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (userRes.rows.length === 0) return res.status(200).json({ success: true, message: "If account exists, OTP sent." });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await pool.query("INSERT INTO otps (user_id, otp, expires_at) VALUES ($1, $2, $3)", [userRes.rows[0].id, otp, expiresAt]);
    
    sendPasswordResetEmail(email, otp).catch(() => {});
    return res.status(200).json({ success: true, message: "Reset OTP sent to your email." });
  } catch (error) {
    console.error("Forgot pass error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Verify Reset OTP ──────────────────────────────────────────────────────────
export const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const userRes = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (userRes.rows.length === 0) return res.status(400).json({ success: false, message: "Invalid request" });
    
    const otpRes = await pool.query(
      "SELECT id FROM otps WHERE user_id = $1 AND otp = $2 AND is_used = FALSE AND expires_at > NOW()",
      [userRes.rows[0].id, otp]
    );
    if (otpRes.rows.length === 0) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

    return res.status(200).json({ success: true, message: "OTP verified. You can now reset password." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Reset Password ──────────────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const userRes = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (userRes.rows.length === 0) return res.status(400).json({ success: false, message: "Invalid request" });

    const otpRes = await pool.query(
      "UPDATE otps SET is_used = TRUE WHERE user_id = $1 AND otp = $2 AND is_used = FALSE AND expires_at > NOW() RETURNING id",
      [userRes.rows[0].id, otp]
    );
    if (otpRes.rows.length === 0) return res.status(400).json({ success: false, message: "Invalid/Expired OTP" });

    const hashedPassword = await hashPassword(newPassword);
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [hashedPassword, userRes.rows[0].id]);

    return res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Refresh Token ───────────────────────────────────────────────────────────
export const refreshTokenController = async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) return res.status(401).json({ success: false, message: "No refresh token" });

  try {
    const decoded = verifyRefreshToken(token);
    if (!decoded) return res.status(401).json({ success: false, message: "Invalid refresh token" });

    const dbToken = await pool.query("SELECT id FROM refresh_tokens WHERE token = $1 AND user_id = $2 AND expires_at > NOW()", [token, decoded.id]);
    if (dbToken.rows.length === 0) return res.status(401).json({ success: false, message: "Refresh token expired or revoked" });

    const userRes = await pool.query("SELECT id, email, role FROM users WHERE id = $1", [decoded.id]);
    const user = userRes.rows[0];

    const { accessToken, refreshToken } = issueTokens(res, user);
    // Rotate refresh token
    await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [token]);
    const interval = TOKEN_EXPIRY[user.role]?.interval || '7 days';
    await pool.query(`INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '${interval}')`, [user.id, refreshToken]);

    return res.status(200).json({ success: true, accessToken, refreshToken });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Profile ─────────────────────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.first_name AS "firstName", u.last_name AS "lastName", u.email, u.mobile, u.role, u.is_verified,
              p.bio, p.photo, p.designation, p.organization
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [req.user.id]
    );
    return res.status(200).json({ success: true, profile: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  const { firstName, lastName, mobile, bio, designation, organization } = req.body;
  try {
    await pool.query(
      "UPDATE users SET first_name = $1, last_name = $2, mobile = $3 WHERE id = $4",
      [firstName, lastName, mobile, req.user.id]
    );
    await pool.query(
      `INSERT INTO profiles (user_id, bio, designation, organization)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE
       SET bio = EXCLUDED.bio, designation = EXCLUDED.designation, organization = EXCLUDED.organization`,
      [req.user.id, bio, designation, organization]
    );
    return res.status(200).json({ success: true, message: "Profile updated" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const userRes = await pool.query("SELECT password_hash FROM users WHERE id = $1", [req.user.id]);
    if (!(await comparePassword(currentPassword, userRes.rows[0].password_hash))) {
      return res.status(400).json({ success: false, message: "Incorrect current password" });
    }
    const hashedPassword = await hashPassword(newPassword);
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [hashedPassword, req.user.id]);
    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

import pool from "../config/database.js";
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateOTP,
} from "../utils/auth.js";
import { sendOTP, sendPasswordResetEmail } from "../utils/email.js";

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const signup = async (req, res) => {
  const { firstName, lastName, email, mobile, password } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();

  try {
    // Check if user already exists
    const userExists = await pool.query(
      "SELECT id FROM users WHERE email = $1 OR (mobile IS NOT NULL AND mobile = $2)",
      [normalizedEmail, mobile || null],
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User with this email or mobile already exists",
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const newUser = await pool.query(
      'INSERT INTO users (first_name, last_name, email, mobile, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name AS "firstName", last_name AS "lastName", email, mobile, role',
      [firstName, lastName, normalizedEmail, mobile || null, passwordHash],
    );

    const userId = newUser.rows[0].id;

    // Create profile entry for the user
    await pool.query(
      "INSERT INTO profiles (user_id, organization) VALUES ($1, $2)",
      [userId, "CyberShield Guard"],
    );

    // Generate and send OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await pool.query(
      "INSERT INTO otps (user_id, otp, expires_at) VALUES ($1, $2, $3)",
      [userId, otp, expiresAt],
    );

    if (email) {
      await sendOTP(email, otp);
    }

    res.status(201).json({
      success: true,
      message: "Signup successful. Please verify your email.",
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const signin = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();

  try {
    const result = await pool.query(
      'SELECT id, first_name AS "firstName", last_name AS "lastName", email, role, password_hash, is_verified FROM users WHERE email = $1',
      [normalizedEmail],
    );
    const user = result.rows[0];

    if (!user) {
      console.log(`❌ Login failed: User not found (${normalizedEmail})`);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      console.log(`❌ Login failed: Incorrect password for ${normalizedEmail}`);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Instead of logging in directly, we send an OTP as per the frontend flow
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      "INSERT INTO otps (user_id, otp, expires_at) VALUES ($1, $2, $3)",
      [user.id, otp, expiresAt],
    );

    if (user.email) {
      await sendOTP(user.email, otp);
    }

    // Don't return password
    const { password_hash, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();

  try {
    const userResult = await pool.query(
      'SELECT id, first_name AS "firstName", last_name AS "lastName", email, role, is_verified FROM users WHERE email = $1',
      [normalizedEmail],
    );
    if (userResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const user = userResult.rows[0];
    const userId = user.id;

    const otpResult = await pool.query(
      "SELECT * FROM otps WHERE user_id = $1 AND otp = $2 AND is_used = false AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
      [userId, otp],
    );

    if (otpResult.rows.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    // Mark OTP as used and verify user
    await pool.query(
      "UPDATE otps SET is_used = true, verified_at = NOW() WHERE id = $1",
      [otpResult.rows[0].id],
    );

    if (!user.is_verified) {
      await pool.query("UPDATE users SET is_verified = true WHERE id = $1", [
        userId,
      ]);
    }

    // GENERATE TOKENS NOW THAT OTP IS VERIFIED
    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token in DB
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, refreshToken, expiresAt],
    );

    // Set cookies
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      message: "Authentication successful",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: true,
      },
      token: accessToken, // Frontend sometimes expects token or accessToken
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const resendOTP = async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();

  try {
    const result = await pool.query(
      "SELECT id, first_name FROM users WHERE email = $1",
      [normalizedEmail],
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const userId = result.rows[0].id;
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      "INSERT INTO otps (user_id, otp, expires_at) VALUES ($1, $2, $3)",
      [userId, otp, expiresAt],
    );

    await sendOTP(email, otp);

    res.status(200).json({ success: true, message: "OTP resent successfully" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();

  try {
    const result = await pool.query("SELECT id FROM users WHERE email = $1", [
      normalizedEmail,
    ]);
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const userId = result.rows[0].id;
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      "INSERT INTO otps (user_id, otp, expires_at) VALUES ($1, $2, $3)",
      [userId, otp, expiresAt],
    );

    await sendPasswordResetEmail(email, otp);

    res
      .status(200)
      .json({ success: true, message: "Password reset OTP sent to email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();

  try {
    const userResult = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail],
    );
    if (userResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const userId = userResult.rows[0].id;

    const otpResult = await pool.query(
      "SELECT * FROM otps WHERE user_id = $1 AND otp = $2 AND is_used = false AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
      [userId, otp],
    );

    if (otpResult.rows.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    // We don't mark as used yet, or we can mark as "in progress" but let's just confirm it's valid
    res.status(200).json({
      success: true,
      message: "OTP verified. You can now reset your password.",
    });
  } catch (error) {
    console.error("Verify reset OTP error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();

  try {
    const userResult = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail],
    );
    if (userResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const userId = userResult.rows[0].id;

    const otpResult = await pool.query(
      "SELECT * FROM otps WHERE user_id = $1 AND otp = $2 AND is_used = false AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
      [userId, otp],
    );

    if (otpResult.rows.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    // Mark OTP as used
    await pool.query(
      "UPDATE otps SET is_used = true, verified_at = NOW() WHERE id = $1",
      [otpResult.rows[0].id],
    );

    // Update password
    const passwordHash = await hashPassword(newPassword);
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      passwordHash,
      userId,
    ]);

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [userId],
    );
    const user = result.rows[0];

    if (!(await comparePassword(currentPassword, user.password_hash))) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect current password" });
    }

    const newPasswordHash = await hashPassword(newPassword);
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      newPasswordHash,
      userId,
    ]);

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  try {
    if (refreshToken) {
      await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [
        refreshToken,
      ]);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  const { firstName, lastName, mobile, bio, designation, organization } =
    req.body;
  const userId = req.user.id;

  try {
    // Start transaction
    await pool.query("BEGIN");

    // Update Users table
    await pool.query(
      "UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), mobile = COALESCE($3, mobile) WHERE id = $4",
      [firstName, lastName, mobile, userId],
    );

    // Update Profile table
    const result = await pool.query(
      "UPDATE profiles SET bio = COALESCE($1, bio), designation = COALESCE($2, designation), organization = COALESCE($3, organization), updated_at = NOW() WHERE user_id = $4 RETURNING *",
      [bio, designation, organization, userId],
    );

    await pool.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: result.rows[0],
    });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'SELECT u.id, u.first_name AS "firstName", u.last_name AS "lastName", u.email, u.mobile, u.role, p.bio, p.designation, p.organization FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.id = $1',
      [userId],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    res.status(200).json({ success: true, profile: result.rows[0] });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const refreshTokenController = async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    return res
      .status(401)
      .json({ success: false, message: "Refresh token missing" });
  }

  try {
    // Check if token in DB
    const result = await pool.query(
      "SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()",
      [refreshToken],
    );

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired refresh token" });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
    }

    // Get user
    const userResult = await pool.query(
      "SELECT id, email, role FROM users WHERE id = $1",
      [decoded.id],
    );
    const user = userResult.rows[0];

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user.id, user.email, user.role);

    res.cookie("accessToken", newAccessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

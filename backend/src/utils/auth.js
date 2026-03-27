import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access-secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh-secret";
const SALT_ROUNDS = 10;

// Role-based expiration durations
export const TOKEN_EXPIRY = {
  user: {
    access: "1h",
    refresh: "7d",
    refreshMs: 7 * 24 * 60 * 60 * 1000,
    interval: "7 days"
  },
  admin: {
    access: "1h",
    refresh: "1d",
    refreshMs: 1 * 24 * 60 * 60 * 1000,
    interval: "1 day"
  },
  superadmin: {
    access: "1h",
    refresh: "12h",
    refreshMs: 12 * 60 * 60 * 1000,
    interval: "12 hours"
  }
};

// Default Cookie options (will be overridden by role-specific ones)
export const getCookieOptions = (role = 'user', isAccess = false) => {
  const expiry = TOKEN_EXPIRY[role] || TOKEN_EXPIRY.user;
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: isAccess ? 1 * 60 * 60 * 1000 : expiry.refreshMs, // 1h for access, role-based for refresh
  };
};

// Hash password
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

// Compare password with hash
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Generate Access Token
export const generateAccessToken = (userId, email, role) => {
  const expiry = TOKEN_EXPIRY[role]?.access || "1h";
  return jwt.sign({ id: userId, email, role }, JWT_ACCESS_SECRET, {
    expiresIn: expiry,
  });
};

// Generate Refresh Token
export const generateRefreshToken = (userId, role = 'user') => {
  const expiry = TOKEN_EXPIRY[role]?.refresh || "7d";
  return jwt.sign({ id: userId, role }, JWT_REFRESH_SECRET, {
    expiresIn: expiry,
  });
};

// Verify Access Token
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET);
  } catch (error) {
    return null;
  }
};

// Verify Refresh Token
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

// Send auth cookies
export const sendAuthCookies = (res, accessToken, refreshToken, role = 'user') => {
  res.cookie("accessToken", accessToken, getCookieOptions(role, true));
  res.cookie("refreshToken", refreshToken, getCookieOptions(role, false));
};

// Clear auth cookies
export const clearAuthCookies = (res, role = 'user') => {
  res.clearCookie("accessToken", getCookieOptions(role, true));
  res.clearCookie("refreshToken", getCookieOptions(role, false));
};

// Unified token issuer
export const issueTokens = (res, user) => {
  const role = user.role || 'user';
  const accessToken = generateAccessToken(user.id, user.email, role);
  const refreshToken = generateRefreshToken(user.id, role);
  sendAuthCookies(res, accessToken, refreshToken, role);
  return { accessToken, refreshToken, expiresIn: TOKEN_EXPIRY[role].refresh };
};

// Generate OTP (6-digit code)
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const isValidPassword = (password) => {
  if (password.length < 8) {
    return {
      valid: false,
      message: "Password must be at least 8 characters long",
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one number",
    };
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return {
      valid: false,
      message:
        "Password must contain at least one special character (!@#$%^&*)",
    };
  }
  return { valid: true };
};

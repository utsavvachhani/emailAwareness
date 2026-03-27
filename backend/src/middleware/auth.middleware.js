import jwt from "jsonwebtoken";
import pool from "../config/database.js";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access-secret";

// ─── Authenticate any logged-in user ──────────────────────────────────────────
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      (authHeader && authHeader.startsWith("Bearer ") && authHeader.split(" ")[1]) ||
      req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ success: false, message: "No authentication token, access denied" });
    }

    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);

    // Determine target table based on role
    const tableMap = {
      superadmin: "superadmins",
      admin: "admins",
      user: "users",
    };
    const tableName = tableMap[decoded.role] || "users";

    const result = await pool.query(
      `SELECT id, first_name, last_name, email, role, is_verified, status
       FROM ${tableName} WHERE id = $1`,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error("DEBUG - authMiddleware error:", error.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// ─── Role Guard ───────────────────────────────────────────────────────────────
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    // Superadmin override: superadmins can access any admin endpoint
    if (req.user.role === "superadmin") return next();

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }
    next();
  };
};

// ─── Admin must be approved ────────────────────────────────────────────────────
export const requireApproved = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  // superadmin is always approved
  if (req.user.role === "superadmin") return next();

  if (req.user.status !== "active") {
    return res.status(403).json({
      success: false,
      message:
        req.user.status === "pending"
          ? "Your account is pending superadmin approval."
          : "Your account has been rejected.",
    });
  }
  next();
};

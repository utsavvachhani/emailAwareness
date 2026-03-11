import jwt from "jsonwebtoken";
import pool from "../config/database.js";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access-secret";

export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header or cookies
    const authHeader = req.headers.authorization;
    const token =
      (authHeader && authHeader.split(" ")[1]) || req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No authentication token, access denied",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);

    // Check if user exists
    const result = await pool.query(
      "SELECT id, first_name, last_name, email, role, is_verified FROM users WHERE id = $1",
      [decoded.id],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

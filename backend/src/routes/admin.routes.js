import express from "express";
import {
  signup,
  signin,
  logout,
  verifyOTP,
  forgotPassword,
  resetPassword,
  refreshTokenController,
  getProfile,
  updateProfile
} from "../controllers/admin.controller.js";
import { authMiddleware, requireRole, requireApproved } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public
router.post("/signup", signup);
router.post("/verify-email", verifyOTP);
router.post("/verify-otp", verifyOTP);

router.post("/signin", signin);
router.post("/logout", logout);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/refresh-token", refreshTokenController);

// Protected
router.get("/me", authMiddleware, requireRole('admin'), (req, res) => {
  res.json({ userId: req.user.id, user: req.user });
});

router.get("/profile", authMiddleware, requireRole('admin'), requireApproved, getProfile);
router.put("/profile/update", authMiddleware, requireRole('admin'), requireApproved, updateProfile);

export default router;

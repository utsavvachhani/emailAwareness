import express from "express";
import {
  signup,
  signin,
  verifyEmail,
  resendOTP,
  forgotPassword,
  resetPassword,
  logout,
  verifyResetOtp,
  changePassword,
  updateProfile,
  getProfile,
  refreshTokenController,
} from "../controllers/auth.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/verify-otp", verifyEmail); // Alias for frontend
router.post("/resend-otp", resendOTP);

router.post("/signin", signin);
router.post("/login", signin); // Alias for frontend
router.post("/logout", logout);

router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

// Protected routes
router.post("/change-password", authMiddleware, changePassword);
router.put("/profile/update", authMiddleware, updateProfile);
router.get("/profile", authMiddleware, getProfile);

router.post("/refresh-token", refreshTokenController);

router.get("/me", authMiddleware, (req, res) => {
  res.json({ userId: req.user.id, user: req.user });
});

export default router;

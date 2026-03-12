import express from "express";
import {
  signup,
  verifyEmail,
  resendOTP,
  signin,
  logout,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  refreshTokenController,
  getProfile,
  updateProfile,
  changePassword
} from "../controllers/users.controller.js";
import { authMiddleware, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public
router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOTP);

router.post("/signin", signin);
router.post("/logout", logout);

router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

router.post("/refresh-token", refreshTokenController);

// Protected
router.get("/me", authMiddleware, (req, res) => {
  res.json({ userId: req.user.id, user: req.user });
});

router.get("/profile", authMiddleware, requireRole('user'), getProfile);
router.put("/profile/update", authMiddleware, requireRole('user'), updateProfile);
router.post("/change-password", authMiddleware, requireRole('user'), changePassword);

export default router;

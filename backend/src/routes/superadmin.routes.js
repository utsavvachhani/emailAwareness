import express from "express";
import {
  signin,
  logout,
  getPendingAdmins,
  getAllAdmins,
  approveAdmin,
  rejectAdmin,
  getAllUsers,
  getLoginAudit,
  getProfile,
  updateProfile,
  deleteUser,
  deleteAdmin
} from "../controllers/superadmin.controller.js";
import { authMiddleware, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public
router.post("/signin", signin);
router.post("/logout", logout);

router.get("/me", authMiddleware, requireRole('superadmin'), (req, res) => {
  res.json({ userId: req.user.id, user: req.user });
});
router.get("/profile",      authMiddleware, requireRole('superadmin'), getProfile);
router.put("/profile/update", authMiddleware, requireRole('superadmin'), updateProfile);

router.get("/admins/pending", authMiddleware, requireRole('superadmin'), getPendingAdmins);
router.get("/admins/all",     authMiddleware, requireRole('superadmin'), getAllAdmins);
router.patch("/admins/:id/approve", authMiddleware, requireRole('superadmin'), approveAdmin);
router.patch("/admins/:id/reject",  authMiddleware, requireRole('superadmin'), rejectAdmin);

router.get("/users/all",      authMiddleware, requireRole('superadmin'), getAllUsers);
router.delete("/users/:id",   authMiddleware, requireRole('superadmin'), deleteUser);
router.delete("/admins/:id",  authMiddleware, requireRole('superadmin'), deleteAdmin);

router.get("/audit",          authMiddleware, requireRole('superadmin'), getLoginAudit);

export default router;

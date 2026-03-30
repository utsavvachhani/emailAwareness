import express from "express";
import {
  signin,
  logout,
  getPendingAdmins,
  getAllAdmins,
  approveAdmin,
  rejectAdmin,
  blockAdmin,
  unblockAdmin,
  getAllUsers,
  getLoginAudit,
  getProfile,
  updateProfile,
  deleteUser,
  blockUser,
  unblockUser,
  deleteAdmin,
  refreshTokenController,
} from "../controllers/superadmin.controller.js";
import {
  getAllCompanies,
  deleteCompany,
  updateCompanyStatus,
} from "../controllers/company.controller.js";
import {
  getAllEmployees,
  deleteEmployee,
} from "../controllers/employees.controller.js";
import {
  getAllCourses,
  approveCourse,
  rejectCourse,
  resetCourseToPending,
} from "../controllers/courses.controller.js";

import { authMiddleware, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public
router.post("/signin", signin);
router.post("/logout", logout);
router.post("/refresh-token", refreshTokenController);

router.get("/me", authMiddleware, requireRole("superadmin"), (req, res) => {
  res.json({ userId: req.user.id, user: req.user });
});
router.get("/profile", authMiddleware, requireRole("superadmin"), getProfile);
router.put(
  "/profile/update",
  authMiddleware,
  requireRole("superadmin"),
  updateProfile,
);

router.get(
  "/admins/pending",
  authMiddleware,
  requireRole("superadmin"),
  getPendingAdmins,
);
router.get(
  "/admins/all",
  authMiddleware,
  requireRole("superadmin"),
  getAllAdmins,
);
router.patch(
  "/admins/:id/approve",
  authMiddleware,
  requireRole("superadmin"),
  approveAdmin,
);
router.patch(
  "/admins/:id/reject",
  authMiddleware,
  requireRole("superadmin"),
  rejectAdmin,
);
router.patch(
  "/admins/:id/block",
  authMiddleware,
  requireRole("superadmin"),
  blockAdmin,
);
router.patch(
  "/admins/:id/unblock",
  authMiddleware,
  requireRole("superadmin"),
  unblockAdmin,
);

router.get(
  "/users/all",
  authMiddleware,
  requireRole("superadmin"),
  getAllUsers,
);
router.delete(
  "/users/:id",
  authMiddleware,
  requireRole("superadmin"),
  deleteUser,
);
router.patch(
  "/users/:id/block",
  authMiddleware,
  requireRole("superadmin"),
  blockUser,
);
router.patch(
  "/users/:id/unblock",
  authMiddleware,
  requireRole("superadmin"),
  unblockUser,
);
router.delete(
  "/admins/:id",
  authMiddleware,
  requireRole("superadmin"),
  deleteAdmin,
);

router.get("/audit", authMiddleware, requireRole("superadmin"), getLoginAudit);
router.get(
  "/employees",
  authMiddleware,
  requireRole("superadmin"),
  getAllEmployees,
);
router.delete(
  "/employees/:employeeId",
  authMiddleware,
  requireRole("superadmin"),
  deleteEmployee,
);

// Company routes (superadmin)

router.get(
  "/companies",
  authMiddleware,
  requireRole("superadmin"),
  getAllCompanies,
);
router.patch(
  "/companies/:id/status",
  authMiddleware,
  requireRole("superadmin"),
  updateCompanyStatus,
);
router.delete(
  "/companies/:id",
  authMiddleware,
  requireRole("superadmin"),
  deleteCompany,
);

// Course Verification (superadmin)
router.get(
  "/courses",
  authMiddleware,
  requireRole("superadmin"),
  getAllCourses,
);
router.patch(
  "/courses/:id/approve",
  authMiddleware,
  requireRole("superadmin"),
  approveCourse,
);
router.patch(
  "/courses/:id/reject",
  authMiddleware,
  requireRole("superadmin"),
  rejectCourse,
);
router.patch(
  "/courses/:id/reset",
  authMiddleware,
  requireRole("superadmin"),
  resetCourseToPending,
);

export default router;

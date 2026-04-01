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
  getAdminPortfolioStats,
  getAdminCompaniesUnderSuperadmin,
  getCompanyDetailsSuperadmin,
  getCompanyStatsSuperadmin,
  getCompanyEmployeesSuperadmin,
  getCompanyCoursesSuperadmin,
  updateCompanyBillingSuperadmin,
  getCourseModulesSuperadmin,
  getCourseDetailsSuperadmin,
  getModuleDetailsSuperadmin,
  getGlobalStats,
} from "../controllers/superadmin.controller.js";
import { uploadMedia } from "../controllers/upload.controller.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});
import {
  getAllCompanies,
  deleteCompany,
  updateCompanyStatus,
} from "../controllers/company.controller.js";
import {
  getAllEmployees,
  deleteEmployee,
  createEmployee,
  updateEmployee,
  getEmployeeProgressDetail,
} from "../controllers/employees.controller.js";
import { assignCourseToEmployees } from "../controllers/assignment.controller.js";
import {
  getAllCourses,
  approveCourse,
  rejectCourse,
  resetCourseToPending,
  deleteCourse as deleteCourseSuperadmin,
  createCourse as createCourseSuperadmin,
  getCompanyPlanInfo as getCompanyPlanInfoSuperadmin,
} from "../controllers/courses.controller.js";
import {
  createModule as createModuleSuperadmin,
  updateModule as updateModuleSuperadmin,
  deleteModule as deleteModuleSuperadmin,
} from "../controllers/modules.controller.js";

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
  "/stats",
  authMiddleware,
  requireRole("superadmin"),
  getGlobalStats,
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
  "/admins/:adminId/stats",
  authMiddleware,
  requireRole("superadmin"),
  getAdminPortfolioStats,
);
router.get(
  "/admins/:adminId/companies",
  authMiddleware,
  requireRole("superadmin"),
  getAdminCompaniesUnderSuperadmin,
);

// Company Drill-Down (Superadmin)
router.get(
  "/companies/:companyId",
  authMiddleware,
  requireRole("superadmin"),
  getCompanyDetailsSuperadmin,
);
router.get(
  "/companies/:companyId/stats",
  authMiddleware,
  requireRole("superadmin"),
  getCompanyStatsSuperadmin,
);
router.get(
  "/companies/:companyId/employees",
  authMiddleware,
  requireRole("superadmin"),
  getCompanyEmployeesSuperadmin,
);
router.get(
  "/companies/:companyId/courses",
  authMiddleware,
  requireRole("superadmin"),
  getCompanyCoursesSuperadmin,
);
router.get(
  "/companies/:company_id/plan-info",
  authMiddleware,
  requireRole("superadmin"),
  getCompanyPlanInfoSuperadmin,
);
router.post(
  "/companies/:company_id/courses",
  authMiddleware,
  requireRole("superadmin"),
  createCourseSuperadmin,
);
router.patch(
  "/companies/:companyId/billing",
  authMiddleware,
  requireRole("superadmin"),
  updateCompanyBillingSuperadmin,
);
router.get(
  "/modules/:moduleId",
  authMiddleware,
  requireRole("superadmin"),
  getModuleDetailsSuperadmin,
);
router.get(
  "/courses/:courseId/modules",
  authMiddleware,
  requireRole("superadmin"),
  getCourseModulesSuperadmin,
);
router.post(
  "/courses/:course_id/modules",
  authMiddleware,
  requireRole("superadmin"),
  createModuleSuperadmin,
);
router.put(
  "/modules/:id",
  authMiddleware,
  requireRole("superadmin"),
  updateModuleSuperadmin,
);
router.delete(
  "/modules/:id",
  authMiddleware,
  requireRole("superadmin"),
  deleteModuleSuperadmin,
);
router.get(
  "/courses/:id",
  authMiddleware,
  requireRole("superadmin"),
  getCourseDetailsSuperadmin,
);

router.post(
  "/courses/:courseId/assign",
  authMiddleware,
  requireRole("superadmin"),
  assignCourseToEmployees,
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
router.put(
  "/employees/:employeeId",
  authMiddleware,
  requireRole("superadmin"),
  updateEmployee,
);
router.get(
  "/employees/:employeeId/progress",
  authMiddleware,
  requireRole("superadmin"),
  getEmployeeProgressDetail,
);
router.post(
  "/companies/:id/employees",
  authMiddleware,
  requireRole("superadmin"),
  createEmployee,
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
router.delete(
  "/courses/:id",
  authMiddleware,
  requireRole("superadmin"),
  deleteCourseSuperadmin,
);

router.post(
  "/upload-media",
  authMiddleware,
  requireRole("superadmin"),
  upload.single("media"),
  uploadMedia,
);

export default router;

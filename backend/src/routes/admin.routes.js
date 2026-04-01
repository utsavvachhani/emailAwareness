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
  updateProfile,
} from "../controllers/admin.controller.js";
import {
  getMyCompanies,
  createCompany,
  updateCompany,
  deleteMyCompany,
  getMyCompanyDetails,
  getCompanyCourses,
  getAllAvailableCourses,
  assignCourseToCompany,
  getCompanyStats,
  getAdminGlobalStats,
  getAdminEmployees,
  updateCompanyPlan,
  updateCompanyPaymentStatus,
} from "../controllers/company.controller.js";
import {
  getEmployeesByCompany,
  createEmployee as createNewEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeProgressDetail,
} from "../controllers/employees.controller.js";
import {
  createCourse,
  getAdminCoursesByCompany,
  getCourseDetails,
  deleteCourse,
  getCompanyPlanInfo,
} from "../controllers/courses.controller.js";
import {
  getCourseModules,
  createModule,
  updateModule,
  deleteModule,
  getModuleDetails,
  reorderModules,
} from "../controllers/modules.controller.js";
import { assignCourseToEmployees } from "../controllers/assignment.controller.js";

import { uploadMedia } from "../controllers/upload.controller.js";

import {
  authMiddleware,
  requireRole,
  requireApproved,
} from "../middleware/auth.middleware.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for videos
});

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
router.get("/me", authMiddleware, requireRole("admin"), (req, res) => {
  res.json({ userId: req.user.id, user: req.user });
});

router.get(
  "/profile",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  getProfile,
);
router.put(
  "/profile/update",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  updateProfile,
);

// Company routes (admin)
router.get(
  "/companies",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  getMyCompanies,
);
router.post(
  "/companies",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  createCompany,
);
router.get(
  "/companies/:id",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  getMyCompanyDetails,
);
router.put(
  "/companies/:id",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  updateCompany,
);
router.delete(
  "/companies/:id",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  deleteMyCompany,
);
router.put(
  "/companies/:id/plan",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  updateCompanyPlan,
);
router.put(
  "/companies/:id/payment",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  updateCompanyPaymentStatus,
);

// Specific Company Management
router.get(
  "/companies/:id/employees",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  getEmployeesByCompany,
);
router.post(
  "/companies/:id/employees",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  createNewEmployee,
);
router.put(
  "/employees/:employeeId",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  updateEmployee,
);
router.delete(
  "/employees/:employeeId",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  deleteEmployee,
);
router.get(
  "/employees/:employeeId/progress",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  getEmployeeProgressDetail,
);
router.get(
  "/companies/:id/courses",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  getCompanyCourses,
);
router.post(
  "/companies/:id/courses",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  assignCourseToCompany,
);
router.get(
  "/companies/:id/stats",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  getCompanyStats,
);

// Global Admin Management
router.get(
  "/stats",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  getAdminGlobalStats,
);
router.get(
  "/employees",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  getAdminEmployees,
);

// Shared
router.get(
  "/courses",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  getAllAvailableCourses,
);

// Course Management (admin creates, pending superadmin approval)
router.get(
  "/companies/:company_id/courses-list",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  getAdminCoursesByCompany,
);
router.post(
  "/companies/:company_id/courses-create",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  createCourse,
);
router.get(
  "/my-courses/:id",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  getCourseDetails,
);
router.delete(
  "/my-courses/:id",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  deleteCourse,
);
router.get(
  "/companies/:company_id/plan-info",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  getCompanyPlanInfo,
);

router.post(
  "/courses/:courseId/assign",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  assignCourseToEmployees,
);

// Media Upload
router.post(
  "/upload-media",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  upload.single("media"),
  uploadMedia,
);

// Module Management
router.get(
  "/courses/:course_id/modules",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  getCourseModules,
);
router.post(
  "/courses/:course_id/modules",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  createModule,
);
router.post(
  "/courses/:course_id/reorder-modules",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  reorderModules,
);
router.get(
  "/modules/:id",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  getModuleDetails,
);
router.put(
  "/modules/:id",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  updateModule,
);
router.delete(
  "/modules/:id",
  authMiddleware,
  requireRole("admin"),
  requireApproved,
  deleteModule,
);

export default router;

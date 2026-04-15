import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import superadminRoutes from "./routes/superadmin.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import usersRoutes from "./routes/users.routes.js";
import { stripeWebhook } from "./controllers/payment.controller.js";
import { initializeDatabase } from "./config/initDb.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ─── Stripe Webhook MUST be before express.json() ─────────────────────────────
app.post("/api/webhook", express.raw({ type: "application/json" }), stripeWebhook);

// ─── Body / Cookie ────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Logging ──────────────────────────────────────────────────────────────────
app.use(morgan("dev"));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 200,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});
app.use("/api/", limiter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "CyberShield Guard API is running",
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/superadmin", superadminRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", usersRoutes);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log("\n🚀 ========================================");
      console.log("🚀  CyberShield Guard — Backend API");
      console.log("🚀 ========================================");
      console.log(`🚀  Port     : ${PORT}`);
      console.log(`🚀  Env      : ${process.env.NODE_ENV || "development"}`);
      console.log(`🚀  API      : http://localhost:${PORT}/api`);
      console.log(`🚀  Health   : http://localhost:${PORT}/health`);
      console.log("🚀 ========================================\n");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;

import path from "node:path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.routes.js";
import { packagesRouter } from "./routes/packages.routes.js";
import { catalogRouter } from "./routes/catalog.routes.js";
import { usersRouter } from "./routes/users.routes.js";
import { contractsRouter } from "./routes/contracts.routes.js";
import { capacityRouter } from "./routes/capacity.routes.js";
import { contractPaymentsRouter, paymentsRouter } from "./routes/payments.routes.js";
import { assignmentsRouter, staffAssignmentsRouter } from "./routes/assignments.routes.js";
import { assignmentPhotosRouter, photosRouter } from "./routes/photos.routes.js";
import { assignmentDamagesRouter, damagesRouter } from "./routes/damages.routes.js";
import { staffRatesRouter } from "./routes/staff-rates.routes.js";
import { chatbotRouter } from "./routes/chatbot.routes.js";
import { faqsRouter } from "./routes/faqs.routes.js";
import { payrollRouter } from "./routes/payroll.routes.js";
import { notificationsRouter } from "./routes/notifications.routes.js";
import { auditRouter } from "./routes/audit.routes.js";
import { mapsRouter } from "./routes/maps.routes.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";
import { systemRouter } from "./routes/system.routes.js";
import { supportRouter } from "./routes/support.routes.js";
import { menuRouter } from "./routes/menu.routes.js";
import { errorHandler, notFound } from "./middlewares/error-handler.js";

export const app = express();
const configuredOrigins = env.CLIENT_URL.split(",").map((value) => value.trim());
const localDevelopmentOrigin = /^https?:\/\/(localhost|127\.0\.0\.1|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})(?::\d+)?$/;

app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin: (origin, callback) => {
    const allowed = !origin || configuredOrigins.includes(origin) || (env.NODE_ENV === "development" && localDevelopmentOrigin.test(origin));
    callback(allowed ? null : new Error("Origin khong duoc phep"), allowed);
  },
  credentials: true,
}));
app.use(express.json({
  limit: "2mb",
  verify: (req, _res, buffer) => { (req as express.Request).rawBody = Buffer.from(buffer); },
}));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: env.NODE_ENV === "test" ? 10_000 : 500, standardHeaders: "draft-8" }));
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: env.NODE_ENV === "test" ? 10_000 : 50 }), authRouter);

app.get("/api/health", (_req, res) => res.json({ success: true, data: { status: "ok", timestamp: new Date().toISOString() } }));
app.use("/api/config", systemRouter);
app.use("/api/support-requests", supportRouter);
app.use("/api/packages", packagesRouter);
app.use("/api/menu-combos", menuRouter);
app.use("/api/catalog-items", catalogRouter);
app.use("/api/users", usersRouter);
app.use("/api/contracts/:id/payments", contractPaymentsRouter);
app.use("/api/contracts", contractsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/capacity", capacityRouter);
app.use("/api/assignments/:id/photos", assignmentPhotosRouter);
app.use("/api/assignments/:id/damages", assignmentDamagesRouter);
app.use("/api/assignments", assignmentsRouter);
app.use("/api/staff/me/assignments", staffAssignmentsRouter);
app.use("/api/photos", photosRouter);
app.use("/api/damages", damagesRouter);
app.use("/api/staff-rates", staffRatesRouter);
app.use("/api/chatbot/faqs", faqsRouter);
app.use("/api/chatbot", chatbotRouter);
app.use("/api/payroll", payrollRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/audit-logs", auditRouter);
app.use("/api/maps", mapsRouter);
app.use("/api/admin/dashboard", dashboardRouter);

app.use(notFound);
app.use(errorHandler);

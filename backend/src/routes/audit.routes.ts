import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";

const router = Router();
router.use(authenticate, authorize("ADMIN"));
router.get("/", asyncHandler(async (_req, res) => res.json({ success: true, data: await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 500 }) })));
router.get("/:id", asyncHandler(async (req, res) => {
  const data = await prisma.auditLog.findUnique({ where: { id: req.params.id! } });
  if (!data) throw new ApiError(404, "Khong tim thay nhat ky");
  res.json({ success: true, data });
}));

export { router as auditRouter };

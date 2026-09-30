import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";

export const assignmentDamagesRouter = Router({ mergeParams: true });
assignmentDamagesRouter.use(authenticate);
assignmentDamagesRouter.post("/", asyncHandler(async (req, res) => {
  const assignment = await prisma.staffAssignment.findUnique({ where: { id: req.params.id! }, include: { photos: true } });
  if (!assignment) throw new ApiError(404, "Khong tim thay ca lam viec");
  if (req.auth!.role !== "ADMIN" && assignment.staffId !== req.auth!.userId) throw new ApiError(403, "Khong co quyen bao cao ca nay");
  if (!assignment.photos.some((photo) => photo.type === "DAMAGE_ISSUE")) throw new ApiError(422, "Can tai it nhat mot anh hu hai truoc khi gui bao cao");
  const input = z.object({ description: z.string().min(10), quantity: z.number().int().positive(), estimatedCost: z.number().nonnegative().optional() }).parse(req.body);
  const data = await prisma.damageReport.create({ data: { ...input, assignmentId: assignment.id, contractId: assignment.contractId, reporterId: req.auth!.userId } });
  res.status(201).json({ success: true, data });
}));

const router = Router();
router.use(authenticate);
router.get("/", asyncHandler(async (req, res) => {
  const data = await prisma.damageReport.findMany({
    where: req.auth!.role === "ADMIN" ? undefined : { reporterId: req.auth!.userId },
    include: { reporter: { select: { id: true, fullName: true } }, assignment: true, contract: true, costItems: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data });
}));
router.get("/:id", asyncHandler(async (req, res) => {
  const data = await prisma.damageReport.findUnique({ where: { id: req.params.id! }, include: { reporter: { select: { id: true, fullName: true } }, assignment: true, contract: true, costItems: true } });
  if (!data) throw new ApiError(404, "Khong tim thay bao cao");
  if (req.auth!.role !== "ADMIN" && data.reporterId !== req.auth!.userId) throw new ApiError(403, "Khong co quyen xem bao cao");
  res.json({ success: true, data });
}));
router.patch("/:id", asyncHandler(async (req, res) => {
  const existing = await prisma.damageReport.findUnique({ where: { id: req.params.id! } });
  if (!existing) throw new ApiError(404, "Khong tim thay bao cao");
  if (req.auth!.role !== "ADMIN" && existing.reporterId !== req.auth!.userId) throw new ApiError(403, "Khong co quyen sua bao cao");
  if (req.auth!.role !== "ADMIN" && existing.status !== "PENDING") throw new ApiError(409, "Bao cao dang duoc xu ly va khong the sua");
  const input = z.object({ description: z.string().min(10).optional(), quantity: z.number().int().positive().optional(), estimatedCost: z.number().nonnegative().nullable().optional() }).parse(req.body);
  const data = await prisma.damageReport.update({ where: { id: existing.id }, data: input });
  res.json({ success: true, data });
}));
router.patch("/:id/review", authorize("ADMIN"), asyncHandler(async (req, res) => {
  const input = z.object({ status: z.enum(["REVIEWING", "APPROVED", "REJECTED", "RESOLVED"]), approvedCost: z.number().nonnegative().nullable().optional(), reviewNote: z.string().nullable().optional() }).parse(req.body);
  const data = await prisma.damageReport.update({ where: { id: req.params.id! }, data: input });
  res.json({ success: true, data });
}));
router.post("/:id/cost-items", authorize("ADMIN"), asyncHandler(async (req, res) => {
  const input = z.object({ description: z.string().min(2), amount: z.number().nonnegative() }).parse(req.body);
  const data = await prisma.damageCostItem.create({ data: { damageReportId: req.params.id!, ...input } });
  res.status(201).json({ success: true, data });
}));
router.delete("/:id/cost-items/:itemId", authorize("ADMIN"), asyncHandler(async (req, res) => {
  await prisma.damageCostItem.deleteMany({ where: { id: req.params.itemId!, damageReportId: req.params.id! } });
  res.status(204).send();
}));

export { router as damagesRouter };

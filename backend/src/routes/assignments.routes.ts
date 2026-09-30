import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { createAssignment, updateAssignment } from "../services/assignment.service.js";
import { writeAuditLog } from "../services/audit.service.js";

const router = Router();
router.use(authenticate);
const include = {
  staff: { select: { id: true, fullName: true, phone: true, email: true } },
  staffRate: true,
  contract: { include: { customer: { select: { fullName: true, phone: true } }, weddingPackage: true } },
  photos: true,
  damageReports: true,
};

const getAccessibleAssignment = async (id: string, auth: NonNullable<Express.Request["auth"]>) => {
  const item = await prisma.staffAssignment.findUnique({ where: { id }, include });
  if (!item) throw new ApiError(404, "Khong tim thay ca lam viec");
  if (auth.role !== "ADMIN" && item.staffId !== auth.userId) throw new ApiError(403, "Ban khong co quyen truy cap ca nay");
  return item;
};

router.get("/", authorize("ADMIN"), asyncHandler(async (_req, res) => {
  const data = await prisma.staffAssignment.findMany({ include, orderBy: { startTime: "desc" } });
  res.json({ success: true, data });
}));
router.get("/:id", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await getAccessibleAssignment(req.params.id!, req.auth!) });
}));
router.post("/", authorize("ADMIN"), asyncHandler(async (req, res) => {
  const input = z.object({ contractId: z.string(), staffId: z.string(), staffRateId: z.string(), title: z.string().min(2), startTime: z.coerce.date(), endTime: z.coerce.date() }).parse(req.body);
  const data = await createAssignment(input);
  await writeAuditLog(req, "CREATE_ASSIGNMENT", "StaffAssignment", data.id, input);
  res.status(201).json({ success: true, data });
}));
router.patch("/:id", authorize("ADMIN"), asyncHandler(async (req, res) => {
  const input = z.object({
    contractId: z.string().optional(),
    staffId: z.string().optional(),
    staffRateId: z.string().optional(),
    title: z.string().min(2).optional(),
    startTime: z.coerce.date().optional(),
    endTime: z.coerce.date().optional(),
    status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "REJECTED"]).optional(),
    completionNotes: z.string().nullable().optional(),
  }).parse(req.body);
  await updateAssignment(req.params.id!, input);
  const data = await prisma.staffAssignment.findUniqueOrThrow({ where: { id: req.params.id! }, include });
  await writeAuditLog(req, "UPDATE_ASSIGNMENT", "StaffAssignment", data.id, input);
  res.json({ success: true, data });
}));
router.delete("/:id", authorize("ADMIN"), asyncHandler(async (req, res) => {
  await prisma.staffAssignment.update({ where: { id: req.params.id! }, data: { status: "CANCELLED" } });
  res.status(204).send();
}));
router.post("/:id/check-in", asyncHandler(async (req, res) => {
  const item = await getAccessibleAssignment(req.params.id!, req.auth!);
  if (item.staffId !== req.auth!.userId) throw new ApiError(403, "Chi nhan vien duoc phan cong moi co the check-in");
  if (item.status !== "SCHEDULED") throw new ApiError(409, "Ca lam viec khong o trang thai cho check-in");
  if (!item.photos.some((photo) => photo.type === "BEFORE_SETUP")) throw new ApiError(422, "Can tai anh truoc thi cong truoc khi check-in");
  const data = await prisma.staffAssignment.update({ where: { id: item.id }, data: { status: "CHECKED_IN", actualCheckin: new Date() }, include });
  await writeAuditLog(req, "CHECK_IN", "StaffAssignment", item.id);
  res.json({ success: true, data });
}));
router.post("/:id/check-out", asyncHandler(async (req, res) => {
  const item = await getAccessibleAssignment(req.params.id!, req.auth!);
  if (item.staffId !== req.auth!.userId) throw new ApiError(403, "Chi nhan vien duoc phan cong moi co the check-out");
  if (item.status !== "CHECKED_IN" || !item.actualCheckin) throw new ApiError(409, "Can check-in truoc khi check-out");
  if (!item.photos.some((photo) => photo.type === "AFTER_SETUP")) throw new ApiError(422, "Can tai anh sau ban giao truoc khi check-out");
  const data = await prisma.staffAssignment.update({ where: { id: item.id }, data: { status: "CHECKED_OUT", actualCheckout: new Date() }, include });
  await writeAuditLog(req, "CHECK_OUT", "StaffAssignment", item.id);
  res.json({ success: true, data });
}));

export const staffAssignmentsRouter = Router()
  .use(authenticate, authorize("STAFF"))
  .get("/", asyncHandler(async (req, res) => {
    const data = await prisma.staffAssignment.findMany({ where: { staffId: req.auth!.userId }, include, orderBy: { startTime: "asc" } });
    res.json({ success: true, data });
  }))
  .get("/today", asyncHandler(async (req, res) => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(end.getDate() + 1);
    const data = await prisma.staffAssignment.findMany({ where: { staffId: req.auth!.userId, startTime: { gte: start, lt: end } }, include, orderBy: { startTime: "asc" } });
    res.json({ success: true, data });
  }));

export { router as assignmentsRouter };

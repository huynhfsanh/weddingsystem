import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { z } from "zod";
import { writeAuditLog } from "../services/audit.service.js";

const router = Router();
router.use(authenticate);

const payrollFor = async (staffId?: string) => {
  const assignments = await prisma.staffAssignment.findMany({
    where: {
      ...(staffId ? { staffId } : {}),
      status: "COMPLETED",
      actualCheckin: { not: null },
      actualCheckout: { not: null },
    },
    include: { staff: { select: { id: true, fullName: true, email: true } }, contract: { select: { contractCode: true, eventDate: true } } },
    orderBy: { endTime: "desc" },
  });
  const grouped = new Map<string, { staff: typeof assignments[number]["staff"]; totalShifts: number; totalWage: number; assignments: typeof assignments }>();
  for (const assignment of assignments) {
    const current = grouped.get(assignment.staffId) ?? { staff: assignment.staff, totalShifts: 0, totalWage: 0, assignments: [] };
    current.totalShifts += 1;
    current.totalWage += Number(assignment.wageAmount);
    current.assignments.push(assignment);
    grouped.set(assignment.staffId, current);
  }
  return [...grouped.values()];
};

router.get("/", asyncHandler(async (req, res) => {
  if (req.auth!.role === "CUSTOMER") throw new ApiError(403, "Khong co quyen xem bang cong");
  res.json({ success: true, data: await payrollFor(req.auth!.role === "STAFF" ? req.auth!.userId : undefined) });
}));
router.get("/staff/:staffId", asyncHandler(async (req, res) => {
  if (req.auth!.role !== "ADMIN" && req.auth!.userId !== req.params.staffId) throw new ApiError(403, "Khong co quyen xem bang cong nay");
  res.json({ success: true, data: await payrollFor(req.params.staffId) });
}));
router.get("/export", authorize("ADMIN"), asyncHandler(async (_req, res) => {
  const data = await payrollFor();
  const rows = ["Nhan vien,Email,So ca,Tong tien", ...data.map((item) => `"${item.staff.fullName}",${item.staff.email},${item.totalShifts},${item.totalWage}`)];
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=payroll.csv");
  res.send(`\uFEFF${rows.join("\n")}`);
}));
router.post("/mark-paid", authorize("ADMIN"), asyncHandler(async (req, res) => {
  const { assignmentIds } = z.object({ assignmentIds: z.array(z.string()).min(1).max(500) }).parse(req.body);
  const eligible = await prisma.staffAssignment.findMany({
    where: { id: { in: assignmentIds }, status: "COMPLETED", actualCheckin: { not: null }, actualCheckout: { not: null }, paidAt: null },
    select: { id: true },
  });
  if (eligible.length !== new Set(assignmentIds).size) throw new ApiError(422, "Danh sach co ca khong du dieu kien hoac da duoc thanh toan");
  const paidAt = new Date();
  await prisma.staffAssignment.updateMany({ where: { id: { in: assignmentIds } }, data: { paidAt, paidById: req.auth!.userId } });
  await writeAuditLog(req, "MARK_PAYROLL_PAID", "StaffAssignment", undefined, { assignmentIds, paidAt });
  res.json({ success: true, data: { updated: assignmentIds.length, paidAt } });
}));

export { router as payrollRouter };

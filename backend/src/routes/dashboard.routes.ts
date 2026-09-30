import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();
router.use(authenticate, authorize("ADMIN"));

router.get("/summary", asyncHandler(async (_req, res) => {
  const [contracts, users, assignments, pendingDamages, revenue] = await Promise.all([
    prisma.weddingContract.count(),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.staffAssignment.count({ where: { status: { in: ["SCHEDULED", "CHECKED_IN", "CHECKED_OUT"] } } }),
    prisma.damageReport.count({ where: { status: { in: ["PENDING", "REVIEWING"] } } }),
    prisma.contractPayment.aggregate({ where: { status: { in: ["SUCCESS", "OVERPAID"] } }, _sum: { receivedAmount: true } }),
  ]);
  res.json({ success: true, data: { contracts, activeUsers: users, activeAssignments: assignments, pendingDamages, revenue: Number(revenue._sum.receivedAmount ?? 0) } });
}));

router.get("/overview", asyncHandler(async (_req, res) => {
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + 45);
  const [upcomingEvents, pendingPayments, activeAssignments, recentActivity, statusCounts] = await Promise.all([
    prisma.weddingContract.findMany({
      where: { eventDate: { gte: now, lte: end }, status: { notIn: ["CANCELLED", "REJECTED"] } },
      select: { id: true, contractCode: true, eventDate: true, status: true, hostName: true, address: true, totalAmount: true, weddingPackage: { select: { name: true } }, customer: { select: { fullName: true, phone: true } } },
      orderBy: { eventDate: "asc" }, take: 8,
    }),
    prisma.contractPayment.findMany({
      where: { status: { in: ["PENDING", "PARTIAL"] } },
      select: { id: true, expectedAmount: true, receivedAmount: true, status: true, transactionCode: true, createdAt: true, contract: { select: { id: true, contractCode: true, hostName: true, customer: { select: { fullName: true } } } } },
      orderBy: { createdAt: "asc" }, take: 8,
    }),
    prisma.staffAssignment.findMany({
      where: { status: { in: ["SCHEDULED", "CHECKED_IN", "CHECKED_OUT"] }, startTime: { gte: now, lte: end } },
      select: { id: true, title: true, startTime: true, endTime: true, status: true, staff: { select: { fullName: true } }, contract: { select: { contractCode: true, hostName: true } } },
      orderBy: { startTime: "asc" }, take: 8,
    }),
    prisma.auditLog.findMany({
      select: { id: true, action: true, entityType: true, entityId: true, userId: true, createdAt: true },
      orderBy: { createdAt: "desc" }, take: 8,
    }),
    prisma.weddingContract.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const userIds = [...new Set(recentActivity.map((item) => item.userId).filter((id): id is string => Boolean(id)))];
  const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, fullName: true } });
  const userNames = new Map(users.map((user) => [user.id, user.fullName]));

  res.json({ success: true, data: {
    upcomingEvents: upcomingEvents.map((item) => ({ ...item, totalAmount: Number(item.totalAmount) })),
    pendingPayments: pendingPayments.map((item) => ({ ...item, expectedAmount: Number(item.expectedAmount), receivedAmount: Number(item.receivedAmount) })),
    activeAssignments,
    recentActivity: recentActivity.map((item) => ({ ...item, user: item.userId ? { fullName: userNames.get(item.userId) || "Người dùng" } : undefined })),
    statusCounts: statusCounts.map((item) => ({ status: item.status, count: item._count._all })),
  } });
}));

router.get("/revenue", asyncHandler(async (_req, res) => {
  const payments = await prisma.contractPayment.findMany({ where: { status: { in: ["SUCCESS", "OVERPAID"] }, paidAt: { not: null } }, select: { receivedAmount: true, paidAt: true } });
  const months = new Map<string, number>();
  for (const payment of payments) {
    const key = payment.paidAt!.toISOString().slice(0, 7);
    months.set(key, (months.get(key) ?? 0) + Number(payment.receivedAmount));
  }
  res.json({ success: true, data: [...months.entries()].sort().map(([month, amount]) => ({ month, amount })) });
}));

router.get("/events", asyncHandler(async (_req, res) => {
  const data = await prisma.weddingContract.groupBy({ by: ["status"], _count: { _all: true } });
  res.json({ success: true, data: data.map((item) => ({ status: item.status, count: item._count._all })) });
}));
router.get("/payments", asyncHandler(async (_req, res) => {
  const data = await prisma.contractPayment.groupBy({ by: ["status"], _count: { _all: true }, _sum: { receivedAmount: true } });
  res.json({ success: true, data: data.map((item) => ({ status: item.status, count: item._count._all, amount: Number(item._sum.receivedAmount ?? 0) })) });
}));
router.get("/payroll", asyncHandler(async (_req, res) => {
  const data = await prisma.staffAssignment.aggregate({ where: { status: "COMPLETED", actualCheckin: { not: null }, actualCheckout: { not: null } }, _count: true, _sum: { wageAmount: true } });
  res.json({ success: true, data: { shifts: data._count, amount: Number(data._sum.wageAmount ?? 0) } });
}));
router.get("/damages", asyncHandler(async (_req, res) => {
  const data = await prisma.damageReport.groupBy({ by: ["status"], _count: { _all: true }, _sum: { approvedCost: true } });
  res.json({ success: true, data: data.map((item) => ({ status: item.status, count: item._count._all, amount: Number(item._sum.approvedCost ?? 0) })) });
}));
router.get("/chatbot", asyncHandler(async (_req, res) => {
  const [conversations, messages] = await Promise.all([prisma.chatbotConversation.count(), prisma.chatbotMessage.count()]);
  res.json({ success: true, data: { conversations, messages } });
}));

export { router as dashboardRouter };

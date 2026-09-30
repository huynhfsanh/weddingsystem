import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { authenticate, authorize, optionalAuthenticate } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post("/", optionalAuthenticate, asyncHandler(async (req, res) => {
  const input = z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().email(),
    phone: z.string().trim().min(9).max(20).optional(),
    message: z.string().trim().min(10).max(3000),
  }).parse(req.body);
  const data = await prisma.supportRequest.create({ data: { ...input, userId: req.auth?.userId } });
  res.status(201).json({ success: true, data: { id: data.id, status: data.status, createdAt: data.createdAt } });
}));

router.get("/mine", authenticate, asyncHandler(async (req, res) => {
  const data = await prisma.supportRequest.findMany({ where: { userId: req.auth!.userId }, orderBy: { createdAt: "desc" } });
  res.json({ success: true, data });
}));

router.get("/", authenticate, authorize("ADMIN"), asyncHandler(async (_req, res) => {
  const data = await prisma.supportRequest.findMany({ include: { user: { select: { id: true, fullName: true, email: true } } }, orderBy: { createdAt: "desc" } });
  res.json({ success: true, data });
}));

router.patch("/:id", authenticate, authorize("ADMIN"), asyncHandler(async (req, res) => {
  const input = z.object({ status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]), adminNote: z.string().max(3000).nullable().optional() }).parse(req.body);
  const data = await prisma.supportRequest.update({ where: { id: req.params.id! }, data: input });
  if (data.userId) {
    await prisma.notification.create({ data: { userId: data.userId, title: "Yêu cầu hỗ trợ đã cập nhật", message: `Yêu cầu của bạn chuyển sang trạng thái ${data.status}.`, type: "SUPPORT" } });
  }
  res.json({ success: true, data });
}));

export { router as supportRouter };

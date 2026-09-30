import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";

const router = Router();
router.use(authenticate, authorize("ADMIN"));
const select = { id: true, email: true, fullName: true, phone: true, status: true, role: { select: { code: true, name: true } }, createdAt: true } as const;

router.get("/", asyncHandler(async (req, res) => {
  const role = z.enum(["ADMIN", "STAFF", "CUSTOMER"]).optional().parse(req.query.role);
  const data = await prisma.user.findMany({ where: role ? { role: { code: role } } : undefined, select, orderBy: { createdAt: "desc" } });
  res.json({ success: true, data });
}));
router.get("/:id", asyncHandler(async (req, res) => {
  const data = await prisma.user.findUnique({ where: { id: req.params.id! }, select });
  if (!data) throw new ApiError(404, "Khong tim thay nguoi dung");
  res.json({ success: true, data });
}));
router.post("/", asyncHandler(async (req, res) => {
  const input = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(72),
    fullName: z.string().min(2),
    phone: z.string().optional(),
    role: z.enum(["ADMIN", "STAFF", "CUSTOMER"]),
  }).parse(req.body);
  const role = await prisma.role.findUnique({ where: { code: input.role } });
  if (!role) throw new ApiError(503, "Du lieu role chua duoc khoi tao");
  const data = await prisma.user.create({
    data: { email: input.email.toLowerCase(), passwordHash: await bcrypt.hash(input.password, 12), fullName: input.fullName, phone: input.phone, roleId: role.id },
    select,
  });
  res.status(201).json({ success: true, data });
}));
router.post("/staff", asyncHandler(async (req, res) => {
  const input = z.object({ email: z.string().email(), password: z.string().min(8).max(72), fullName: z.string().min(2), phone: z.string().optional() }).parse(req.body);
  const { password, ...profile } = input;
  const role = await prisma.role.findUnique({ where: { code: "STAFF" } });
  if (!role) throw new ApiError(503, "Du lieu role chua duoc khoi tao");
  const data = await prisma.user.create({ data: { ...profile, email: profile.email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12), roleId: role.id }, select });
  res.status(201).json({ success: true, data });
}));
router.patch("/:id", asyncHandler(async (req, res) => {
  const input = z.object({ email: z.string().email().optional(), fullName: z.string().min(2).optional(), phone: z.string().nullable().optional() }).parse(req.body);
  if (input.email) input.email = input.email.toLowerCase();
  const data = await prisma.user.update({ where: { id: req.params.id! }, data: input, select });
  res.json({ success: true, data });
}));
router.patch("/:id/status", asyncHandler(async (req, res) => {
  const { status } = z.object({ status: z.enum(["ACTIVE", "INACTIVE", "LOCKED"]) }).parse(req.body);
  if (req.params.id === req.auth!.userId && status !== "ACTIVE") throw new ApiError(422, "Ban khong the tu khoa hoac vo hieu hoa tai khoan dang dung");
  const data = await prisma.user.update({ where: { id: req.params.id! }, data: { status }, select });
  res.json({ success: true, data });
}));
router.patch("/:id/role", asyncHandler(async (req, res) => {
  const { role: code } = z.object({ role: z.enum(["ADMIN", "STAFF", "CUSTOMER"]) }).parse(req.body);
  if (req.params.id === req.auth!.userId && code !== "ADMIN") throw new ApiError(422, "Ban khong the tu ha quyen tai khoan dang dung");
  const role = await prisma.role.findUniqueOrThrow({ where: { code } });
  const data = await prisma.user.update({ where: { id: req.params.id! }, data: { roleId: role.id }, select });
  res.json({ success: true, data });
}));
router.patch("/:id/reset-password", asyncHandler(async (req, res) => {
  const { password } = z.object({ password: z.string().min(8).max(72) }).parse(req.body);
  await prisma.$transaction([
    prisma.user.update({ where: { id: req.params.id! }, data: { passwordHash: await bcrypt.hash(password, 12) } }),
    prisma.refreshToken.updateMany({ where: { userId: req.params.id!, revokedAt: null }, data: { revokedAt: new Date() } }),
  ]);
  res.json({ success: true, message: "Da dat lai mat khau" });
}));
router.delete("/:id", asyncHandler(async (req, res) => {
  if (req.params.id === req.auth!.userId) throw new ApiError(422, "Ban khong the tu xoa tai khoan dang dung");
  await prisma.user.update({ where: { id: req.params.id! }, data: { status: "INACTIVE" } });
  await prisma.refreshToken.updateMany({ where: { userId: req.params.id!, revokedAt: null }, data: { revokedAt: new Date() } });
  res.status(204).send();
}));

export { router as usersRouter };

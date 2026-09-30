import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { authenticate } from "../middlewares/auth.js";
import { hashToken } from "../utils/hash.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { writeAuditLog } from "../services/audit.service.js";

const router = Router();
const credentialsSchema = z.object({ email: z.string().email(), password: z.string().min(8).max(72) });
const publicUserSelect = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  avatarUrl: true,
  status: true,
  role: { select: { code: true, name: true } },
} as const;

const issueTokens = async (userId: string, role: "ADMIN" | "STAFF" | "CUSTOMER") => {
  const accessToken = signAccessToken(userId, role);
  const refreshToken = signRefreshToken(userId);
  const payload = verifyRefreshToken(refreshToken);
  await prisma.refreshToken.create({
    data: { userId, tokenHash: hashToken(refreshToken), expiresAt: new Date(payload.exp * 1000) },
  });
  return { accessToken, refreshToken };
};

router.post("/register", asyncHandler(async (req, res) => {
  const input = credentialsSchema.extend({
    fullName: z.string().trim().min(2).max(100),
    phone: z.string().trim().min(9).max(20).optional(),
  }).parse(req.body);
  const exists = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (exists) throw new ApiError(409, "Email da duoc su dung");
  const role = await prisma.role.findUnique({ where: { code: "CUSTOMER" } });
  if (!role) throw new ApiError(503, "He thong chua duoc khoi tao du lieu role");
  const user = await prisma.user.create({
    data: {
      roleId: role.id,
      email: input.email.toLowerCase(),
      passwordHash: await bcrypt.hash(input.password, 12),
      fullName: input.fullName,
      phone: input.phone,
    },
    select: publicUserSelect,
  });
  const tokens = await issueTokens(user.id, user.role.code);
  res.status(201).json({ success: true, data: { user, ...tokens } });
}));

router.post("/login", asyncHandler(async (req, res) => {
  const input = credentialsSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() }, include: { role: true } });
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new ApiError(401, "Email hoac mat khau khong dung");
  }
  if (user.status !== "ACTIVE") throw new ApiError(403, "Tai khoan dang bi khoa hoac ngung hoat dong");
  const tokens = await issueTokens(user.id, user.role.code);
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  req.auth = { userId: user.id, role: user.role.code };
  await writeAuditLog(req, "LOGIN", "User", user.id);
  const { passwordHash: _passwordHash, ...safeUser } = user;
  res.json({ success: true, data: { user: safeUser, ...tokens } });
}));

router.post("/refresh", asyncHandler(async (req, res) => {
  const { refreshToken } = z.object({ refreshToken: z.string().min(1) }).parse(req.body);
  let payload: ReturnType<typeof verifyRefreshToken>;
  try { payload = verifyRefreshToken(refreshToken); } catch { throw new ApiError(401, "Refresh token khong hop le"); }
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(refreshToken) }, include: { user: { include: { role: true } } } });
  if (!stored || stored.revokedAt || stored.expiresAt < new Date() || stored.user.status !== "ACTIVE") {
    throw new ApiError(401, "Phien dang nhap da het han");
  }
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
  const tokens = await issueTokens(payload.sub, stored.user.role.code);
  res.json({ success: true, data: tokens });
}));

router.post("/logout", asyncHandler(async (req, res) => {
  const { refreshToken } = z.object({ refreshToken: z.string().optional() }).parse(req.body);
  if (refreshToken) {
    await prisma.refreshToken.updateMany({ where: { tokenHash: hashToken(refreshToken), revokedAt: null }, data: { revokedAt: new Date() } });
  }
  res.status(204).send();
}));

router.get("/me", authenticate, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.auth!.userId }, select: publicUserSelect });
  if (!user) throw new ApiError(404, "Khong tim thay tai khoan");
  res.json({ success: true, data: user });
}));

router.patch("/profile", authenticate, asyncHandler(async (req, res) => {
  const input = z.object({ fullName: z.string().trim().min(2).max(100), phone: z.string().trim().min(9).max(20).nullable().optional() }).parse(req.body);
  const user = await prisma.user.update({ where: { id: req.auth!.userId }, data: input, select: publicUserSelect });
  res.json({ success: true, data: user });
}));

router.patch("/change-password", authenticate, asyncHandler(async (req, res) => {
  const input = z.object({ currentPassword: z.string(), newPassword: z.string().min(8).max(72) }).parse(req.body);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId } });
  if (!(await bcrypt.compare(input.currentPassword, user.passwordHash))) throw new ApiError(422, "Mat khau hien tai khong dung");
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(input.newPassword, 12) } }),
    prisma.refreshToken.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } }),
  ]);
  res.json({ success: true, message: "Da doi mat khau" });
}));

export { router as authRouter };

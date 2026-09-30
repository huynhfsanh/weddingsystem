import type { RequestHandler } from "express";
import type { RoleCode } from "@prisma/client";
import { verifyAccessToken } from "../utils/jwt.js";
import { ApiError } from "../utils/api-error.js";
import { prisma } from "../config/prisma.js";

export const authenticate: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new ApiError(401, "Ban can dang nhap de tiep tuc"));
    return;
  }

  let payload: ReturnType<typeof verifyAccessToken>;
  try { payload = verifyAccessToken(header.slice(7)); } catch {
    next(new ApiError(401, "Phien dang nhap khong hop le hoac da het han"));
    return;
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { status: true, role: { select: { code: true } } } });
    if (!user || user.status !== "ACTIVE") {
      next(new ApiError(403, "Tai khoan dang bi khoa hoac ngung hoat dong"));
      return;
    }
    req.auth = { userId: payload.sub, role: user.role.code };
    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuthenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return next();
  try {
    const payload = verifyAccessToken(header.slice(7));
    req.auth = { userId: payload.sub, role: payload.role };
  } catch {
    // Public requests can continue without an authenticated identity.
  }
  next();
};

export const authorize = (...roles: RoleCode[]): RequestHandler => (req, _res, next) => {
  if (!req.auth || !roles.includes(req.auth.role)) {
    next(new ApiError(403, "Ban khong co quyen thuc hien thao tac nay"));
    return;
  }
  next();
};

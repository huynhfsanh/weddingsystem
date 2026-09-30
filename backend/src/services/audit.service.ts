import type { Request } from "express";
import { prisma } from "../config/prisma.js";

export const writeAuditLog = async (
  req: Request,
  action: string,
  entityType: string,
  entityId?: string,
  newData?: unknown,
) => {
  await prisma.auditLog.create({
    data: {
      userId: req.auth?.userId,
      action,
      entityType,
      entityId,
      newData: newData as never,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    },
  });
};

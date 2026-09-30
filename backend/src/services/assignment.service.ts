import { Prisma, type AssignmentStatus } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";
import { hasAssignmentConflict } from "../domain/assignment-conflict.js";

const activeStatuses: AssignmentStatus[] = ["SCHEDULED", "CHECKED_IN", "CHECKED_OUT"];

export interface AssignmentInput {
  contractId: string;
  staffId: string;
  staffRateId: string;
  title: string;
  startTime: Date;
  endTime: Date;
}

export const createAssignment = async (input: AssignmentInput) => prisma.$transaction(async (tx) => {
  const [staff, contract, rate, existing] = await Promise.all([
    tx.user.findFirst({ where: { id: input.staffId, role: { code: "STAFF" }, status: "ACTIVE" } }),
    tx.weddingContract.findUnique({ where: { id: input.contractId } }),
    tx.staffRate.findFirst({ where: { id: input.staffRateId, isActive: true } }),
    tx.staffAssignment.findMany({
      where: { staffId: input.staffId, status: { in: activeStatuses } },
      select: { startTime: true, endTime: true },
    }),
  ]);
  if (!staff) throw new ApiError(404, "Khong tim thay nhan vien dang hoat dong");
  if (!contract) throw new ApiError(404, "Khong tim thay hop dong");
  if (!rate) throw new ApiError(404, "Khong tim thay don gia cong viec");
  if (hasAssignmentConflict(input, existing, env.DEFAULT_ASSIGNMENT_BUFFER_MINUTES)) {
    throw new ApiError(409, "Nhan vien bi trung lich hoac khong du thoi gian di chuyen");
  }

  const assignment = await tx.staffAssignment.create({
    data: { ...input, wageAmount: rate.amount },
    include: { staff: { select: { id: true, fullName: true, phone: true } }, staffRate: true, contract: true },
  });
  await tx.notification.create({
    data: {
      userId: input.staffId,
      title: "Bạn có ca làm việc mới",
      message: `${input.title} bắt đầu lúc ${input.startTime.toLocaleString("vi-VN")}.`,
      type: "ASSIGNMENT",
      link: `/staff/assignments/${assignment.id}`,
    },
  });
  return assignment;
}, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

export interface UpdateAssignmentInput {
  contractId?: string;
  staffId?: string;
  staffRateId?: string;
  title?: string;
  startTime?: Date;
  endTime?: Date;
  status?: AssignmentStatus;
  completionNotes?: string | null;
}

export const updateAssignment = async (id: string, input: UpdateAssignmentInput) => prisma.$transaction(async (tx) => {
  const current = await tx.staffAssignment.findUnique({ where: { id } });
  if (!current) throw new ApiError(404, "Khong tim thay ca lam viec");
  const schedulingChanged = Boolean(input.contractId || input.staffId || input.staffRateId || input.startTime || input.endTime);
  if (schedulingChanged && current.status !== "SCHEDULED") throw new ApiError(409, "Chi ca dang cho moi duoc thay doi lich va nhan vien");

  const contractId = input.contractId ?? current.contractId;
  const staffId = input.staffId ?? current.staffId;
  const staffRateId = input.staffRateId ?? current.staffRateId;
  const startTime = input.startTime ?? current.startTime;
  const endTime = input.endTime ?? current.endTime;
  const [staff, contract, rate, existing] = await Promise.all([
    tx.user.findFirst({ where: { id: staffId, role: { code: "STAFF" }, status: "ACTIVE" } }),
    tx.weddingContract.findUnique({ where: { id: contractId } }),
    tx.staffRate.findFirst({ where: { id: staffRateId, isActive: true } }),
    tx.staffAssignment.findMany({
      where: { id: { not: id }, staffId, status: { in: activeStatuses } },
      select: { startTime: true, endTime: true },
    }),
  ]);
  if (!staff) throw new ApiError(404, "Khong tim thay nhan vien dang hoat dong");
  if (!contract) throw new ApiError(404, "Khong tim thay hop dong");
  if (!rate) throw new ApiError(404, "Khong tim thay don gia cong viec");
  if (hasAssignmentConflict({ startTime, endTime }, existing, env.DEFAULT_ASSIGNMENT_BUFFER_MINUTES)) {
    throw new ApiError(409, "Nhan vien bi trung lich hoac khong du thoi gian di chuyen");
  }

  const assignment = await tx.staffAssignment.update({
    where: { id },
    data: {
      contractId,
      staffId,
      staffRateId,
      title: input.title,
      startTime,
      endTime,
      wageAmount: rate.amount,
      status: input.status,
      completionNotes: input.completionNotes,
    },
  });
  if (schedulingChanged) {
    await tx.notification.create({
      data: { userId: staffId, title: "Ca làm việc đã cập nhật", message: `${assignment.title} bắt đầu lúc ${startTime.toLocaleString("vi-VN")}.`, type: "ASSIGNMENT", link: `/staff/assignments/${id}` },
    });
  }
  return assignment;
}, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

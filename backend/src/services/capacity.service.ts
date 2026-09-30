import type { ContractStatus } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";

const activeStatuses: ContractStatus[] = ["PENDING_DEPOSIT", "DEPOSITED", "APPROVED", "IN_PROGRESS"];

export const dayRange = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

export const calendarDate = (date: Date) => new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

export const checkCapacity = async (date: Date, excludeContractId?: string) => {
  const { start, end } = dayRange(date);
  const dateKey = calendarDate(date);
  const [configuration, accepted] = await Promise.all([
    prisma.dailyCapacity.findUnique({ where: { date: dateKey } }),
    prisma.weddingContract.count({
      where: {
        eventDate: { gte: start, lt: end },
        status: { in: activeStatuses },
        ...(excludeContractId ? { id: { not: excludeContractId } } : {}),
      },
    }),
  ]);
  const maximum = configuration?.maxEvents ?? env.DEFAULT_CAPACITY_PER_DAY;
  return { date: dateKey, maximum, accepted, remaining: Math.max(0, maximum - accepted), available: accepted < maximum };
};

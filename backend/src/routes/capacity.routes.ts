import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { calendarDate, checkCapacity } from "../services/capacity.service.js";

const router = Router();
const dateParam = (value: unknown) => {
  const text = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).parse(value);
  const [year, month, day] = text.split("-").map(Number);
  return new Date(Date.UTC(year!, month! - 1, day!));
};

router.get("/check-availability", asyncHandler(async (req, res) => {
  const date = z.coerce.date().parse(req.query.date);
  res.json({ success: true, data: await checkCapacity(date) });
}));
router.get("/", authenticate, authorize("ADMIN"), asyncHandler(async (_req, res) => {
  const data = await prisma.dailyCapacity.findMany({ orderBy: { date: "asc" } });
  res.json({ success: true, data });
}));
router.get("/:date", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await checkCapacity(dateParam(req.params.date)) });
}));
router.post("/", authenticate, authorize("ADMIN"), asyncHandler(async (req, res) => {
  const input = z.object({ date: z.coerce.date(), maxEvents: z.number().int().positive(), notes: z.string().optional() }).parse(req.body);
  const date = calendarDate(input.date);
  const data = await prisma.dailyCapacity.create({ data: { ...input, date } });
  res.status(201).json({ success: true, data });
}));
router.patch("/:date", authenticate, authorize("ADMIN"), asyncHandler(async (req, res) => {
  const input = z.object({ maxEvents: z.number().int().positive(), notes: z.string().nullable().optional() }).parse(req.body);
  const date = dateParam(req.params.date);
  const data = await prisma.dailyCapacity.upsert({ where: { date }, update: input, create: { date, maxEvents: input.maxEvents, notes: input.notes } });
  res.json({ success: true, data });
}));
router.delete("/:date", authenticate, authorize("ADMIN"), asyncHandler(async (req, res) => {
  const date = dateParam(req.params.date);
  await prisma.dailyCapacity.delete({ where: { date } });
  res.status(204).send();
}));

export { router as capacityRouter };

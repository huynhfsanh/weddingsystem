import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();
router.use(authenticate, authorize("ADMIN"));
const schema = z.object({ jobName: z.string().min(2), description: z.string().nullable().optional(), amount: z.number().nonnegative(), isActive: z.boolean().optional() });
router.get("/", asyncHandler(async (_req, res) => res.json({ success: true, data: await prisma.staffRate.findMany({ orderBy: { jobName: "asc" } }) })));
router.post("/", asyncHandler(async (req, res) => res.status(201).json({ success: true, data: await prisma.staffRate.create({ data: schema.parse(req.body) }) })));
router.patch("/:id", asyncHandler(async (req, res) => res.json({ success: true, data: await prisma.staffRate.update({ where: { id: req.params.id! }, data: schema.partial().parse(req.body) }) })));
router.delete("/:id", asyncHandler(async (req, res) => { await prisma.staffRate.update({ where: { id: req.params.id! }, data: { isActive: false } }); res.status(204).send(); }));

export { router as staffRatesRouter };

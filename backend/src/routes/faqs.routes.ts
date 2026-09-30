import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();
const schema = z.object({ question: z.string().min(5), answer: z.string().min(5), keywords: z.string().min(2), isActive: z.boolean().optional() });
router.get("/", asyncHandler(async (_req, res) => res.json({ success: true, data: await prisma.chatbotFaq.findMany({ where: { isActive: true }, orderBy: { createdAt: "asc" } }) })));
router.get("/admin/all", authenticate, authorize("ADMIN"), asyncHandler(async (_req, res) => res.json({ success: true, data: await prisma.chatbotFaq.findMany({ orderBy: [{ isActive: "desc" }, { createdAt: "asc" }] }) })));
router.post("/", authenticate, authorize("ADMIN"), asyncHandler(async (req, res) => res.status(201).json({ success: true, data: await prisma.chatbotFaq.create({ data: schema.parse(req.body) }) })));
router.patch("/:id", authenticate, authorize("ADMIN"), asyncHandler(async (req, res) => res.json({ success: true, data: await prisma.chatbotFaq.update({ where: { id: req.params.id! }, data: schema.partial().parse(req.body) }) })));
router.delete("/:id", authenticate, authorize("ADMIN"), asyncHandler(async (req, res) => { await prisma.chatbotFaq.update({ where: { id: req.params.id! }, data: { isActive: false } }); res.status(204).send(); }));

export { router as faqsRouter };

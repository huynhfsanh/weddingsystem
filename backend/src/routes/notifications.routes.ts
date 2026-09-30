import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();
router.use(authenticate);
router.get("/", asyncHandler(async (req, res) => res.json({ success: true, data: await prisma.notification.findMany({ where: { userId: req.auth!.userId }, orderBy: { createdAt: "desc" } }) })));
router.patch("/read-all", asyncHandler(async (req, res) => { await prisma.notification.updateMany({ where: { userId: req.auth!.userId, readAt: null }, data: { readAt: new Date() } }); res.json({ success: true }); }));
router.patch("/:id/read", asyncHandler(async (req, res) => { await prisma.notification.updateMany({ where: { id: req.params.id!, userId: req.auth!.userId }, data: { readAt: new Date() } }); res.json({ success: true }); }));

export { router as notificationsRouter };

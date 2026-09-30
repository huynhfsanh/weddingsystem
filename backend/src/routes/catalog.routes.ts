import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";

const router = Router();
const schema = z.object({
  name: z.string().min(2),
  type: z.enum(["FOOD", "SERVICE", "DECORATION", "EQUIPMENT", "TRANSPORT"]),
  description: z.string().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  unit: z.string().min(1).default("goi"),
  unitPrice: z.coerce.number().nonnegative(),
  isActive: z.boolean().optional(),
});

router.get("/", asyncHandler(async (req, res) => {
  const type = z.enum(["FOOD", "SERVICE", "DECORATION", "EQUIPMENT", "TRANSPORT"]).optional().parse(req.query.type);
  const data = await prisma.catalogItem.findMany({ where: { isActive: true, ...(type ? { type } : {}) }, orderBy: [{ type: "asc" }, { name: "asc" }] });
  res.json({ success: true, data });
}));
router.get("/admin/all", authenticate, authorize("ADMIN"), asyncHandler(async (_req, res) => {
  const data = await prisma.catalogItem.findMany({ orderBy: [{ isActive: "desc" }, { type: "asc" }, { name: "asc" }] });
  res.json({ success: true, data });
}));
router.get("/:id", asyncHandler(async (req, res) => {
  const data = await prisma.catalogItem.findUnique({ where: { id: req.params.id! } });
  if (!data) throw new ApiError(404, "Khong tim thay hang muc");
  res.json({ success: true, data });
}));
router.post("/", authenticate, authorize("ADMIN"), asyncHandler(async (req, res) => {
  const data = await prisma.catalogItem.create({ data: schema.parse(req.body) });
  res.status(201).json({ success: true, data });
}));
router.patch("/:id", authenticate, authorize("ADMIN"), asyncHandler(async (req, res) => {
  const data = await prisma.catalogItem.update({ where: { id: req.params.id! }, data: schema.partial().parse(req.body) });
  res.json({ success: true, data });
}));
router.delete("/:id", authenticate, authorize("ADMIN"), asyncHandler(async (req, res) => {
  await prisma.catalogItem.update({ where: { id: req.params.id! }, data: { isActive: false } });
  res.status(204).send();
}));

export { router as catalogRouter };

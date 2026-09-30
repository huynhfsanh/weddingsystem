import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { imageUpload } from "../middlewares/upload.js";
import { deleteStoredImage, storeImage } from "../services/storage.service.js";

const router = Router();
const comboInclude = { dishes: { where: { isActive: true }, orderBy: { sortOrder: "asc" as const } } };
const adminComboInclude = { dishes: { orderBy: [{ isActive: "desc" as const }, { sortOrder: "asc" as const }] } };
const comboSchema = z.object({
  code: z.string().trim().min(2).max(50).regex(/^[A-Z0-9_-]+$/),
  name: z.string().trim().min(2).max(150),
  groupName: z.string().trim().min(2).max(100),
  description: z.string().trim().max(1000).nullable().optional(),
  pricePerTable: z.coerce.number().nonnegative().default(0),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});
const dishSchema = z.object({
  name: z.string().trim().min(2).max(200),
  referenceUrl: z.string().url().max(500).nullable().optional(),
  imageUrl: z.string().url().max(500).nullable().optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

router.get("/", asyncHandler(async (_req, res) => {
  const data = await prisma.menuCombo.findMany({ where: { isActive: true }, include: comboInclude, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  res.json({ success: true, data });
}));
router.get("/dishes", asyncHandler(async (_req, res) => {
  const data = await prisma.menuDish.findMany({ where: { isActive: true, combo: { isActive: true } }, include: { combo: { select: { id: true, name: true, groupName: true } } }, orderBy: [{ name: "asc" }] });
  res.json({ success: true, data });
}));
router.get("/admin/all", authenticate, authorize("ADMIN"), asyncHandler(async (_req, res) => {
  const data = await prisma.menuCombo.findMany({ include: adminComboInclude, orderBy: [{ isActive: "desc" }, { sortOrder: "asc" }, { name: "asc" }] });
  res.json({ success: true, data });
}));
router.get("/:id", asyncHandler(async (req, res) => {
  const data = await prisma.menuCombo.findUnique({ where: { id: req.params.id! }, include: comboInclude });
  if (!data) throw new ApiError(404, "Khong tim thay combo thuc don");
  res.json({ success: true, data });
}));
router.post("/", authenticate, authorize("ADMIN"), asyncHandler(async (req, res) => {
  const data = await prisma.menuCombo.create({ data: comboSchema.parse(req.body), include: adminComboInclude });
  res.status(201).json({ success: true, data });
}));
router.patch("/:id", authenticate, authorize("ADMIN"), asyncHandler(async (req, res) => {
  const data = await prisma.menuCombo.update({ where: { id: req.params.id! }, data: comboSchema.partial().parse(req.body), include: adminComboInclude });
  res.json({ success: true, data });
}));
router.delete("/:id", authenticate, authorize("ADMIN"), asyncHandler(async (req, res) => {
  await prisma.menuCombo.update({ where: { id: req.params.id! }, data: { isActive: false } });
  res.status(204).send();
}));
router.post("/:id/dishes", authenticate, authorize("ADMIN"), asyncHandler(async (req, res) => {
  const combo = await prisma.menuCombo.findUnique({ where: { id: req.params.id! } });
  if (!combo) throw new ApiError(404, "Khong tim thay combo thuc don");
  const data = await prisma.menuDish.create({ data: { comboId: combo.id, ...dishSchema.parse(req.body) } });
  res.status(201).json({ success: true, data });
}));
router.patch("/:id/dishes/:dishId", authenticate, authorize("ADMIN"), asyncHandler(async (req, res) => {
  const current = await prisma.menuDish.findFirst({ where: { id: req.params.dishId!, comboId: req.params.id! } });
  if (!current) throw new ApiError(404, "Khong tim thay mon an trong combo");
  const data = await prisma.menuDish.update({ where: { id: current.id }, data: dishSchema.partial().parse(req.body) });
  res.json({ success: true, data });
}));
router.post("/:id/dishes/:dishId/image", authenticate, authorize("ADMIN"), imageUpload.single("image"), asyncHandler(async (req, res) => {
  const current = await prisma.menuDish.findFirst({ where: { id: req.params.dishId!, comboId: req.params.id! } });
  if (!current) throw new ApiError(404, "Khong tim thay mon an trong combo");
  if (!req.file) throw new ApiError(422, "Vui long chon anh mon an");
  const stored = await storeImage(req.file);
  try {
    const data = await prisma.menuDish.update({ where: { id: current.id }, data: { imageUrl: stored.url } });
    if (current.imageUrl && current.imageUrl !== stored.url) await deleteStoredImage(current.imageUrl);
    res.json({ success: true, data });
  } catch (error) {
    await deleteStoredImage(stored.url);
    throw error;
  }
}));
router.delete("/:id/dishes/:dishId", authenticate, authorize("ADMIN"), asyncHandler(async (req, res) => {
  const current = await prisma.menuDish.findFirst({ where: { id: req.params.dishId!, comboId: req.params.id! } });
  if (!current) throw new ApiError(404, "Khong tim thay mon an trong combo");
  await prisma.menuDish.update({ where: { id: current.id }, data: { isActive: false } });
  res.status(204).send();
}));

export { router as menuRouter };

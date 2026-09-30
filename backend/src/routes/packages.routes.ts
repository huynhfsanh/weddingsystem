import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { packageRepository } from "../repositories/package.repository.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { imageUpload } from "../middlewares/upload.js";
import { deleteStoredImage, storeImage } from "../services/storage.service.js";

const router = Router();
const packageSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/),
  style: z.string().trim().min(2),
  description: z.string().trim().min(10),
  imageUrl: z.string().url().nullable().optional(),
  basePrice: z.coerce.number().positive(),
  standardTables: z.coerce.number().int().positive(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});
const imageSchema = z.object({
  url: z.string().url().max(500),
  altText: z.string().trim().max(255).nullable().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isCover: z.boolean().default(false),
});

router.get("/", asyncHandler(async (req, res) => {
  const query = z.object({
    search: z.string().optional(), style: z.string().optional(),
    minPrice: z.coerce.number().optional(), maxPrice: z.coerce.number().optional(),
    featured: z.enum(["true", "false"]).optional(),
  }).parse(req.query);
  const data = await packageRepository.list({ ...query, featured: query.featured === undefined ? undefined : query.featured === "true" });
  res.json({ success: true, data });
}));

router.get("/admin/all", authenticate, authorize("ADMIN"), asyncHandler(async (_req, res) => {
  const data = await prisma.weddingPackage.findMany({
    include: { packageItems: { include: { catalogItem: true } }, images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] } },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });
  res.json({ success: true, data });
}));

router.get("/slug/:slug", asyncHandler(async (req, res) => {
  const item = await packageRepository.findBySlug(req.params.slug!);
  if (!item) throw new ApiError(404, "Khong tim thay goi cuoi");
  res.json({ success: true, data: item });
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const item = await packageRepository.findById(req.params.id!);
  if (!item) throw new ApiError(404, "Khong tim thay goi cuoi");
  res.json({ success: true, data: item });
}));

router.post("/", authenticate, authorize("ADMIN"), asyncHandler(async (req, res) => {
  const input = packageSchema.parse(req.body);
  const data = await prisma.weddingPackage.create({ data: input });
  res.status(201).json({ success: true, data });
}));

router.patch("/:id", authenticate, authorize("ADMIN"), asyncHandler(async (req, res) => {
  const input = packageSchema.partial().parse(req.body);
  const data = await prisma.weddingPackage.update({ where: { id: req.params.id! }, data: input });
  res.json({ success: true, data });
}));

router.delete("/:id", authenticate, authorize("ADMIN"), asyncHandler(async (req, res) => {
  await prisma.weddingPackage.update({ where: { id: req.params.id! }, data: { isActive: false } });
  res.status(204).send();
}));

router.post("/:id/items", authenticate, authorize("ADMIN"), asyncHandler(async (req, res) => {
  const input = z.object({ catalogItemId: z.string(), quantity: z.number().int().positive().default(1), isRequired: z.boolean().default(false) }).parse(req.body);
  const data = await prisma.packageCatalogItem.upsert({
    where: { packageId_catalogItemId: { packageId: req.params.id!, catalogItemId: input.catalogItemId } },
    update: { quantity: input.quantity, isRequired: input.isRequired },
    create: { packageId: req.params.id!, ...input },
  });
  res.status(201).json({ success: true, data });
}));

router.delete("/:id/items/:itemId", authenticate, authorize("ADMIN"), asyncHandler(async (req, res) => {
  await prisma.packageCatalogItem.delete({ where: { packageId_catalogItemId: { packageId: req.params.id!, catalogItemId: req.params.itemId! } } });
  res.status(204).send();
}));

router.post("/:id/images/upload", authenticate, authorize("ADMIN"), imageUpload.single("image"), asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(422, "Vui long chon anh");
  const input = z.object({
    altText: z.string().trim().max(255).optional(),
    sortOrder: z.coerce.number().int().min(0).default(0),
    isCover: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  }).parse(req.body);
  const stored = await storeImage(req.file);
  const data = await prisma.$transaction(async (tx) => {
    const weddingPackage = await tx.weddingPackage.findUnique({ where: { id: req.params.id! } });
    if (!weddingPackage) throw new ApiError(404, "Khong tim thay goi cuoi");
    const count = await tx.packageImage.count({ where: { packageId: weddingPackage.id } });
    const isCover = input.isCover || count === 0;
    if (isCover) await tx.packageImage.updateMany({ where: { packageId: weddingPackage.id }, data: { isCover: false } });
    const image = await tx.packageImage.create({ data: { packageId: weddingPackage.id, url: stored.url, altText: input.altText, sortOrder: input.sortOrder, isCover } });
    if (isCover) await tx.weddingPackage.update({ where: { id: weddingPackage.id }, data: { imageUrl: stored.url } });
    return image;
  });
  res.status(201).json({ success: true, data });
}));

router.post("/:id/images", authenticate, authorize("ADMIN"), asyncHandler(async (req, res) => {
  const input = imageSchema.parse(req.body);
  const data = await prisma.$transaction(async (tx) => {
    const weddingPackage = await tx.weddingPackage.findUnique({ where: { id: req.params.id! } });
    if (!weddingPackage) throw new ApiError(404, "Khong tim thay goi cuoi");
    const count = await tx.packageImage.count({ where: { packageId: weddingPackage.id } });
    const isCover = input.isCover || count === 0;
    if (isCover) await tx.packageImage.updateMany({ where: { packageId: weddingPackage.id }, data: { isCover: false } });
    const image = await tx.packageImage.create({ data: { packageId: weddingPackage.id, url: input.url, altText: input.altText, sortOrder: input.sortOrder, isCover } });
    if (isCover) await tx.weddingPackage.update({ where: { id: weddingPackage.id }, data: { imageUrl: input.url } });
    return image;
  });
  res.status(201).json({ success: true, data });
}));

router.patch("/:id/images/:imageId", authenticate, authorize("ADMIN"), asyncHandler(async (req, res) => {
  const input = imageSchema.partial().parse(req.body);
  const data = await prisma.$transaction(async (tx) => {
    const current = await tx.packageImage.findFirst({ where: { id: req.params.imageId!, packageId: req.params.id! } });
    if (!current) throw new ApiError(404, "Khong tim thay anh trong goi cuoi");
    if (input.isCover) await tx.packageImage.updateMany({ where: { packageId: current.packageId, id: { not: current.id } }, data: { isCover: false } });
    const image = await tx.packageImage.update({ where: { id: current.id }, data: input });
    if (image.isCover) await tx.weddingPackage.update({ where: { id: current.packageId }, data: { imageUrl: image.url } });
    return image;
  });
  res.json({ success: true, data });
}));

router.delete("/:id/images/:imageId", authenticate, authorize("ADMIN"), asyncHandler(async (req, res) => {
  const deletedUrl = await prisma.$transaction(async (tx) => {
    const current = await tx.packageImage.findFirst({ where: { id: req.params.imageId!, packageId: req.params.id! } });
    if (!current) throw new ApiError(404, "Khong tim thay anh trong goi cuoi");
    await tx.packageImage.delete({ where: { id: current.id } });
    if (current.isCover) {
      const next = await tx.packageImage.findFirst({ where: { packageId: current.packageId }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
      if (next) {
        await tx.packageImage.update({ where: { id: next.id }, data: { isCover: true } });
        await tx.weddingPackage.update({ where: { id: current.packageId }, data: { imageUrl: next.url } });
      } else await tx.weddingPackage.update({ where: { id: current.packageId }, data: { imageUrl: null } });
    }
    return current.url;
  });
  await deleteStoredImage(deletedUrl);
  res.status(204).send();
}));

export { router as packagesRouter };

import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { imageUpload } from "../middlewares/upload.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { deleteStoredImage, storeImage } from "../services/storage.service.js";

export const assignmentPhotosRouter = Router({ mergeParams: true });
assignmentPhotosRouter.use(authenticate);
assignmentPhotosRouter.post("/", imageUpload.single("image"), asyncHandler(async (req, res) => {
  const assignment = await prisma.staffAssignment.findUnique({ where: { id: req.params.id! } });
  if (!assignment) throw new ApiError(404, "Khong tim thay ca lam viec");
  if (req.auth!.role !== "ADMIN" && assignment.staffId !== req.auth!.userId) throw new ApiError(403, "Khong co quyen tai anh cho ca nay");
  if (!req.file) throw new ApiError(422, "Vui long chon anh");
  const type = z.enum(["BEFORE_SETUP", "AFTER_SETUP", "DAMAGE_ISSUE"]).parse(req.body.type);
  const stored = await storeImage(req.file);
  const data = await prisma.assignmentPhoto.create({ data: { assignmentId: assignment.id, uploaderId: req.auth!.userId, type, note: req.body.note, ...stored } });
  res.status(201).json({ success: true, data });
}));
assignmentPhotosRouter.get("/", asyncHandler(async (req, res) => {
  const assignment = await prisma.staffAssignment.findUnique({ where: { id: req.params.id! } });
  if (!assignment) throw new ApiError(404, "Khong tim thay ca lam viec");
  if (req.auth!.role !== "ADMIN" && assignment.staffId !== req.auth!.userId) throw new ApiError(403, "Khong co quyen xem anh");
  const data = await prisma.assignmentPhoto.findMany({ where: { assignmentId: assignment.id }, orderBy: { createdAt: "asc" } });
  res.json({ success: true, data });
}));

export const photosRouter = Router()
  .use(authenticate)
  .delete("/:id", asyncHandler(async (req, res) => {
    const photo = await prisma.assignmentPhoto.findUnique({ where: { id: req.params.id! } });
    if (!photo) throw new ApiError(404, "Khong tim thay anh");
    if (req.auth!.role !== "ADMIN" && photo.uploaderId !== req.auth!.userId) throw new ApiError(403, "Khong co quyen xoa anh");
    await prisma.assignmentPhoto.delete({ where: { id: photo.id } });
    await deleteStoredImage(photo.url);
    res.status(204).send();
  }));

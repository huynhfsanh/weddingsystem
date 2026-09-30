import multer from "multer";
import { ApiError } from "../utils/api-error.js";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new ApiError(415, "Chi chap nhan anh JPG, PNG hoac WebP"));
      return;
    }
    callback(null, true);
  },
});

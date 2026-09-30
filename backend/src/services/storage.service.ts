import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { cloudinary, cloudinaryEnabled } from "../config/cloudinary.js";

const uploadToCloudinary = (file: Express.Multer.File) => new Promise<{ url: string; thumbnailUrl: string }>((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    { folder: "wedding-management", resource_type: "image" },
    (error, result) => {
      if (error || !result) return reject(error ?? new Error("Tai anh that bai"));
      resolve({
        url: result.secure_url,
        thumbnailUrl: result.secure_url.replace("/upload/", "/upload/c_fill,w_480,h_320/"),
      });
    },
  );
  stream.end(file.buffer);
});

const storeImageLocally = async (file: Express.Multer.File) => {
  const extension = file.mimetype === "image/png" ? "png" : file.mimetype === "image/webp" ? "webp" : "jpg";
  const filename = `${randomUUID()}.${extension}`;
  const uploadDirectory = path.resolve(process.cwd(), "uploads");
  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(path.join(uploadDirectory, filename), file.buffer);
  return { url: `/uploads/${filename}`, thumbnailUrl: `/uploads/${filename}` };
};

export const storeImage = async (file: Express.Multer.File) => {
  if (cloudinaryEnabled) {
    try {
      return await uploadToCloudinary(file);
    } catch {
      console.warn("Cloudinary upload bi tu choi; chuyen sang luu anh local");
    }
  }
  return storeImageLocally(file);
};

export const deleteStoredImage = async (url: string) => {
  if (url.startsWith("/uploads/")) {
    const uploadDirectory = path.resolve(process.cwd(), "uploads");
    const target = path.resolve(uploadDirectory, path.basename(url));
    if (!target.startsWith(`${uploadDirectory}${path.sep}`)) return;
    await unlink(target).catch((error: NodeJS.ErrnoException) => { if (error.code !== "ENOENT") throw error; });
    return;
  }
  if (cloudinaryEnabled && url.includes("res.cloudinary.com") && url.includes("/wedding-management/")) {
    const filename = url.split("/wedding-management/")[1]?.split(/[?#]/)[0];
    if (filename) await cloudinary.uploader.destroy(`wedding-management/${decodeURIComponent(filename).replace(/\.[^.]+$/, "")}`);
  }
};

export const loadStoredImage = async (url: string) => {
  if (url.startsWith("/uploads/")) return readFile(path.resolve(process.cwd(), "uploads", path.basename(url)));
  const response = await fetch(url);
  if (!response.ok) throw new Error("Khong the tai anh chu ky");
  return Buffer.from(await response.arrayBuffer());
};

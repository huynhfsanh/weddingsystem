import type { ErrorRequestHandler, RequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { ApiError } from "../utils/api-error.js";

export const notFound: RequestHandler = (req, _res, next) => {
  next(new ApiError(404, `Khong tim thay ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({ success: false, message: error.message, details: error.details });
    return;
  }

  if (error instanceof ZodError) {
    res.status(422).json({ success: false, message: "Du lieu khong hop le", details: error.flatten() });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const status = error.code === "P2002" ? 409 : error.code === "P2025" ? 404 : 400;
    res.status(status).json({ success: false, message: "Khong the xu ly du lieu", code: error.code });
    return;
  }

  console.error(error);
  res.status(500).json({ success: false, message: "He thong dang gap su co. Vui long thu lai sau." });
};

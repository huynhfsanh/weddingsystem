import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { ApiError } from "../utils/api-error.js";

export const validate = (schema: ZodType): RequestHandler => (req, _res, next) => {
  const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
  if (!result.success) {
    next(new ApiError(422, "Du lieu gui len khong hop le", result.error.flatten()));
    return;
  }

  const value = result.data as { body?: unknown; params?: unknown; query?: unknown };
  if (value.body !== undefined) req.body = value.body;
  next();
};

import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ParamsFlatDictionary } from "express-serve-static-core";

export const asyncHandler = (
  handler: (req: Request<ParamsFlatDictionary>, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler<ParamsFlatDictionary> => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

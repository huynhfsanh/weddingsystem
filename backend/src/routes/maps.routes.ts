import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";

const router = Router();
const googleRequest = async (path: string, params: URLSearchParams) => {
  if (!env.GOOGLE_MAPS_SERVER_KEY) throw new ApiError(503, "Google Maps chua duoc cau hinh; ban van co the nhap dia chi thu cong");
  params.set("key", env.GOOGLE_MAPS_SERVER_KEY);
  const response = await fetch(`https://maps.googleapis.com/maps/api/${path}?${params}`);
  if (!response.ok) throw new ApiError(502, "Google Maps dang tam thoi khong phan hoi");
  return response.json();
};
router.get("/geocode", asyncHandler(async (req, res) => {
  const address = z.string().min(3).parse(req.query.address);
  res.json({ success: true, data: await googleRequest("geocode/json", new URLSearchParams({ address, language: "vi", region: "vn" })) });
}));
router.get("/place-details", asyncHandler(async (req, res) => {
  const placeId = z.string().min(3).parse(req.query.placeId);
  res.json({ success: true, data: await googleRequest("place/details/json", new URLSearchParams({ place_id: placeId, language: "vi" })) });
}));
router.get("/directions", asyncHandler(async (req, res) => {
  const input = z.object({ origin: z.string().min(3), destination: z.string().min(3) }).parse(req.query);
  res.json({ success: true, data: await googleRequest("directions/json", new URLSearchParams({ ...input, language: "vi" })) });
}));

export { router as mapsRouter };

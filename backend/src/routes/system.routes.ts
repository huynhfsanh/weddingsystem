import { Router } from "express";
import { env } from "../config/env.js";
import { payosEnabled } from "../config/payos.js";

const router = Router();
router.get("/public", (_req, res) => res.json({
  success: true,
  data: {
    business: { name: env.BUSINESS_NAME, phone: env.BUSINESS_PHONE, email: env.BUSINESS_EMAIL, address: env.BUSINESS_ADDRESS, representative: env.BUSINESS_REPRESENTATIVE },
    payment: { accountNumber: env.CASSO_ACCOUNT_NUMBER, accountName: env.CASSO_ACCOUNT_NAME, bankName: env.CASSO_BANK_NAME },
    integrations: {
      openai: Boolean(env.OPENAI_API_KEY && env.OPENAI_MODEL),
      googleMaps: Boolean(env.GOOGLE_MAPS_SERVER_KEY),
      payos: payosEnabled,
      casso: Boolean(env.CASSO_API_KEY && env.CASSO_WEBHOOK_SECRET),
      cloudinary: Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET),
    },
    defaults: { depositRate: env.DEFAULT_DEPOSIT_RATE, capacityPerDay: env.DEFAULT_CAPACITY_PER_DAY, assignmentBufferMinutes: env.DEFAULT_ASSIGNMENT_BUFFER_MINUTES },
  },
}));

export { router as systemRouter };

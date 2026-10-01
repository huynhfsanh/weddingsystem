import "dotenv/config";
import { z } from "zod";

const optionalString = z.string().trim().optional().transform((value) => value || undefined);

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().default("mysql://root:password@localhost:3306/wedding_management"),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  JWT_SECRET: z.string().min(32).default("development-access-secret-change-me-now"),
  JWT_REFRESH_SECRET: z.string().min(32).default("development-refresh-secret-change-me"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  OPENAI_API_KEY: optionalString,
  OPENAI_MODEL: optionalString,
  OPENAI_BASE_URL: z.string().url().optional().transform((value) => value?.replace(/\/$/, "")),
  OPENAI_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.3),
  OPENAI_MAX_OUTPUT_TOKENS: z.coerce.number().int().positive().default(800),
  CLOUDINARY_CLOUD_NAME: optionalString,
  CLOUDINARY_API_KEY: optionalString,
  CLOUDINARY_API_SECRET: optionalString,
  GOOGLE_MAPS_SERVER_KEY: optionalString,
  PAYOS_CLIENT_ID: optionalString,
  PAYOS_API_KEY: optionalString,
  PAYOS_CHECKSUM_KEY: optionalString,
  CASSO_API_KEY: optionalString,
  CASSO_CLIENT_ID: optionalString,
  CASSO_CHECKSUM_KEY: optionalString,
  CASSO_WEBHOOK_SECRET: optionalString,
  CASSO_API_URL: z.string().url().default("https://oauth.casso.vn/v2"),
  CASSO_ACCOUNT_NUMBER: optionalString,
  CASSO_ACCOUNT_NAME: optionalString,
  CASSO_BANK_NAME: optionalString,
  PAYMENT_WEBHOOK_URL: optionalString,
  BUSINESS_NAME: z.string().default("Green Wedding"),
  BUSINESS_PHONE: z.string().default("0799392717"),
  BUSINESS_EMAIL: z.string().email().default("hello@example.com"),
  BUSINESS_ADDRESS: z.string().default("Điện Bàn Bắc, Đà Nẵng"),
  BUSINESS_REPRESENTATIVE: z.string().default("Huỳnh Trần Sơn Sanh"),
  DEFAULT_DEPOSIT_RATE: z.coerce.number().min(1).max(100).default(50),
  DEFAULT_CAPACITY_PER_DAY: z.coerce.number().int().positive().default(3),
  DEFAULT_ASSIGNMENT_BUFFER_MINUTES: z.coerce.number().int().min(0).default(30),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Cau hinh moi truong khong hop le", parsed.error.flatten().fieldErrors);
  throw new Error("Khong the khoi dong do cau hinh moi truong khong hop le");
}

if (parsed.data.NODE_ENV === "production") {
  if (parsed.data.JWT_SECRET.includes("development") || parsed.data.JWT_REFRESH_SECRET.includes("development")) {
    throw new Error("JWT_SECRET va JWT_REFRESH_SECRET phai duoc thay doi trong production");
  }
}

export const env = parsed.data;

import type { RoleCode } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
      auth?: {
        userId: string;
        role: RoleCode;
      };
    }
  }
}

export {};

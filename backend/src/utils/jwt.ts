import jwt, { type SignOptions } from "jsonwebtoken";
import type { RoleCode } from "@prisma/client";
import { env } from "../config/env.js";

export interface AccessTokenPayload {
  sub: string;
  role: RoleCode;
  type: "access";
}

const accessOptions: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] };
const refreshOptions: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"] };

export const signAccessToken = (userId: string, role: RoleCode) =>
  jwt.sign({ sub: userId, role, type: "access" }, env.JWT_SECRET, accessOptions);

export const signRefreshToken = (userId: string) =>
  jwt.sign({ sub: userId, type: "refresh" }, env.JWT_REFRESH_SECRET, refreshOptions);

export const verifyAccessToken = (token: string) => jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string; type: "refresh"; exp: number };

import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { TipoUsuario } from "@prisma/client";
import ENV from "../config/env";

const JWT_SECRET: Secret = ENV.JWT_SECRET;
const JWT_EXPIRE_IN: SignOptions["expiresIn"] = ENV.JWT_EXPIRE_IN as SignOptions["expiresIn"];

const REFRESH_TOKEN_SECRET: Secret = ENV.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRE_IN: SignOptions["expiresIn"] = ENV.REFRESH_TOKEN_EXPIRE_IN as SignOptions["expiresIn"];

export interface TokenPayload {
  id: string;
  email: string;
  tipo: TipoUsuario;
}

interface RefreshTokenPayload extends TokenPayload {
  type: "refresh";
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE_IN });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}

export function generateRefreshToken(payload: TokenPayload): string {
  const refreshPayload: RefreshTokenPayload = { ...payload, type: "refresh" };
  return jwt.sign(refreshPayload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRE_IN });
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
    if (decoded.type !== "refresh") return null;
    return { id: decoded.id, email: decoded.email, tipo: decoded.tipo };
  } catch (err) {
    return null;
  }
}

/** Data de expiração (claim `exp`) de um token já assinado — usada para persistir junto do hash do refresh token. */
export function getTokenExpiry(token: string): Date | null {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  return decoded?.exp ? new Date(decoded.exp * 1000) : null;
}

export default { generateToken, verifyToken, generateRefreshToken, verifyRefreshToken, getTokenExpiry };

import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { TipoUsuario } from "@prisma/client";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRE_IN: SignOptions["expiresIn"] =
  process.env.JWT_EXPIRE_IN !== undefined
    ? (process.env.JWT_EXPIRE_IN as SignOptions["expiresIn"])
    : "7d";

export interface TokenPayload {
  id: string;
  email: string;
  tipo: TipoUsuario;
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

export default { generateToken, verifyToken };

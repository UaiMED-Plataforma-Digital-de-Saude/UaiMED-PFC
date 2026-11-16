import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

// Carrega .env antes de validar
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const envSchema = z.object({
  NODE_ENV: z
    .enum(["production", "development", "test"])
    .default("development"),
  PORT: z.string().optional().default("3333"),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().default("dev-secret"),
  JWT_EXPIRE_IN: z.string().default("1h"),
  REFRESH_TOKEN_SECRET: z.string().default("dev-refresh-secret"),
  REFRESH_TOKEN_EXPIRE_IN: z.string().default("30d"),
  BCRYPT_ROUNDS: z.string().optional().default("10"),
  FRONTEND_URL: z.string().optional().default("http://localhost:19000"),
  // Opcional: sem a chave, o envio de e-mail é pulado (logado), não falha o fluxo.
  RESEND_API_KEY: z.string().optional(),
});

const parsed = envSchema.parse(process.env);

if (parsed.NODE_ENV === "production") {
  if (parsed.JWT_SECRET === "dev-secret" || parsed.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET ausente ou fraco para NODE_ENV=production (mínimo 32 caracteres, sem usar o valor padrão de dev).");
  }
  if (parsed.REFRESH_TOKEN_SECRET === "dev-refresh-secret" || parsed.REFRESH_TOKEN_SECRET.length < 32) {
    throw new Error("REFRESH_TOKEN_SECRET ausente ou fraco para NODE_ENV=production (mínimo 32 caracteres, sem usar o valor padrão de dev).");
  }
}

export const ENV = {
  NODE_ENV: parsed.NODE_ENV,
  PORT: Number(parsed.PORT),
  DATABASE_URL: parsed.DATABASE_URL,
  JWT_SECRET: parsed.JWT_SECRET,
  JWT_EXPIRE_IN: parsed.JWT_EXPIRE_IN,
  REFRESH_TOKEN_SECRET: parsed.REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRE_IN: parsed.REFRESH_TOKEN_EXPIRE_IN,
  BCRYPT_ROUNDS: Number(parsed.BCRYPT_ROUNDS),
  FRONTEND_URL: parsed.FRONTEND_URL,
  RESEND_API_KEY: parsed.RESEND_API_KEY,
};

export default ENV;

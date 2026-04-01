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
  JWT_EXPIRE_IN: z.string().default("7d"),
  BCRYPT_ROUNDS: z.string().optional().default("10"),
  FRONTEND_URL: z.string().optional().default("http://localhost:19000"),
});

const parsed = envSchema.parse(process.env);

export const ENV = {
  NODE_ENV: parsed.NODE_ENV,
  PORT: Number(parsed.PORT),
  DATABASE_URL: parsed.DATABASE_URL,
  JWT_SECRET: parsed.JWT_SECRET,
  JWT_EXPIRE_IN: parsed.JWT_EXPIRE_IN,
  BCRYPT_ROUNDS: Number(parsed.BCRYPT_ROUNDS),
  FRONTEND_URL: parsed.FRONTEND_URL,
};

export default ENV;

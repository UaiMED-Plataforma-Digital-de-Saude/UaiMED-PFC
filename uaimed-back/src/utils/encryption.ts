import crypto from "crypto";
import ENV from "../config/env";
import logger from "./logger";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const PREFIX = "enc:v1:";

/**
 * Campos com busca exata/constraint de unicidade no banco (CPF e CNPJ são
 * @unique no schema, e CPF é buscado por igualdade no vínculo clínica-médico).
 * Usam IV determinístico: mesmo valor sempre gera o mesmo texto cifrado, o
 * que preserva @unique e busca exata sem expor o valor em texto puro.
 */
export const DETERMINISTIC_FIELDS = ["cpf", "cnpj"] as const;

/**
 * Campos só exibidos, nunca filtrados por igualdade — usam IV aleatório
 * (mais seguro: o mesmo valor gera textos cifrados diferentes a cada vez).
 */
export const RANDOM_FIELDS = ["pixKey", "banco", "agencia", "conta"] as const;

function getRootKey(): Buffer {
  return Buffer.from(ENV.ENCRYPTION_KEY, "base64");
}

// Deriva subchaves por finalidade a partir da chave raiz (HMAC como KDF),
// pra não reaproveitar a mesma chave para o AEAD e para o IV determinístico.
function deriveKey(info: string): Buffer {
  return crypto.createHmac("sha256", getRootKey()).update(info).digest();
}

function aeadKey(): Buffer {
  return deriveKey("uaimed:aead:v1");
}

function deterministicIv(plaintext: string): Buffer {
  return crypto.createHmac("sha256", deriveKey("uaimed:deterministic-iv:v1")).update(plaintext).digest().subarray(0, IV_LENGTH);
}

function encryptWithIv(plaintext: string, iv: Buffer): string {
  const cipher = crypto.createCipheriv(ALGORITHM, aeadKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return PREFIX + Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

type Nullable<T> = T | null | undefined;

export function encryptRandom(plaintext: Nullable<string>): Nullable<string> {
  if (plaintext === null || plaintext === undefined) return plaintext;
  return encryptWithIv(plaintext, crypto.randomBytes(IV_LENGTH));
}

export function encryptDeterministic(plaintext: Nullable<string>): Nullable<string> {
  if (plaintext === null || plaintext === undefined) return plaintext;
  return encryptWithIv(plaintext, deterministicIv(plaintext));
}

/**
 * Decripta um valor se (e só se) ele tiver o prefixo de versão do cifrador.
 * Sem isso, qualquer linha ainda em texto puro (ex.: banco não reseedado
 * após habilitar a criptografia) quebraria toda leitura em vez de só não
 * ser decriptada — a trava evita crash e só loga o problema.
 */
export function decryptField(value: Nullable<string>): Nullable<string> {
  if (value === null || value === undefined) return value;
  if (!value.startsWith(PREFIX)) return value;

  try {
    const raw = Buffer.from(value.slice(PREFIX.length), "base64");
    const iv = raw.subarray(0, IV_LENGTH);
    const authTag = raw.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = raw.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
    const decipher = crypto.createDecipheriv(ALGORITHM, aeadKey(), iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch (err) {
    logger.error("Falha ao decriptografar campo sensível", err);
    return value;
  }
}

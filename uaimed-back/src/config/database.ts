import "./env";
import { PrismaClient } from "@prisma/client";
import {
  DETERMINISTIC_FIELDS,
  RANDOM_FIELDS,
  encryptDeterministic,
  encryptRandom,
  decryptField,
} from "../utils/encryption";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const basePrisma =
  globalForPrisma.prisma || new PrismaClient({ log: ["warn", "error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = basePrisma;

// ── Criptografia de campos sensíveis (CPF, CNPJ, dados bancários) ──────────
//
// Duas camadas encadeadas via Prisma Client Extensions, aplicadas só aos
// models `usuario` e `profissional` (únicos com esses campos):
//
// 1. Escreve: criptografa `data`/`create`/`update` antes de ir ao banco, e
//    criptografa os valores de busca em `where` (CPF/CNPJ) pra continuar
//    batendo com o que está armazenado — sem isso, @unique e a busca exata
//    por CPF (vínculo clínica-médico) parariam de funcionar.
// 2. Lê: decripta o resultado de QUALQUER model/operação, recursivamente —
//    precisa ser genérico porque relações aninhadas (ex.: `agendamento.
//    findMany({ include: { profissional: { include: { usuario: true }}}})`)
//    não passam pelos hooks do model `usuario`/`profissional` (esses só
//    disparam em chamadas diretas `prisma.usuario.*`/`prisma.profissional.*`).
//
// Dado existente antes desta mudança está em texto puro — precisa rodar
// `npm run db:seed` de novo depois de habilitar isso (dado de dev é fake).

function encryptDataObject(data: Record<string, any> | null | undefined) {
  if (!data || typeof data !== "object") return data;
  const out: Record<string, any> = { ...data };
  for (const field of DETERMINISTIC_FIELDS) {
    if (field in out) out[field] = encryptDeterministic(out[field]);
  }
  for (const field of RANDOM_FIELDS) {
    if (field in out) out[field] = encryptRandom(out[field]);
  }
  return out;
}

function encryptWhereValue(value: any): any {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return encryptDeterministic(value);
  if (Array.isArray(value)) return value.map((v) => encryptDeterministic(v));
  if (typeof value === "object") {
    const out: Record<string, any> = { ...value };
    if ("equals" in out) out.equals = encryptDeterministic(out.equals);
    if ("not" in out) out.not = encryptWhereValue(out.not);
    if ("in" in out) out.in = out.in.map((v: string) => encryptDeterministic(v));
    if ("notIn" in out) out.notIn = out.notIn.map((v: string) => encryptDeterministic(v));
    return out;
  }
  return value;
}

// Só CPF/CNPJ aparecem em filtro de busca hoje (equality/in), direto ou uma
// relação abaixo via `usuario: { cpf: ... }` — é o shape usado em
// clinicas.controller.ts (vínculo clínica-médico por CPF).
function encryptWhereCriptoFields(where: Record<string, any> | null | undefined): any {
  if (!where || typeof where !== "object") return where;
  const next: Record<string, any> = { ...where };
  for (const field of DETERMINISTIC_FIELDS) {
    if (field in next) next[field] = encryptWhereValue(next[field]);
  }
  if (next.usuario && typeof next.usuario === "object") {
    next.usuario = encryptWhereCriptoFields(next.usuario);
  }
  if (Array.isArray(next.OR)) next.OR = next.OR.map(encryptWhereCriptoFields);
  if (Array.isArray(next.AND)) next.AND = next.AND.map(encryptWhereCriptoFields);
  return next;
}

function encryptArgs(args: Record<string, any> = {}): Record<string, any> {
  const next = { ...args };
  if (next.where) next.where = encryptWhereCriptoFields(next.where);
  if (Array.isArray(next.data)) next.data = next.data.map(encryptDataObject);
  else if (next.data) next.data = encryptDataObject(next.data);
  if (next.create) next.create = encryptDataObject(next.create);
  if (next.update) next.update = encryptDataObject(next.update);
  return next;
}

const ENCRYPTED_FIELD_NAMES = new Set<string>([...DETERMINISTIC_FIELDS, ...RANDOM_FIELDS]);

function deepDecrypt(value: any, seen: WeakSet<object> = new WeakSet()): any {
  if (value === null || value === undefined) return value;
  if (value instanceof Date || Buffer.isBuffer(value)) return value;
  if (Array.isArray(value)) {
    value.forEach((item) => deepDecrypt(item, seen));
    return value;
  }
  if (typeof value === "object") {
    if (seen.has(value)) return value;
    seen.add(value);
    for (const key of Object.keys(value)) {
      const field = (value as Record<string, any>)[key];
      if (ENCRYPTED_FIELD_NAMES.has(key) && typeof field === "string") {
        (value as Record<string, any>)[key] = decryptField(field);
      } else if (field && typeof field === "object") {
        deepDecrypt(field, seen);
      }
    }
  }
  return value;
}

const withFieldEncryption = basePrisma.$extends({
  name: "encrypt-sensitive-fields",
  query: {
    usuario: {
      $allOperations: ({ args, query }) => query(encryptArgs(args as Record<string, any>)),
    },
    profissional: {
      $allOperations: ({ args, query }) => query(encryptArgs(args as Record<string, any>)),
    },
  },
});

const withFieldDecryption = withFieldEncryption.$extends({
  name: "decrypt-sensitive-fields",
  query: {
    $allModels: {
      $allOperations: async ({ args, query }) => deepDecrypt(await query(args)),
    },
  },
});

export const prisma = withFieldDecryption;

export default prisma;

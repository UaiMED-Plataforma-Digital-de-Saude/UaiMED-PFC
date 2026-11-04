import { z } from "zod";

export const cupomSchema = z.object({
  codigo: z.string().trim().min(3, "Código deve ter ao menos 3 caracteres").max(20, "Código deve ter no máximo 20 caracteres"),
  desconto: z.number().int("Desconto deve ser um número inteiro").min(1, "Desconto deve ser de 1 a 100").max(100, "Desconto deve ser de 1 a 100"),
  dataExpiracao: z.coerce.date({ errorMap: () => ({ message: "Data de expiração inválida" }) }),
  usosLimite: z.number().int("Limite de usos deve ser um número inteiro").positive("Limite de usos deve ser positivo").optional().nullable(),
});

export const cupomAtivoSchema = z.object({
  ativo: z.boolean(),
});

export type CupomInput = z.infer<typeof cupomSchema>;
export type CupomAtivoInput = z.infer<typeof cupomAtivoSchema>;

import { z } from "zod";

export const atualizarContaBancariaSchema = z.object({
  pixKey: z.string().trim().optional(),
  banco: z.string().trim().optional(),
  agencia: z.string().trim().optional(),
  conta: z.string().trim().optional(),
  tipoConta: z
    .enum(["corrente", "poupanca"], {
      errorMap: () => ({ message: 'Tipo de conta inválido. Use "corrente" ou "poupanca".' }),
    })
    .optional(),
});

export type AtualizarContaBancariaInput = z.infer<typeof atualizarContaBancariaSchema>;

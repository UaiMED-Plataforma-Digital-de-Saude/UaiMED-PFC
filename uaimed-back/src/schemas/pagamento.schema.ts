import { z } from "zod";

export const validarCupomSchema = z.object({
  codigo: z.string().min(1, "Código do cupom obrigatório"),
});

export const processarPagamentoSchema = z.object({
  agendamentoId: z.string().min(1, "agendamentoId é obrigatório"),
  valor: z.number().positive("valor deve ser um número positivo"),
  metodo: z.string().min(1, "metodo é obrigatório"),
  cupom: z.string().optional(),
  usingPlan: z.boolean().optional(),
  insuranceProvider: z.string().optional(),
  insuranceCoveragePercent: z.number().min(0).max(100).optional(),
});

export type ValidarCupomInput = z.infer<typeof validarCupomSchema>;
export type ProcessarPagamentoInput = z.infer<typeof processarPagamentoSchema>;

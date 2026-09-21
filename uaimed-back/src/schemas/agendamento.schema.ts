import { z } from "zod";

export const criarAgendamentoSchema = z.object({
  medicoId: z.string().min(1, "medicoId é obrigatório"),
  dataHora: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
    message: "dataHora inválida",
  }),
  observacoes: z.string().optional(),
});

export type CriarAgendamentoInput = z.infer<typeof criarAgendamentoSchema>;

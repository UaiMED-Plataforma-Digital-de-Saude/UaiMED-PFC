import { z } from "zod";

export const criarAvaliacaoSchema = z.object({
  profissionalId: z.string().min(1, "profissionalId é obrigatório"),
  nota: z.number().int().min(1, "nota deve ser entre 1 e 5").max(5, "nota deve ser entre 1 e 5"),
  comentario: z.string().optional(),
});

export type CriarAvaliacaoInput = z.infer<typeof criarAvaliacaoSchema>;

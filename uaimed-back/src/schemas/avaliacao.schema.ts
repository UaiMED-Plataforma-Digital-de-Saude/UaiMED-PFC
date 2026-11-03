import { z } from "zod";

const notaDetalhe = z.number().int().min(1, "nota deve ser entre 1 e 5").max(5, "nota deve ser entre 1 e 5");
const respostaSimNaoTalvez = z.enum(["sim", "nao", "talvez"]);

export const criarAvaliacaoSchema = z.object({
  profissionalId: z.string().min(1, "profissionalId é obrigatório"),
  agendamentoId: z.string().min(1).optional(),
  nota: z.number().int().min(1, "nota deve ser entre 1 e 5").max(5, "nota deve ser entre 1 e 5"),
  comentario: z.string().optional(),
  // Detalhamento opcional do formulário completo de avaliação.
  notaAtendimento: notaDetalhe.optional(),
  notaPontualidade: notaDetalhe.optional(),
  notaClinica: notaDetalhe.optional(),
  notaComunicacao: notaDetalhe.optional(),
  voltariaClinica: respostaSimNaoTalvez.optional(),
  recomendaMedico: respostaSimNaoTalvez.optional(),
  melhorias: z.string().optional(),
});

export type CriarAvaliacaoInput = z.infer<typeof criarAvaliacaoSchema>;

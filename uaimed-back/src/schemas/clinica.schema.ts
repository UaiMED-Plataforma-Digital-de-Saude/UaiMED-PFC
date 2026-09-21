import { z } from "zod";

export const vincularMedicoSchema = z.object({
  profissionalId: z.string().trim().min(1, "profissionalId é obrigatório"),
});

export const responderSolicitacaoSchema = z.object({
  acao: z.enum(["aceitar", "recusar"], {
    errorMap: () => ({ message: "A ação deve ser aceitar ou recusar" }),
  }),
});

export type VincularMedicoInput = z.infer<typeof vincularMedicoSchema>;
export type ResponderSolicitacaoInput = z.infer<typeof responderSolicitacaoSchema>;

import { z } from "zod";

export const LIMITE_MENSAGEM = 500;

export const iniciarConversaSchema = z.object({
  profissionalId: z.string().trim().min(1, "profissionalId obrigatório"),
  titulo: z.string().optional(),
});

export const enviarMensagemSchema = z.object({
  texto: z
    .string()
    .trim()
    .min(1, "Mensagem não pode ser vazia")
    .max(LIMITE_MENSAGEM, `A mensagem deve ter no máximo ${LIMITE_MENSAGEM} caracteres`),
});

export type IniciarConversaInput = z.infer<typeof iniciarConversaSchema>;
export type EnviarMensagemInput = z.infer<typeof enviarMensagemSchema>;

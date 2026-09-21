import { z } from "zod";

export const atualizarPerfilSchema = z.object({
  nome: z.string().trim().min(1).optional(),
  telefone: z.string().trim().min(1).optional(),
  endereco: z.string().trim().nullable().optional(),
  cidade: z.string().trim().nullable().optional(),
  estado: z.string().trim().nullable().optional(),
  cep: z.string().trim().nullable().optional(),
});

export const atualizarAvatarSchema = z.object({
  avatar: z.string().refine((v) => v.startsWith("data:image/"), {
    message: "Imagem inválida. Envie no formato base64.",
  }),
});

export const notificationsSchema = z.object({
  email: z.boolean().optional(),
  push: z.boolean().optional(),
});

export type AtualizarPerfilInput = z.infer<typeof atualizarPerfilSchema>;
export type AtualizarAvatarInput = z.infer<typeof atualizarAvatarSchema>;
export type NotificationsInput = z.infer<typeof notificationsSchema>;

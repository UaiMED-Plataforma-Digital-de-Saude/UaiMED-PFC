import { z } from "zod";

export const artigoSchema = z.object({
  titulo: z.string().trim().min(1, "Título é obrigatório"),
  resumo: z.string().trim().nullable().optional(),
  categoria: z.string().trim().min(1, "Categoria é obrigatória"),
  corpo: z.string().trim().min(1, "Corpo é obrigatório"),
  banner: z.string().nullable().optional().refine((v) => !v || v.startsWith("data:image/"), {
    message: "Banner inválido. Envie uma imagem no formato base64.",
  }),
});

export type ArtigoInput = z.infer<typeof artigoSchema>;

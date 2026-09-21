import { z } from "zod";

export const atualizarEnderecoSchema = z.object({
  endereco: z.string().trim().min(1, "Endereço, cidade e estado são obrigatórios"),
  cidade: z.string().trim().min(1, "Endereço, cidade e estado são obrigatórios"),
  estado: z.string().trim().min(1, "Endereço, cidade e estado são obrigatórios"),
  cep: z.string().trim().optional(),
});

export type AtualizarEnderecoInput = z.infer<typeof atualizarEnderecoSchema>;

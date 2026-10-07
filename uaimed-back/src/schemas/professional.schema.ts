import { z } from "zod";

export const atualizarEnderecoSchema = z.object({
  endereco: z.string().trim().min(1, "Endereço, cidade e estado são obrigatórios"),
  cidade: z.string().trim().min(1, "Endereço, cidade e estado são obrigatórios"),
  estado: z.string().trim().min(1, "Endereço, cidade e estado são obrigatórios"),
  cep: z.string().trim().optional(),
});

export type AtualizarEnderecoInput = z.infer<typeof atualizarEnderecoSchema>;

export const atualizarPrecoSchema = z.object({
  precoConsulta: z.number().positive("O preço da consulta deve ser maior que zero"),
});

export type AtualizarPrecoInput = z.infer<typeof atualizarPrecoSchema>;

const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const horarioDiaSchema = z.object({
  diaSemana: z.number().int().min(0).max(6),
  ativo: z.boolean(),
  horaInicio: z.string().regex(HORA_REGEX, "Horário inválido (use HH:mm)"),
  horaFim: z.string().regex(HORA_REGEX, "Horário inválido (use HH:mm)"),
}).refine((d) => !d.ativo || d.horaInicio < d.horaFim, {
  message: "O horário de início deve ser antes do horário de fim",
});

export const disponibilidadeSchema = z.array(horarioDiaSchema).length(7, "Envie os 7 dias da semana");

export type DisponibilidadeInput = z.infer<typeof disponibilidadeSchema>;

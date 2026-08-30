import { z } from "zod";
import { TipoUsuario } from "@prisma/client";

const TIPOS_CADASTRO = [
  TipoUsuario.paciente,
  TipoUsuario.medico,
  TipoUsuario.clinica,
] as const;

export const signupSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  cpf: z.string().min(11),
  telefone: z.string().min(8),
  senha: z.string().min(6),
  tipo: z.enum(TIPOS_CADASTRO).optional(),
  // Campos opcionais para profissionais
  especialidade: z.string().min(2).optional(),
  crm: z.string().min(3).optional(),
  dataFormacao: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
});

// Se for médico, exige especialidade e crm
export const signupSchemaValidated = signupSchema.refine((data) => {
  if (data.tipo === TipoUsuario.medico) {
    return !!(data as any).especialidade && !!(data as any).crm;
  }
  return true;
}, {
  message: 'Especialidade e CRM são obrigatórios para cadastro de profissional',
  path: ['especialidade', 'crm'],
});

export const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;

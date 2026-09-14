import { z } from "zod";
import { TipoUsuario } from "@prisma/client";
import { especialidadeMedicaValida } from "../constants/especialidades";

const TIPOS_CADASTRO = [
  TipoUsuario.paciente,
  TipoUsuario.medico,
  TipoUsuario.clinica,
] as const;

export const signupSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  cpf: z.string().min(11).optional(),
  cnpj: z.string().min(14).optional(),
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

export const signupSchemaValidated = signupSchema.superRefine((data, ctx) => {
  const tipo = data.tipo ?? TipoUsuario.paciente;
  const cpf = data.cpf?.replace(/\D/g, "");
  const cnpj = data.cnpj?.replace(/\D/g, "");

  if (tipo === TipoUsuario.clinica) {
    if (!cnpj) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CNPJ é obrigatório para cadastro de clínica",
        path: ["cnpj"],
      });
    } else if (cnpj.length !== 14) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CNPJ deve possuir 14 dígitos",
        path: ["cnpj"],
      });
    }
  } else if (!cpf) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "CPF é obrigatório para cadastro de paciente ou médico",
      path: ["cpf"],
    });
  } else if (cpf.length !== 11) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "CPF deve possuir 11 dígitos",
      path: ["cpf"],
    });
  }

  if (tipo === TipoUsuario.medico) {
    if (!data.especialidade) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Especialidade é obrigatória para cadastro de médico",
        path: ["especialidade"],
      });
    } else if (!especialidadeMedicaValida(data.especialidade)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecione uma especialidade válida",
        path: ["especialidade"],
      });
    }

    if (!data.crm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CRM é obrigatório para cadastro de médico",
        path: ["crm"],
      });
    }
  }
});

export const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;

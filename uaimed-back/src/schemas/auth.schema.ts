import { z } from "zod";
import { TipoUsuario } from "@prisma/client";
import { especialidadeMedicaValida } from "../constants/especialidades";
import { crmSchema } from './professional.schema';

const TIPOS_CADASTRO = [
  TipoUsuario.paciente,
  TipoUsuario.medico,
  TipoUsuario.clinica,
] as const;

const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
const somenteDigitos = (valor: string) => valor.replace(/\D/g, '');
const textoOpcional = (campo: string, minimo: number, maximo: number) => z.string().trim()
  .max(maximo, `${campo} deve ter no máximo ${maximo} caracteres`)
  .refine((valor) => !valor || valor.length >= minimo, `${campo} deve ter pelo menos ${minimo} caracteres`)
  .optional();

export const signupSchema = z.object({
  nome: z.string().trim().min(2, 'Nome ou razão social deve ter pelo menos 2 caracteres').max(120, 'Nome ou razão social deve ter no máximo 120 caracteres'),
  email: z.string().trim().max(254, 'E-mail deve ter no máximo 254 caracteres').email('Informe um e-mail válido'),
  cpf: z.string().trim().max(14).regex(/^(?:\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/, 'CPF deve conter exatamente 11 dígitos').transform(somenteDigitos).optional(),
  cnpj: z.string().trim().max(18).regex(/^(?:\d{14}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})$/, 'CNPJ deve conter exatamente 14 dígitos').transform(somenteDigitos).optional(),
  telefone: z.string().trim().max(15, 'Telefone com DDD deve conter 10 ou 11 dígitos')
    .regex(/^(?:\d{10,11}|\(\d{2}\) ?\d{4,5}-\d{4})$/, 'Telefone com DDD deve conter 10 ou 11 dígitos')
    .transform(somenteDigitos)
    .refine((valor) => /^[1-9]{2}/.test(valor), 'Informe um DDD válido'),
  senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres').max(72, 'A senha é muito longa')
    .refine((valor) => valor.trim().length > 0, 'A senha não pode conter apenas espaços')
    .refine((valor) => Buffer.byteLength(valor, 'utf8') <= 72, 'A senha é muito longa; reduza o número de caracteres'),
  tipo: z.enum(TIPOS_CADASTRO).optional(),
  // Campos opcionais para profissionais
  especialidade: textoOpcional('Especialidade', 2, 80),
  crm: crmSchema.optional(),
  dataFormacao: z.string().datetime({ offset: true, message: 'Informe uma data de formação válida em formato ISO' }).optional(),
  endereco: textoOpcional('Endereço', 5, 200),
  cidade: textoOpcional('Cidade', 2, 100),
  estado: z.string().trim().toUpperCase().refine((valor) => !valor || UFS.includes(valor), 'Selecione uma UF válida').optional(),
  cep: z.string().trim().max(9).regex(/^(?:\d{8}|\d{5}-\d{3})?$/, 'CEP deve conter exatamente 8 dígitos').transform(somenteDigitos).optional(),
  consentimentoLgpd: z.boolean().refine((v) => v === true, {
    message: "É necessário aceitar a Política de Privacidade (LGPD) para se cadastrar",
  }),
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

import { describe, it, expect } from 'vitest';
import { signupSchema, signinSchema, signupSchemaValidated } from '../../schemas/auth.schema';

describe('Auth schemas — validação Zod', () => {

  // ─── signinSchema ────────────────────────────────────────────────────────────

  describe('signinSchema', () => {
    it('aceita email e password válidos', () => {
      const result = signinSchema.safeParse({ email: 'test@test.com', password: 'senha123' });
      expect(result.success).toBe(true);
    });

    it('rejeita email inválido', () => {
      const result = signinSchema.safeParse({ email: 'nao-é-email', password: 'senha123' });
      expect(result.success).toBe(false);
    });

    it('rejeita password com menos de 6 caracteres', () => {
      const result = signinSchema.safeParse({ email: 'test@test.com', password: '123' });
      expect(result.success).toBe(false);
    });

    it('rejeita quando email está ausente', () => {
      const result = signinSchema.safeParse({ password: 'senha123' });
      expect(result.success).toBe(false);
    });

    it('rejeita quando password está ausente', () => {
      const result = signinSchema.safeParse({ email: 'test@test.com' });
      expect(result.success).toBe(false);
    });
  });

  // ─── signupSchema ────────────────────────────────────────────────────────────

  describe('signupSchema', () => {
    const base = {
      nome: 'João Silva',
      email: 'joao@test.com',
      cpf: '12345678901',
      telefone: '11999999999',
      senha: 'senha123',
      consentimentoLgpd: true,
    };

    it('aceita dados válidos de paciente', () => {
      const result = signupSchema.safeParse({ ...base, tipo: 'paciente' });
      expect(result.success).toBe(true);
    });

    it('aceita sem campo tipo (default implícito)', () => {
      const result = signupSchema.safeParse(base);
      expect(result.success).toBe(true);
    });

    it('aceita tipo medico com campos opcionais', () => {
      const result = signupSchema.safeParse({
        ...base,
        tipo: 'medico',
        especialidade: 'Cardiologia',
        crm: 'CRM-SP-12345',
      });
      expect(result.success).toBe(true);
    });

    it('rejeita tipo inválido', () => {
      const result = signupSchema.safeParse({ ...base, tipo: 'admin' });
      expect(result.success).toBe(false);
    });

    it('rejeita nome com menos de 2 caracteres', () => {
      const result = signupSchema.safeParse({ ...base, nome: 'A' });
      expect(result.success).toBe(false);
    });

    it('rejeita email inválido', () => {
      const result = signupSchema.safeParse({ ...base, email: 'nao-email' });
      expect(result.success).toBe(false);
    });

    it('rejeita CPF com menos de 11 caracteres', () => {
      const result = signupSchema.safeParse({ ...base, cpf: '123' });
      expect(result.success).toBe(false);
    });

    it('rejeita telefone sem DDD e número completos', () => {
      const result = signupSchema.safeParse({ ...base, telefone: '1234' });
      expect(result.success).toBe(false);
    });

    it('rejeita senha com menos de 6 caracteres', () => {
      const result = signupSchema.safeParse({ ...base, senha: '123' });
      expect(result.success).toBe(false);
    });

    it('rejeita cadastro sem aceitar a política de privacidade (LGPD)', () => {
      const result = signupSchema.safeParse({ ...base, consentimentoLgpd: false });
      expect(result.success).toBe(false);
    });

    it('rejeita cadastro quando o campo consentimentoLgpd está ausente', () => {
      const { consentimentoLgpd, ...semConsentimento } = base;
      const result = signupSchema.safeParse(semConsentimento);
      expect(result.success).toBe(false);
    });
  });

  // ─── signupSchemaValidated (.refine para médico) ─────────────────────────────

  describe('signupSchemaValidated — médico precisa de especialidade e CRM', () => {
    const base = {
      nome: 'Dra. Ana',
      email: 'ana@med.com',
      cpf: '98765432101',
      telefone: '11988888888',
      senha: 'senha456',
      tipo: 'medico',
      consentimentoLgpd: true,
    };

    it('rejeita médico sem especialidade e CRM', () => {
      const result = signupSchemaValidated.safeParse(base);
      expect(result.success).toBe(false);
    });

    it('rejeita médico com especialidade mas sem CRM', () => {
      const result = signupSchemaValidated.safeParse({ ...base, especialidade: 'Neurologia' });
      expect(result.success).toBe(false);
    });

    it('aceita médico com especialidade e CRM preenchidos', () => {
      const result = signupSchemaValidated.safeParse({
        ...base,
        especialidade: 'Neurologia',
        crm: 'CRM-RJ-99999',
      });
      expect(result.success).toBe(true);
    });

    it('aceita paciente sem especialidade e CRM', () => {
      const result = signupSchemaValidated.safeParse({
        ...base,
        tipo: 'paciente',
      });
      expect(result.success).toBe(true);
    });

    it('rejeita especialidade digitada fora do catálogo oficial', () => {
      const result = signupSchemaValidated.safeParse({
        ...base,
        especialidade: 'Cardio inventada',
        crm: 'CRM-RJ-99999',
      });
      expect(result.success).toBe(false);
    });

    it('aceita clínica com CNPJ e sem CPF', () => {
      const result = signupSchemaValidated.safeParse({
        nome: 'Clínica Saúde Ltda',
        email: 'contato@clinicasaude.com',
        cnpj: '12345678000199',
        telefone: '31999999999',
        senha: 'senha456',
        tipo: 'clinica',
        consentimentoLgpd: true,
      });
      expect(result.success).toBe(true);
    });

    it('rejeita clínica sem CNPJ', () => {
      const result = signupSchemaValidated.safeParse({
        nome: 'Clínica Saúde Ltda',
        email: 'contato@clinicasaude.com',
        telefone: '31999999999',
        senha: 'senha456',
        tipo: 'clinica',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Cadastro — limites e normalização de campos', () => {
  const paciente = {
    nome: 'Igor Exemplo', email: 'igor@example.com', cpf: '12345678901',
    telefone: '31999999999', senha: 'senha123', tipo: 'paciente', consentimentoLgpd: true,
  };

  it.each(['João Gonçalves', 'José Luís da Conceição', 'Érica D’Ávila', 'Ana-Mária São José', 'Clínica São João & Filhos Ltda.', 'Joa\u0303o Gonc\u0327alves'])('aceita e preserva nome com acentos: %s', (nome) => {
    for (const tipo of ['paciente', 'medico', 'clinica']) {
      const result = signupSchemaValidated.parse({
        ...paciente, nome, tipo,
        ...(tipo === 'clinica' ? { cpf: undefined, cnpj: '12345678000199' } : {}),
        ...(tipo === 'medico' ? { especialidade: 'Cardiologia', crm: '123456-MG' } : {}),
      });
      expect(result.nome).toBe(nome);
    }
  });

  it.each(['3133334444', '31999999999', '(31) 3333-4444', '(31) 99999-9999'])('aceita telefone nacional válido: %s', (telefone) => {
    const result = signupSchemaValidated.safeParse({ ...paciente, telefone });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.telefone).toMatch(/^\d{10,11}$/);
  });

  it.each([
    ['vazio', ''], ['sem DDD', '999999999'], ['12 dígitos', '319999999999'],
    ['gigantesco', '9'.repeat(1000)], ['letras', '31abcdefghi'],
    ['letras junto do número', 'x31999999999'], ['DDD inválido', '00999999999'],
  ])('rejeita telefone %s', (_, telefone) => {
    const result = signupSchemaValidated.safeParse({ ...paciente, telefone });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some((issue) => issue.path[0] === 'telefone')).toBe(true);
  });

  it.each([
    ['nome', '   '], ['nome', 'A'], ['nome', 'A'.repeat(121)],
    ['email', 'sem-arroba.example.com'], ['email', `${'a'.repeat(250)}@example.com`],
    ['cpf', '1234567890'], ['cpf', '123456789012'], ['cpf', 'abc12345678901'],
    ['senha', '12345'], ['senha', ' '.repeat(6)], ['senha', 'a'.repeat(73)],
    ['senha', 'á'.repeat(37)], ['senha', '😀'.repeat(19)],
    ['endereco', 'a'.repeat(201)], ['endereco', 'Rua'], ['cidade', 'A'], ['cidade', 'A'.repeat(101)],
    ['estado', 'ZZ'], ['estado', 'Minas Gerais'], ['cep', '1234567'], ['cep', '123456789'], ['cep', 'abcdefgh'],
    ['dataFormacao', 'data inválida'],
  ])('rejeita %s inválido ou fora do limite', (campo, valor) => {
    const result = signupSchemaValidated.safeParse({ ...paciente, [campo]: valor });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some((issue) => issue.path[0] === campo)).toBe(true);
  });

  it('normaliza máscaras, UF e espaços sem modificar a senha', () => {
    const result = signupSchemaValidated.parse({
      ...paciente, nome: '  Igor Exemplo  ', email: ' igor@example.com ',
      cpf: '123.456.789-01', telefone: '(31) 99999-9999',
      cidade: ' Belo Horizonte ', estado: ' mg ', cep: '30100-000', senha: ' senha123 ',
    });
    expect(result).toMatchObject({ nome: 'Igor Exemplo', email: 'igor@example.com', cpf: '12345678901', telefone: '31999999999', cidade: 'Belo Horizonte', estado: 'MG', cep: '30100000', senha: ' senha123 ' });
  });

  it.each(['a'.repeat(72), 'á'.repeat(36), '😀'.repeat(18)])('aceita senha no limite de armazenamento', (senha) => {
    expect(signupSchemaValidated.safeParse({ ...paciente, senha }).success).toBe(true);
  });

  it.each(['', '   ', 'ABC', 'CRM@123', 'CRM' + '1'.repeat(18)])('rejeita CRM inválido de médico: %s', (crm) => {
    const result = signupSchemaValidated.safeParse({ ...paciente, tipo: 'medico', especialidade: 'Cardiologia', crm });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some((issue) => issue.path[0] === 'crm')).toBe(true);
  });

  it('aceita endereço opcional vazio e CRM normalizado de médico', () => {
    const result = signupSchemaValidated.parse({ ...paciente, tipo: 'medico', especialidade: 'Cardiologia', crm: ' 123456-mg ', endereco: '', cidade: '', estado: '', cep: '' });
    expect(result.crm).toBe('123456-MG');
  });

  it.each(['1234567800019', '123456780001999', 'x12345678000199'])('rejeita CNPJ inválido de clínica: %s', (cnpj) => {
    expect(signupSchemaValidated.safeParse({ ...paciente, tipo: 'clinica', cpf: undefined, cnpj }).success).toBe(false);
  });

  it('aceita clínica com CNPJ formatado e razão social no limite', () => {
    const result = signupSchemaValidated.parse({ ...paciente, tipo: 'clinica', cpf: undefined, cnpj: '12.345.678/0001-99', nome: 'A'.repeat(120) });
    expect(result.cnpj).toBe('12345678000199');
  });
});


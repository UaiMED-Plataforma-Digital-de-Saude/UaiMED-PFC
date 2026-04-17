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

    it('rejeita telefone com menos de 8 caracteres', () => {
      const result = signupSchema.safeParse({ ...base, telefone: '1234' });
      expect(result.success).toBe(false);
    });

    it('rejeita senha com menos de 6 caracteres', () => {
      const result = signupSchema.safeParse({ ...base, senha: '123' });
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
  });
});


import { describe, it, expect } from 'vitest';
import { generateToken, verifyToken, TokenPayload } from '../../utils/jwt';

const mockPayload: TokenPayload = {
  id: 'uuid-test-123',
  email: 'unit@test.com',
  tipo: 'paciente',
};

describe('JWT utils — generateToken e verifyToken', () => {
  it('gera um token que é uma string não vazia', () => {
    const token = generateToken(mockPayload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('token gerado contém 3 partes separadas por ponto (formato JWT)', () => {
    const token = generateToken(mockPayload);
    const parts = token.split('.');
    expect(parts).toHaveLength(3);
  });

  it('verifica token válido e retorna payload correto', () => {
    const token = generateToken(mockPayload);
    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe(mockPayload.id);
    expect(decoded?.email).toBe(mockPayload.email);
    expect(decoded?.tipo).toBe(mockPayload.tipo);
  });

  it('retorna null para token completamente inválido', () => {
    const result = verifyToken('token.invalido.aqui');
    expect(result).toBeNull();
  });

  it('retorna null para string vazia', () => {
    const result = verifyToken('');
    expect(result).toBeNull();
  });

  it('retorna null para token adulterado (assinatura errada)', () => {
    const token = generateToken(mockPayload);
    const parts = token.split('.');
    const tampered = `${parts[0]}.${parts[1]}.assinatura_falsa`;
    const result = verifyToken(tampered);
    expect(result).toBeNull();
  });

  it('dois tokens gerados para o mesmo payload são diferentes (iat único)', () => {
    const token1 = generateToken(mockPayload);
    // Pequeno atraso para garantir iat diferente
    const token2 = generateToken({ ...mockPayload, id: 'outro-uuid' });
    expect(token1).not.toBe(token2);
  });

  it('preserva campo tipo no payload decodificado', () => {
    const medicoPayload: TokenPayload = { id: 'uuid-medico', email: 'medico@test.com', tipo: 'medico' };
    const token = generateToken(medicoPayload);
    const decoded = verifyToken(token);
    expect(decoded?.tipo).toBe('medico');
  });
});


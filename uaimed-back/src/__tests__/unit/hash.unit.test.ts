import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '../../utils/hash';

describe('Hash utils — hashPassword e comparePassword', () => {
  it('gera hash diferente da senha original', async () => {
    const senha = 'minhaSenha123';
    const hash = await hashPassword(senha);
    expect(hash).not.toBe(senha);
  });

  it('hash gerado é uma string não vazia', async () => {
    const hash = await hashPassword('qualquersenha');
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('hash começa com prefixo bcrypt válido ($2a$ ou $2b$)', async () => {
    const hash = await hashPassword('senhaqualquer');
    const isBcrypt = hash.startsWith('$2a$') || hash.startsWith('$2b$');
    expect(isBcrypt).toBe(true);
  });

  it('dois hashes da mesma senha são diferentes (salt aleatório)', async () => {
    const senha = 'mesmasenha';
    const hash1 = await hashPassword(senha);
    const hash2 = await hashPassword(senha);
    expect(hash1).not.toBe(hash2);
  });

  it('comparePassword retorna true para senha correta', async () => {
    const senha = 'senhaCorreta456';
    const hash = await hashPassword(senha);
    const resultado = await comparePassword(senha, hash);
    expect(resultado).toBe(true);
  });

  it('comparePassword retorna false para senha errada', async () => {
    const hash = await hashPassword('senhaOriginal');
    const resultado = await comparePassword('senhaErrada', hash);
    expect(resultado).toBe(false);
  });

  it('comparePassword retorna false para string vazia', async () => {
    const hash = await hashPassword('alguma_senha');
    const resultado = await comparePassword('', hash);
    expect(resultado).toBe(false);
  });

  it('comparePassword retorna false para hash inválido', async () => {
    const resultado = await comparePassword('senha123', 'hash_invalido');
    expect(resultado).toBe(false);
  });
});

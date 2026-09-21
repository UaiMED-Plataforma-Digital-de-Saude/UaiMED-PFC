import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

describe('Conta bancária — atualizar', () => {
  let clinica: any;
  let token: string;

  beforeAll(async () => {
    const unique = uuidv4();
    const hash = await bcrypt.hash('pass123', 8);

    clinica = await prisma.usuario.create({
      data: {
        nome: 'Clínica Conta Teste',
        email: `clinicaconta-${unique}@example.com`,
        cpf: `cc${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11911111111',
        senha: hash,
        tipo: 'clinica',
      },
    });
    token = generateToken({ id: clinica.id, email: clinica.email, tipo: clinica.tipo });
  });

  afterAll(async () => {
    await prisma.usuario.deleteMany({ where: { id: clinica.id } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('atualiza dados bancários com dados válidos', async () => {
    const res = await request(app)
      .put('/api/conta-bancaria')
      .set('Authorization', `Bearer ${token}`)
      .send({ pixKey: 'chave@pix.com', banco: '001', agencia: '1234', conta: '56789', tipoConta: 'corrente' });
    expect(res.status).toBe(200);
  });

  it('rejeita tipoConta inválido', async () => {
    const res = await request(app)
      .put('/api/conta-bancaria')
      .set('Authorization', `Bearer ${token}`)
      .send({ tipoConta: 'invalido' });
    expect(res.status).toBe(400);
  });

  it('rejeita atualização sem autenticação', async () => {
    const res = await request(app)
      .put('/api/conta-bancaria')
      .send({ tipoConta: 'corrente' });
    expect(res.status).toBe(401);
  });
});

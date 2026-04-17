import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import { afterAll, describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

describe('Auth — signup e signin', () => {
  const unique = uuidv4();
  const email = `signup-${unique}@example.com`;
  const senha = 'senha123';
  const cpf = unique.replace(/-/g, '').slice(0, 11);

  afterAll(async () => {
    await prisma.usuario.deleteMany({ where: { email } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('cria um usuário com dados válidos', async () => {
    const res = await request(app).post('/api/usuarios').send({
      nome: 'Novo Usuário',
      email,
      cpf,
      telefone: '11999999999',
      senha,
      tipo: 'paciente',
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(email);
  });

  it('rejeita cadastro com e-mail duplicado', async () => {
    const res = await request(app).post('/api/usuarios').send({
      nome: 'Duplicado',
      email,
      cpf: `dup${unique.replace(/-/g, '').slice(0, 8)}`,
      telefone: '11999999999',
      senha,
      tipo: 'paciente',
    });
    expect(res.status).toBe(409);
  });

  it('faz login com credenciais corretas', async () => {
    const res = await request(app).post('/api/sessions').send({ email, password: senha });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('rejeita login com senha errada', async () => {
    const res = await request(app).post('/api/sessions').send({ email, password: 'senhaerrada' });
    expect(res.status).toBe(401);
  });

  it('rejeita login de usuário inexistente', async () => {
    const res = await request(app)
      .post('/api/sessions')
      .send({ email: 'inexistente@naoexiste.com', password: '123456' });
    expect(res.status).toBe(401);
  });
});


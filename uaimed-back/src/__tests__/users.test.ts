import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

describe('Users — atualizar perfil e avatar', () => {
  let user: any;
  let token: string;

  beforeAll(async () => {
    const unique = uuidv4();
    const hash = await bcrypt.hash('pass123', 8);

    user = await prisma.usuario.create({
      data: {
        nome: 'Usuário Perfil Teste',
        email: `perfil-${unique}@example.com`,
        cpf: `up${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11900000000',
        senha: hash,
        tipo: 'paciente',
      },
    });
    token = generateToken({ id: user.id, email: user.email, tipo: user.tipo });
  });

  afterAll(async () => {
    await prisma.usuario.deleteMany({ where: { id: user.id } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('atualiza nome e telefone com dados válidos', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Novo Nome', telefone: '11999998888' });
    expect(res.status).toBe(200);
    expect(res.body.user.nome).toBe('Novo Nome');
  });

  it('rejeita atualização sem autenticação', async () => {
    const res = await request(app).put('/api/users/me').send({ nome: 'X' });
    expect(res.status).toBe(401);
  });

  it('atualiza avatar com base64 válido', async () => {
    const res = await request(app)
      .put('/api/users/me/avatar')
      .set('Authorization', `Bearer ${token}`)
      .send({ avatar: 'data:image/png;base64,aGVsbG8=' });
    expect(res.status).toBe(200);
    expect(res.body.avatar).toContain('data:image/png');
  });

  it('rejeita avatar em formato inválido', async () => {
    const res = await request(app)
      .put('/api/users/me/avatar')
      .set('Authorization', `Bearer ${token}`)
      .send({ avatar: 'https://exemplo.com/foto.png' });
    expect(res.status).toBe(400);
  });
});

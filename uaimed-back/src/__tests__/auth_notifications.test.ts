
import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

describe('Auth / Notifications endpoints', () => {
  let user: any;
  let token: string;

  beforeAll(async () => {
    const unique = uuidv4();
    const hash = await bcrypt.hash('oldpass', 8);
    user = await prisma.usuario.create({ data: { nome: 'Auth Test', email: `authtest-${unique}@example.com`, cpf: `999${unique}`, telefone: '90000000', senha: hash, tipo: 'paciente' } });
    token = generateToken({ id: user.id, email: user.email, tipo: user.tipo });
  });

  afterAll(async () => {
    await prisma.contato.deleteMany({ where: { usuarioId: user.id } }).catch(() => {});
    await prisma.usuario.deleteMany({ where: { email: { contains: 'authtest-' } } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('changes password with valid old password', async () => {
    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ oldPassword: 'oldpass', newPassword: 'newpass123' })
      .expect(200);

    expect(res.body).toHaveProperty('message');

    // Verify in DB that password changed
    const updated = await prisma.usuario.findUnique({ where: { id: user.id } });
    const match = await bcrypt.compare('newpass123', updated!.senha);
    expect(match).toBe(true);
  });

  it('saves notification preferences', async () => {
    const res = await request(app)
      .post('/api/users/me/notifications')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: true, push: false })
      .expect(200);

    expect(res.body).toHaveProperty('message');
    expect(res.body.data).toEqual({ email: true, push: false });
  });
});

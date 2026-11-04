import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Usuario } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import app from '../app';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import { ARTICLE_ADMIN_EMAIL } from '../constants/articleAdmin';

describe('Cupons — administração', () => {
  let admin: Usuario;
  let adminCriado = false;
  let adminToken: string;
  let paciente: Usuario;
  let pacienteToken: string;
  const cupomIds: string[] = [];
  const unique = uuid().slice(0, 8);

  beforeAll(async () => {
    const existente = await prisma.usuario.findUnique({ where: { email: ARTICLE_ADMIN_EMAIL } });
    adminCriado = !existente;
    admin = existente ?? await prisma.usuario.create({
      data: { nome: 'Admin Cupons', email: ARTICLE_ADMIN_EMAIL, tipo: 'clinica', senha: 'fixture', telefone: '11999999999' },
    });
    adminToken = generateToken({ id: admin.id, email: admin.email, tipo: admin.tipo });

    paciente = await prisma.usuario.create({
      data: { nome: 'Paciente Cupons', email: `paciente-cupons-${unique}@example.com`, telefone: '11988888888', senha: 'fixture', tipo: 'paciente', cpf: `cp${unique}00000` },
    });
    pacienteToken = generateToken({ id: paciente.id, email: paciente.email, tipo: paciente.tipo });
  });

  afterAll(async () => {
    if (cupomIds.length) await prisma.cupom.deleteMany({ where: { id: { in: cupomIds } } }).catch(() => {});
    if (paciente?.id) await prisma.usuario.deleteMany({ where: { id: paciente.id } }).catch(() => {});
    if (adminCriado && admin) await prisma.usuario.delete({ where: { id: admin.id } }).catch(() => {});
    await prisma.$disconnect();
  });

  const payloadValido = (sufixo: string) => ({
    codigo: `TESTE${unique}${sufixo}`.toUpperCase(),
    desconto: 15,
    dataExpiracao: new Date(Date.now() + 86400000 * 30).toISOString(),
    usosLimite: 100,
  });

  it('rejeita acesso sem autenticação', async () => {
    const res = await request(app).get('/api/admin/cupons');
    expect(res.status).toBe(401);
  });

  it('rejeita acesso de usuário autenticado que não é admin', async () => {
    const res = await request(app).get('/api/admin/cupons').set('Authorization', `Bearer ${pacienteToken}`);
    expect(res.status).toBe(403);
  });

  it('cria cupom com dados válidos e normaliza o código para maiúsculo', async () => {
    const res = await request(app)
      .post('/api/admin/cupons')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...payloadValido('A'), codigo: payloadValido('A').codigo.toLowerCase() });

    expect(res.status).toBe(201);
    expect(res.body.codigo).toBe(payloadValido('A').codigo);
    expect(res.body.ativo).toBe(true);
    expect(res.body.usosAtuais).toBe(0);
    cupomIds.push(res.body.id);
  });

  it('rejeita cupom com código duplicado', async () => {
    const payload = payloadValido('B');
    const primeiro = await request(app).post('/api/admin/cupons').set('Authorization', `Bearer ${adminToken}`).send(payload);
    expect(primeiro.status).toBe(201);
    cupomIds.push(primeiro.body.id);

    const duplicado = await request(app).post('/api/admin/cupons').set('Authorization', `Bearer ${adminToken}`).send(payload);
    expect(duplicado.status).toBe(409);
  });

  it('rejeita payload inválido (desconto fora de 1-100)', async () => {
    const res = await request(app)
      .post('/api/admin/cupons')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...payloadValido('C'), desconto: 150 });
    expect(res.status).toBe(400);
  });

  it('rejeita payload inválido (data de expiração inválida)', async () => {
    const res = await request(app)
      .post('/api/admin/cupons')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...payloadValido('D'), dataExpiracao: 'não-é-uma-data' });
    expect(res.status).toBe(400);
  });

  it('lista cupons incluindo o criado, ordenados do mais recente para o mais antigo', async () => {
    const criado = await request(app).post('/api/admin/cupons').set('Authorization', `Bearer ${adminToken}`).send(payloadValido('E'));
    expect(criado.status).toBe(201);
    cupomIds.push(criado.body.id);

    const res = await request(app).get('/api/admin/cupons').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body[0].id).toBe(criado.body.id);
    expect(res.body.map((c: { id: string }) => c.id)).toEqual(expect.arrayContaining([criado.body.id]));
  });

  it('desativa e reativa um cupom existente', async () => {
    const criado = await request(app).post('/api/admin/cupons').set('Authorization', `Bearer ${adminToken}`).send(payloadValido('F'));
    expect(criado.status).toBe(201);
    cupomIds.push(criado.body.id);

    const desativado = await request(app)
      .put(`/api/admin/cupons/${criado.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ativo: false });
    expect(desativado.status).toBe(200);
    expect(desativado.body.ativo).toBe(false);

    const reativado = await request(app)
      .put(`/api/admin/cupons/${criado.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ativo: true });
    expect(reativado.status).toBe(200);
    expect(reativado.body.ativo).toBe(true);
  });

  it('retorna 404 ao atualizar cupom inexistente', async () => {
    const res = await request(app)
      .put('/api/admin/cupons/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ativo: false });
    expect(res.status).toBe(404);
  });
});

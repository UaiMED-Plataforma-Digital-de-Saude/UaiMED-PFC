import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';
import { afterAll, describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

describe('Auth — signup e signin', () => {
  const unique = uuidv4();
  const email = `signup-${unique}@example.com`;
  const senha = 'senha123';
  const cpf = unique.replace(/\D/g, '').padEnd(11, '0').slice(0, 11);
  const cpfDuplicado = uuidv4().replace(/\D/g, '').padEnd(11, '0').slice(0, 11);

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
      consentimentoLgpd: true,
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
      cpf: cpfDuplicado,
      telefone: '11999999999',
      senha,
      tipo: 'paciente',
      consentimentoLgpd: true,
    });
    expect(res.status).toBe(409);
  });

  it('rejeita cadastro sem aceitar a política de privacidade (LGPD)', async () => {
    const res = await request(app).post('/api/usuarios').send({
      nome: 'Sem Consentimento',
      email: `sem-consentimento-${unique}@example.com`,
      cpf: uuidv4().replace(/\D/g, '').padEnd(11, '0').slice(0, 11),
      telefone: '11999999999',
      senha,
      tipo: 'paciente',
      consentimentoLgpd: false,
    });
    expect(res.status).toBe(400);
  });

  it('faz login com credenciais corretas', async () => {
    const res = await request(app).post('/api/sessions').send({ email, password: senha });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    // Consentiu no cadastro com a versão vigente da política — não precisa reconsentir.
    expect(res.body.user.precisaConsentimentoLgpd).toBe(false);
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

describe('Reconsentimento LGPD — usuários criados antes do fluxo de consentimento', () => {
  const unique = uuidv4();
  const email = `legado-${unique}@example.com`;
  const senha = 'senha123';
  let legadoId: string;

  afterAll(async () => {
    await prisma.logAuditoria.deleteMany({ where: { pacienteId: legadoId } }).catch(() => {});
    await prisma.usuario.deleteMany({ where: { email } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('login de usuário sem consentimentoLgpd retorna precisaConsentimentoLgpd=true e ainda libera o token', async () => {
    const hash = await bcrypt.hash(senha, 4);
    const legado = await prisma.usuario.create({
      data: {
        nome: 'Usuário Legado',
        email,
        cpf: unique.replace(/\D/g, '').padEnd(11, '1').slice(0, 11),
        telefone: '11999999999',
        senha: hash,
        tipo: 'paciente',
        // consentimentoLgpd fica no default (false) — simula conta criada
        // antes da migração que adicionou o fluxo de consentimento.
      },
    });
    legadoId = legado.id;

    const res = await request(app).post('/api/sessions').send({ email, password: senha });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token'); // login não fica bloqueado
    expect(res.body.user.precisaConsentimentoLgpd).toBe(true);
  });

  it('POST /users/me/consentimento-lgpd registra o aceite e audita a operação', async () => {
    const login = await request(app).post('/api/sessions').send({ email, password: senha });
    const token = login.body.token;

    const res = await request(app)
      .post('/api/users/me/consentimento-lgpd')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.precisaConsentimentoLgpd).toBe(false);

    const usuario = await prisma.usuario.findUnique({ where: { id: legadoId } });
    expect(usuario?.consentimentoLgpd).toBe(true);

    const log = await prisma.logAuditoria.findFirst({ where: { acao: 'REGISTRAR_CONSENTIMENTO_LGPD', pacienteId: legadoId } });
    expect(log).not.toBeNull();

    const loginDepois = await request(app).post('/api/sessions').send({ email, password: senha });
    expect(loginDepois.body.user.precisaConsentimentoLgpd).toBe(false);
  });
});


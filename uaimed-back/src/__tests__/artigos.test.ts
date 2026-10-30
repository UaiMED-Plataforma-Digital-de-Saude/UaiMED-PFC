import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { TipoUsuario, Usuario } from '@prisma/client';
import { ARTICLE_ADMIN_EMAIL } from '../constants/articleAdmin';

describe('Artigos — administração exclusiva e leitura pública', () => {
  let admin: Usuario;
  let adminCriado = false;
  let token: string;
  let artigoLegadoId: string;
  const usuarios: Usuario[] = [];
  const artigosCriados: string[] = [];
  const payload = { titulo: 'Título do artigo', categoria: 'saude', corpo: 'Corpo do artigo de teste.' };
  const tokenDe = (usuario: Usuario) => generateToken({ id: usuario.id, email: usuario.email, tipo: usuario.tipo });

  beforeAll(async () => {
    const hash = await bcrypt.hash('pass123', 8);
    const existente = await prisma.usuario.findUnique({ where: { email: ARTICLE_ADMIN_EMAIL } });
    adminCriado = !existente;
    admin = existente ?? await prisma.usuario.create({
      data: { nome: 'Admin Artigos Teste', email: ARTICLE_ADMIN_EMAIL, telefone: '11922222222', senha: hash, tipo: TipoUsuario.clinica },
    });
    token = tokenDe(admin);
    for (const tipo of Object.values(TipoUsuario)) {
      usuarios.push(await prisma.usuario.create({
        data: { nome: `Leitor ${tipo}`, email: `artigos-${tipo}-${uuidv4()}@example.com`, telefone: '11922222222', senha: hash, tipo },
      }));
    }
    // Ser autor de um artigo antigo não concede mais permissão de escrita.
    const legado = await prisma.artigo.create({ data: { ...payload, autorId: usuarios.find(u => u.tipo === TipoUsuario.medico)!.id } });
    artigoLegadoId = legado.id;
    artigosCriados.push(legado.id);
  });

  afterAll(async () => {
    await prisma.artigo.deleteMany({ where: { id: { in: artigosCriados } } });
    await prisma.usuario.deleteMany({ where: { id: { in: usuarios.map(u => u.id) } } });
    if (adminCriado && admin) await prisma.usuario.delete({ where: { id: admin.id } });
    await prisma.$disconnect();
  });

  it('permite ao admin cadastrar artigo e define a autoria pela sessão', async () => {
    const res = await request(app).post('/api/artigos').set('Authorization', `Bearer ${token}`).send({ ...payload, autorId: usuarios[0].id });
    if (res.body.id) artigosCriados.push(res.body.id);
    expect(res.status).toBe(201);
    expect(res.body.autorId).toBe(admin.id);
    expect(res.body.categoria).toBe('SAUDE');
  });

  it('permite ao admin editar artigos existentes de outros autores', async () => {
    const res = await request(app).put(`/api/artigos/${artigoLegadoId}`).set('Authorization', `Bearer ${token}`).send({ ...payload, titulo: 'Título atualizado' });
    expect(res.status).toBe(200);
    expect(res.body.titulo).toBe('Título atualizado');
    expect(res.body.autorId).toBe(usuarios.find(u => u.tipo === TipoUsuario.medico)!.id);
  });

  it('permite ao admin acessar o painel de artigos', async () => {
    const res = await request(app).get('/api/admin/artigos').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.some((artigo: { id: string }) => artigo.id === artigoLegadoId)).toBe(true);
  });

  it.each(['paciente', 'medico', 'clinica', 'admin'] as const)('bloqueia escrita e painel para outra conta do tipo %s', async (tipo) => {
    const authorization = `Bearer ${tokenDe(usuarios.find(u => u.tipo === tipo)!)}`;
    const criar = await request(app).post('/api/artigos').set('Authorization', authorization).send(payload);
    const editar = await request(app).put(`/api/artigos/${artigoLegadoId}`).set('Authorization', authorization).send(payload);
    const painel = await request(app).get('/api/admin/artigos').set('Authorization', authorization);
    expect(criar.status).toBe(403);
    expect(editar.status).toBe(403);
    expect(painel.status).toBe(403);
  });

  it('confere o usuário no banco mesmo quando o token declara o e-mail do admin', async () => {
    const tokenDesatualizado = generateToken({ id: usuarios[0].id, email: ARTICLE_ADMIN_EMAIL, tipo: TipoUsuario.admin });
    const res = await request(app).post('/api/artigos').set('Authorization', `Bearer ${tokenDesatualizado}`).send(payload);
    expect(res.status).toBe(403);
  });

  it('bloqueia uma conta administrativa inativa mesmo com token válido', async () => {
    await prisma.usuario.update({ where: { id: admin.id }, data: { ativo: false } });
    try {
      const criar = await request(app).post('/api/artigos').set('Authorization', `Bearer ${token}`).send(payload);
      const editar = await request(app).put(`/api/artigos/${artigoLegadoId}`).set('Authorization', `Bearer ${token}`).send(payload);
      const painel = await request(app).get('/api/admin/artigos').set('Authorization', `Bearer ${token}`);
      expect(criar.status).toBe(403);
      expect(editar.status).toBe(403);
      expect(painel.status).toBe(403);
    } finally {
      await prisma.usuario.update({ where: { id: admin.id }, data: { ativo: admin.ativo } });
    }
  });

  it('bloqueia tokens de contas que não existem mais', async () => {
    const tokenRemovido = generateToken({ id: uuidv4(), email: ARTICLE_ADMIN_EMAIL, tipo: TipoUsuario.admin });
    const res = await request(app).get('/api/admin/artigos').set('Authorization', `Bearer ${tokenRemovido}`);
    expect(res.status).toBe(403);
  });

  it('mantém listagem e detalhes disponíveis sem autenticação', async () => {
    const lista = await request(app).get('/api/artigos');
    const detalhe = await request(app).get(`/api/artigos/${artigoLegadoId}`);
    expect(lista.status).toBe(200);
    expect(detalhe.status).toBe(200);
    expect(detalhe.body.id).toBe(artigoLegadoId);
  });

  it('mantém leitura para usuários comuns autenticados', async () => {
    const authorization = `Bearer ${tokenDe(usuarios[0])}`;
    expect((await request(app).get('/api/artigos').set('Authorization', authorization)).status).toBe(200);
    expect((await request(app).get(`/api/artigos/${artigoLegadoId}`).set('Authorization', authorization)).status).toBe(200);
  });

  it('rejeita criação e edição com campos obrigatórios vazios', async () => {
    const invalid = { titulo: '', categoria: '', corpo: '' };
    const criar = await request(app).post('/api/artigos').set('Authorization', `Bearer ${token}`).send(invalid);
    const editar = await request(app).put(`/api/artigos/${artigoLegadoId}`).set('Authorization', `Bearer ${token}`).send(invalid);
    expect(criar.status).toBe(400);
    expect(editar.status).toBe(400);
  });

  it('rejeita banner em formato inválido', async () => {
    const res = await request(app).post('/api/artigos').set('Authorization', `Bearer ${token}`).send({ ...payload, banner: 'https://exemplo.com/imagem.png' });
    expect(res.status).toBe(400);
  });

  it('rejeita escrita e acesso ao painel sem autenticação', async () => {
    expect((await request(app).post('/api/artigos').send(payload)).status).toBe(401);
    expect((await request(app).put(`/api/artigos/${artigoLegadoId}`).send(payload)).status).toBe(401);
    expect((await request(app).get('/api/admin/artigos')).status).toBe(401);
  });

  it.each([ARTICLE_ADMIN_EMAIL, 'ADMIN@UAIMED.COM'])('reserva %s contra cadastro público', async (email) => {
    const res = await request(app).post('/api/usuarios').send({ nome: 'Tentativa Admin', email, cpf: '98765432100', telefone: '11922222222', senha: 'pass123', consentimentoLgpd: true });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Este e-mail é reservado à administração');
  });
});

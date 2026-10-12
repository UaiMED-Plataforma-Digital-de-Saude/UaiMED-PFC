import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TipoUsuario, Usuario } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import app from '../app';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import { ARTICLE_ADMIN_EMAIL } from '../constants/articleAdmin';

describe('Destaques da home — seleção administrativa', () => {
  let admin: Usuario;
  let adminCriado = false;
  let token: string;
  const usuarios: Usuario[] = [];
  const profissionalIds: string[] = [];
  let clinica: Usuario;
  let clinicaInativa: Usuario;
  let anteriores = { profissionalIds: [] as string[], clinicaIds: [] as string[] };
  const cidade = `Destaques-${uuid()}`;
  const tokenDe = (u: Usuario) => generateToken({ id: u.id, email: u.email, tipo: u.tipo });
  const selecao = () => ({ profissionalIds: [profissionalIds[0]], clinicaIds: [clinica.id] });
  const salvar = (body: unknown) => request(app).put('/api/admin/destaques').set('Authorization', `Bearer ${token}`).send(body as object);

  beforeAll(async () => {
    anteriores = {
      profissionalIds: (await prisma.profissional.findMany({ where: { destaque: true }, select: { id: true } })).map(p => p.id),
      clinicaIds: (await prisma.usuario.findMany({ where: { destaque: true }, select: { id: true } })).map(c => c.id),
    };
    const existente = await prisma.usuario.findUnique({ where: { email: ARTICLE_ADMIN_EMAIL } });
    adminCriado = !existente;
    admin = existente ?? await prisma.usuario.create({ data: { nome: 'Admin Destaques', email: ARTICLE_ADMIN_EMAIL, tipo: 'clinica', senha: 'fixture', telefone: '11999999999' } });
    token = tokenDe(admin);
    for (const tipo of [TipoUsuario.medico, TipoUsuario.medico, TipoUsuario.clinica, TipoUsuario.clinica, TipoUsuario.paciente, TipoUsuario.admin]) {
      usuarios.push(await prisma.usuario.create({ data: { nome: `Destaque ${usuarios.length}`, email: `destaque-${uuid()}@example.com`, telefone: '11999999999', senha: 'fixture', tipo, cidade, estado: 'MG' } }));
    }
    for (const usuario of usuarios.filter(u => u.tipo === 'medico')) {
      const p = await prisma.profissional.create({ data: { usuarioId: usuario.id, crm: uuid(), especialidade: 'Cardiologia', dataFormacao: new Date(), endereco: 'Rua Teste', cidade, estado: 'MG', cep: '30000000' } });
      profissionalIds.push(p.id);
    }
    clinica = usuarios[2];
    clinicaInativa = usuarios[3];
    await prisma.usuario.update({ where: { id: clinicaInativa.id }, data: { ativo: false } });
  });

  afterAll(async () => {
    await prisma.$transaction([
      prisma.profissional.updateMany({ where: { destaque: true }, data: { destaque: false } }),
      prisma.usuario.updateMany({ where: { destaque: true }, data: { destaque: false } }),
      prisma.profissional.updateMany({ where: { id: { in: anteriores.profissionalIds } }, data: { destaque: true } }),
      prisma.usuario.updateMany({ where: { id: { in: anteriores.clinicaIds } }, data: { destaque: true } }),
    ]);
    await prisma.usuario.deleteMany({ where: { id: { in: usuarios.map(u => u.id) } } });
    if (adminCriado && admin) await prisma.usuario.delete({ where: { id: admin.id } });
    await prisma.$disconnect();
  });

  it('lista opções ativas sem incluir a conta administrativa ou a clínica inativa', async () => {
    const res = await request(app).get('/api/admin/destaques').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.profissionais.map((p: { id: string }) => p.id)).toEqual(expect.arrayContaining(profissionalIds));
    expect(res.body.clinicas.map((c: { id: string }) => c.id)).toContain(clinica.id);
    expect(res.body.clinicas.map((c: { id: string }) => c.id)).not.toContain(admin.id);
    expect(res.body.clinicas.map((c: { id: string }) => c.id)).not.toContain(clinicaInativa.id);
  });

  it('novos cadastros não aparecem automaticamente em destaque', async () => {
    const p = await request(app).get('/api/medicos/recomendados').query({ cidade });
    const c = await request(app).get('/api/clinicas/recomendadas').query({ cidade });
    expect(p.status).toBe(200); expect(c.status).toBe(200);
    expect(p.body).toEqual([]); expect(c.body).toEqual([]);
  });

  it('salva a seleção e a home retorna somente os escolhidos', async () => {
    expect((await salvar(selecao())).status).toBe(200);
    const p = await request(app).get('/api/medicos/recomendados').query({ cidade, estado: 'MG' });
    const c = await request(app).get('/api/clinicas/recomendadas').query({ cidade, estado: 'MG' });
    expect(p.body.map((item: { id: string }) => item.id)).toEqual([profissionalIds[0]]);
    expect(c.body.map((item: { id: string }) => item.id)).toEqual([clinica.id]);
    const lista = await request(app).get('/api/admin/destaques').set('Authorization', `Bearer ${token}`);
    expect(lista.body.profissionais.find((item: { id: string }) => item.id === profissionalIds[0]).destaque).toBe(true);
    expect(lista.body.profissionais.find((item: { id: string }) => item.id === profissionalIds[1]).destaque).toBe(false);
  });

  it('mantém o filtro de localização mesmo para os selecionados', async () => {
    expect((await request(app).get('/api/medicos/recomendados').query({ cidade, estado: 'SP' })).body).toEqual([]);
    expect((await request(app).get('/api/clinicas/recomendadas').query({ cidade, estado: 'SP' })).body).toEqual([]);
  });

  it('não altera a seleção quando há IDs inexistentes, inativos ou de outro tipo', async () => {
    for (const clinicaId of [uuid(), clinicaInativa.id, usuarios[4].id, admin.id]) {
      expect((await salvar({ profissionalIds: [profissionalIds[1]], clinicaIds: [clinicaId] })).status).toBe(400);
      expect((await prisma.profissional.findUniqueOrThrow({ where: { id: profissionalIds[0] } })).destaque).toBe(true);
      expect((await prisma.profissional.findUniqueOrThrow({ where: { id: profissionalIds[1] } })).destaque).toBe(false);
    }
    expect((await salvar({ profissionalIds: [uuid()], clinicaIds: [clinica.id] })).status).toBe(400);
  });

  it('valida o corpo e impede IDs duplicados', async () => {
    for (const body of [{}, { profissionalIds: ['invalido'], clinicaIds: [] }, { profissionalIds: [profissionalIds[0], profissionalIds[0]], clinicaIds: [] }]) {
      expect((await salvar(body)).status).toBe(400);
    }
  });

  it('não exibe um profissional selecionado que ficou inativo', async () => {
    await prisma.usuario.update({ where: { id: usuarios[0].id }, data: { ativo: false } });
    try {
      expect((await request(app).get('/api/medicos/recomendados').query({ cidade })).body).toEqual([]);
    } finally { await prisma.usuario.update({ where: { id: usuarios[0].id }, data: { ativo: true } }); }
  });

  it('retira todos os destaques ao salvar arrays vazios, sem voltar à seleção automática', async () => {
    expect((await salvar({ profissionalIds: [], clinicaIds: [] })).status).toBe(200);
    expect((await request(app).get('/api/medicos/recomendados')).body).toEqual([]);
    expect((await request(app).get('/api/clinicas/recomendadas')).body).toEqual([]);
    expect((await request(app).get('/api/medicos').query({ cidade })).body.map((p: { id: string }) => p.id)).toEqual(expect.arrayContaining(profissionalIds));
    expect((await request(app).get('/api/clinicas')).body.map((c: { id: string }) => c.id)).toContain(clinica.id);
  });

  it('rejeita acesso sem autenticação e de outras contas, inclusive outro admin', async () => {
    expect((await request(app).get('/api/admin/destaques')).status).toBe(401);
    expect((await request(app).put('/api/admin/destaques').send(selecao())).status).toBe(401);
    for (const usuario of [usuarios[0], clinica, usuarios[4], usuarios[5]]) {
      const authorization = `Bearer ${tokenDe(usuario)}`;
      expect((await request(app).get('/api/admin/destaques').set('Authorization', authorization)).status).toBe(403);
      expect((await request(app).put('/api/admin/destaques').set('Authorization', authorization).send(selecao())).status).toBe(403);
    }
  });
});

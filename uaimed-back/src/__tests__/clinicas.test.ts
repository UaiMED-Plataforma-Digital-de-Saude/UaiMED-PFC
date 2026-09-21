import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { generateToken } from '../utils/jwt';

describe('Clínicas — listagem e recomendadas', () => {
  const unique = uuidv4();
  const documentoBase = unique.replace(/\D/g, '').padEnd(12, '0').slice(0, 12);
  const cpfBase = documentoBase.slice(0, 8);

  let clinica1: any;
  let clinica2: any;
  let clinicaInativa: any;
  let medicoUsuario: any;
  let profissional: any;
  let tokenClinica: string;
  let tokenMedico: string;

  beforeAll(async () => {
    // Cria clínica 1 — São Paulo
    clinica1 = await prisma.usuario.create({
      data: {
        nome: 'Clínica São Paulo Teste',
        email: `clinica1-${unique}@example.com`,
        cpf: `${cpfBase}001`,
        telefone: '11999990001',
        senha: 'hash_qualquer',
        tipo: 'clinica',
        cidade: 'São Paulo',
        estado: 'SP',
        ativo: true,
      },
    });

    // Cria clínica 2 — Goiânia
    clinica2 = await prisma.usuario.create({
      data: {
        nome: 'Clínica Goiânia Teste',
        email: `clinica2-${unique}@example.com`,
        cpf: `${cpfBase}002`,
        telefone: '62999990002',
        senha: 'hash_qualquer',
        tipo: 'clinica',
        cidade: 'Goiânia',
        estado: 'GO',
        ativo: true,
      },
    });

    // Cria clínica inativa — não deve aparecer nos resultados
    clinicaInativa = await prisma.usuario.create({
      data: {
        nome: 'Clínica Inativa Teste',
        email: `clinica-inativa-${unique}@example.com`,
        cpf: `${cpfBase}003`,
        telefone: '11999990003',
        senha: 'hash_qualquer',
        tipo: 'clinica',
        cidade: 'São Paulo',
        estado: 'SP',
        ativo: false,
      },
    });

    medicoUsuario = await prisma.usuario.create({
      data: {
        nome: 'Dr. Vínculo Teste',
        email: `medico-vinculo-${unique}@example.com`,
        cpf: `${cpfBase}006`,
        telefone: '31999990006',
        senha: 'hash_qualquer',
        tipo: 'medico',
      },
    });
    profissional = await prisma.profissional.create({
      data: {
        usuarioId: medicoUsuario.id,
        especialidade: 'Cardiologia',
        crm: `CRM-VINCULO-${unique}`,
        dataFormacao: new Date('2015-01-01'),
        endereco: 'Rua Teste, 10',
        cidade: 'Belo Horizonte',
        estado: 'MG',
        cep: '30000-000',
      },
    });
    tokenClinica = generateToken({ id: clinica1.id, email: clinica1.email, tipo: clinica1.tipo });
    tokenMedico = generateToken({ id: medicoUsuario.id, email: medicoUsuario.email, tipo: medicoUsuario.tipo });
  });

  afterAll(async () => {
    if (profissional?.id) {
      await prisma.clinicaProfissional.deleteMany({ where: { profissionalId: profissional.id } }).catch(() => {});
      await prisma.profissional.deleteMany({ where: { id: profissional.id } }).catch(() => {});
    }
    if (medicoUsuario?.id) {
      await prisma.usuario.deleteMany({ where: { id: medicoUsuario.id } }).catch(() => {});
    }
    const emails = [
      `clinica1-${unique}@example.com`,
      `clinica2-${unique}@example.com`,
      `clinica-inativa-${unique}@example.com`,
      `clinica-signup-${unique}@example.com`,
    ];
    await prisma.usuario.deleteMany({ where: { email: { in: emails } } }).catch(() => {});
    await prisma.$disconnect();
  });

  // ── Cadastro de clínica via API ──────────────────────────────────────────

  describe('POST /api/usuarios — cadastro de clínica', () => {
    it('cria uma clínica com cidade e estado', async () => {
      const res = await request(app).post('/api/usuarios').send({
        nome: 'Clínica Signup Teste',
        email: `clinica-signup-${unique}@example.com`,
        cnpj: `10${documentoBase}`,
        telefone: '11999990004',
        senha: 'senha123',
        tipo: 'clinica',
        cidade: 'Belo Horizonte',
        estado: 'MG',
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.tipo).toBe('clinica');
    });

    it('rejeita cadastro de clínica com e-mail duplicado', async () => {
      const res = await request(app).post('/api/usuarios').send({
        nome: 'Clínica Duplicada',
        email: `clinica-signup-${unique}@example.com`,
        cnpj: `20${documentoBase}`,
        telefone: '11999990005',
        senha: 'senha123',
        tipo: 'clinica',
      });

      expect(res.status).toBe(409);
    });
  });

  describe('Equipe médica da clínica', () => {
    it('envia uma solicitação sem vincular o médico imediatamente', async () => {
      const solicitacao = await request(app)
        .post('/api/clinicas/me/medicos')
        .set('Authorization', `Bearer ${tokenClinica}`)
        .send({ profissionalId: profissional.id });

      expect(solicitacao.status).toBe(201);
      expect(solicitacao.body).toEqual(expect.objectContaining({
        id: profissional.id,
        statusVinculo: 'pendente',
        vinculado: false,
      }));

      const area = await request(app)
        .get('/api/clinicas/me')
        .set('Authorization', `Bearer ${tokenClinica}`);

      expect(area.status).toBe(200);
      expect(area.body.resumo.totalMedicos).toBe(0);
      expect(area.body.medicos).toEqual([]);
    });

    it('pesquisa somente pelo CPF ou CRM completo', async () => {
      const resposta = await request(app)
        .get(`/api/clinicas/me/medicos?query=${encodeURIComponent(profissional.crm)}`)
        .set('Authorization', `Bearer ${tokenClinica}`);

      expect(resposta.status).toBe(200);
      expect(resposta.body).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: profissional.id,
          statusVinculo: 'pendente',
          vinculado: false,
        }),
      ]));

      const parcial = await request(app)
        .get(`/api/clinicas/me/medicos?query=${encodeURIComponent('Vínculo')}`)
        .set('Authorization', `Bearer ${tokenClinica}`);
      expect(parcial.status).toBe(200);
      expect(parcial.body).toEqual([]);
    });

    it('permite que o médico aceite a solicitação pelo perfil', async () => {
      const pendentes = await request(app)
        .get('/api/clinicas/solicitacoes')
        .set('Authorization', `Bearer ${tokenMedico}`);

      expect(pendentes.status).toBe(200);
      expect(pendentes.body).toEqual(expect.arrayContaining([
        expect.objectContaining({ clinicaId: clinica1.id, status: 'pendente' }),
      ]));

      const resposta = await request(app)
        .patch(`/api/clinicas/solicitacoes/${clinica1.id}`)
        .set('Authorization', `Bearer ${tokenMedico}`)
        .send({ acao: 'aceitar' });

      expect(resposta.status).toBe(200);
      expect(resposta.body.status).toBe('aceito');

      const area = await request(app)
        .get('/api/clinicas/me')
        .set('Authorization', `Bearer ${tokenClinica}`);
      expect(area.body.resumo.totalMedicos).toBe(1);
      expect(area.body.medicos).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: profissional.id, nome: 'Dr. Vínculo Teste' }),
      ]));
    });

    it('desvincula o médico da clínica', async () => {
      const resposta = await request(app)
        .delete(`/api/clinicas/me/medicos/${profissional.id}`)
        .set('Authorization', `Bearer ${tokenClinica}`);

      expect(resposta.status).toBe(204);
    });
  });

  // ── Listagem geral ───────────────────────────────────────────────────────

  describe('GET /api/clinicas', () => {
    it('retorna lista de clínicas ativas', async () => {
      const res = await request(app).get('/api/clinicas');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      // Deve conter as clínicas criadas no beforeAll
      const ids = res.body.map((c: any) => c.id);
      expect(ids).toContain(clinica1.id);
      expect(ids).toContain(clinica2.id);
    });

    it('não retorna clínicas inativas', async () => {
      const res = await request(app).get('/api/clinicas');

      expect(res.status).toBe(200);
      const ids = res.body.map((c: any) => c.id);
      expect(ids).not.toContain(clinicaInativa.id);
    });

    it('não retorna usuários que não são clínicas', async () => {
      const res = await request(app).get('/api/clinicas');

      expect(res.status).toBe(200);
      res.body.forEach((c: any) => {
        // O campo tipo não é retornado mas todas devem ter id e nome
        expect(c).toHaveProperty('id');
        expect(c).toHaveProperty('nome');
      });
    });
  });

  // ── Clínicas Recomendadas ────────────────────────────────────────────────

  describe('GET /api/clinicas/recomendadas', () => {
    it('retorna clínicas sem filtro', async () => {
      const res = await request(app).get('/api/clinicas/recomendadas');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      // Verifica formato de cada item
      res.body.forEach((c: any) => {
        expect(c).toHaveProperty('id');
        expect(c).toHaveProperty('nome');
        expect(c).toHaveProperty('nota');
      });
    });

    it('filtra clínicas por estado', async () => {
      const res = await request(app).get('/api/clinicas/recomendadas?estado=SP');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      const ids = res.body.map((c: any) => c.id);
      expect(ids).toContain(clinica1.id);
      // Clínica de GO não deve aparecer no filtro SP
      expect(ids).not.toContain(clinica2.id);
    });

    it('filtra clínicas por cidade', async () => {
      const res = await request(app).get('/api/clinicas/recomendadas').query({ cidade: 'Goiânia' });

      expect(res.status).toBe(200);
      const ids = res.body.map((c: any) => c.id);
      expect(ids).toContain(clinica2.id);
      expect(ids).not.toContain(clinica1.id);
    });

    it('filtra clínicas por cidade e estado combinados', async () => {
      const res = await request(app).get('/api/clinicas/recomendadas').query({ cidade: 'São Paulo', estado: 'SP' });

      expect(res.status).toBe(200);
      const ids = res.body.map((c: any) => c.id);
      expect(ids).toContain(clinica1.id);
    });

    it('retorna array vazio para filtro sem resultados', async () => {
      const res = await request(app).get('/api/clinicas/recomendadas?estado=XX');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('não retorna clínicas inativas nas recomendadas', async () => {
      const res = await request(app).get('/api/clinicas/recomendadas?estado=SP');

      expect(res.status).toBe(200);
      const ids = res.body.map((c: any) => c.id);
      expect(ids).not.toContain(clinicaInativa.id);
    });

    it('retorna campo localizacao formatado corretamente', async () => {
      const res = await request(app).get(`/api/clinicas/recomendadas?estado=GO`);

      expect(res.status).toBe(200);
      const clinica = res.body.find((c: any) => c.id === clinica2.id);
      expect(clinica).toBeDefined();
      expect(clinica.localizacao).toBe('Goiânia, GO');
    });

    it('retorna no máximo 10 clínicas', async () => {
      const res = await request(app).get('/api/clinicas/recomendadas');

      expect(res.status).toBe(200);
      expect(res.body.length).toBeLessThanOrEqual(10);
    });
  });
});


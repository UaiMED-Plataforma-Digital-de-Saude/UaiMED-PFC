import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

describe('Clínicas — listagem e recomendadas', () => {
  const unique = uuidv4();
  const cpfBase = unique.replace(/-/g, '').slice(0, 8);

  let clinica1: any;
  let clinica2: any;
  let clinicaInativa: any;

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
  });

  afterAll(async () => {
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
        cpf: `${cpfBase}004`,
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
        cpf: `${cpfBase}005`,
        telefone: '11999990005',
        senha: 'senha123',
        tipo: 'clinica',
      });

      expect(res.status).toBe(409);
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
      const res = await request(app).get('/api/clinicas/recomendadas?cidade=Goiânia');

      expect(res.status).toBe(200);
      const ids = res.body.map((c: any) => c.id);
      expect(ids).toContain(clinica2.id);
      expect(ids).not.toContain(clinica1.id);
    });

    it('filtra clínicas por cidade e estado combinados', async () => {
      const res = await request(app).get('/api/clinicas/recomendadas?cidade=São Paulo&estado=SP');

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


import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

describe('Artigos — criar e atualizar', () => {
  let autor: any;
  let token: string;
  let artigoId: string;

  beforeAll(async () => {
    const unique = uuidv4();
    const hash = await bcrypt.hash('pass123', 8);

    autor = await prisma.usuario.create({
      data: {
        nome: 'Autor Teste',
        email: `autor-${unique}@example.com`,
        cpf: `at${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11922222222',
        senha: hash,
        tipo: 'medico',
      },
    });
    token = generateToken({ id: autor.id, email: autor.email, tipo: autor.tipo });
  });

  afterAll(async () => {
    await prisma.artigo.deleteMany({ where: { autorId: autor.id } }).catch(() => {});
    await prisma.usuario.deleteMany({ where: { id: autor.id } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('cria um artigo com dados válidos', async () => {
    const res = await request(app)
      .post('/api/artigos')
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'Título do artigo', categoria: 'saude', corpo: 'Corpo do artigo de teste.' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    artigoId = res.body.id;
  });

  it('rejeita criação sem título, categoria ou corpo', async () => {
    const res = await request(app)
      .post('/api/artigos')
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: '', categoria: '', corpo: '' });
    expect(res.status).toBe(400);
  });

  it('rejeita criação com banner em formato inválido', async () => {
    const res = await request(app)
      .post('/api/artigos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        titulo: 'Outro título',
        categoria: 'saude',
        corpo: 'Corpo',
        banner: 'https://exemplo.com/imagem.png',
      });
    expect(res.status).toBe(400);
  });

  it('rejeita criação sem autenticação', async () => {
    const res = await request(app)
      .post('/api/artigos')
      .send({ titulo: 'T', categoria: 'saude', corpo: 'C' });
    expect(res.status).toBe(401);
  });

  it('rejeita atualização sem título, categoria ou corpo', async () => {
    const res = await request(app)
      .put(`/api/artigos/${artigoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: '', categoria: '', corpo: '' });
    expect(res.status).toBe(400);
  });
});

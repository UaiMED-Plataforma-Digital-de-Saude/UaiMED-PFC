import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

describe('Avaliações endpoints', () => {
  let user: any;
  let profUsuario: any;
  let profissional: any;
  let token: string;

  beforeAll(async () => {
    const unique = uuidv4();
    const hash = await bcrypt.hash('pass123', 8);
    user = await prisma.usuario.create({
      data: {
        nome: 'Avalia Teste',
        email: `avalia-${unique}@example.com`,
        cpf: `av${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11911111111',
        senha: hash,
        tipo: 'paciente',
      },
    });
    profUsuario = await prisma.usuario.create({
      data: {
        nome: 'Dr Avalia',
        email: `dravalia-${unique}@example.com`,
        cpf: `dr${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11922222222',
        senha: hash,
        tipo: 'medico',
      },
    });
    profissional = await prisma.profissional.create({
      data: {
        usuarioId: profUsuario.id,
        especialidade: 'Clínica Geral',
        crm: `CRM-AV-${unique}`,
        dataFormacao: new Date(),
        endereco: 'Rua Z',
        cidade: 'Cidade',
        estado: 'MG',
        cep: '30000-000',
      },
    });
    token = generateToken({ id: user.id, email: user.email, tipo: user.tipo });
  });

  afterAll(async () => {
    if (user?.id) await prisma.avaliacao.deleteMany({ where: { usuarioId: user.id } }).catch(() => {});
    if (profissional?.id) await prisma.profissional.deleteMany({ where: { id: profissional.id } }).catch(() => {});
    if (profUsuario?.id) await prisma.usuario.deleteMany({ where: { id: profUsuario.id } }).catch(() => {});
    if (user?.id) await prisma.usuario.deleteMany({ where: { id: user.id } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('cria avaliação com nota válida', async () => {
    const res = await request(app)
      .post('/api/avaliacoes')
      .set('Authorization', `Bearer ${token}`)
      .send({ profissionalId: profissional.id, nota: 5, comentario: 'Ótimo atendimento!' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.nota).toBe(5);
    expect(res.body.profissionalId).toBe(profissional.id);
  });

  it('rejeita avaliação com nota inválida (0)', async () => {
    const res = await request(app)
      .post('/api/avaliacoes')
      .set('Authorization', `Bearer ${token}`)
      .send({ profissionalId: profissional.id, nota: 0 });
    expect(res.status).toBe(400);
  });

  it('rejeita avaliação com nota inválida (6)', async () => {
    const res = await request(app)
      .post('/api/avaliacoes')
      .set('Authorization', `Bearer ${token}`)
      .send({ profissionalId: profissional.id, nota: 6 });
    expect(res.status).toBe(400);
  });

  it('retorna média das avaliações do profissional', async () => {
    const res = await request(app).get(`/api/avaliacoes/medico/${profissional.id}/media`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('notaMedia');
    expect(res.body).toHaveProperty('totalAvaliacoes');
    expect(res.body.totalAvaliacoes).toBeGreaterThanOrEqual(1);
    expect(res.body.notaMedia).toBeGreaterThan(0);
  });

  it('retorna notaMedia 0 para profissional sem avaliações (id inválido)', async () => {
    // Usa o id do profUsuario (usuário, não profissional) — não terá avaliações
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await request(app).get(`/api/avaliacoes/medico/${fakeId}/media`);
    expect(res.status).toBe(200);
    expect(res.body.notaMedia).toBe(0);
    expect(res.body.totalAvaliacoes).toBe(0);
  });

  it('rejeita criação de avaliação sem autenticação', async () => {
    const res = await request(app)
      .post('/api/avaliacoes')
      .send({ profissionalId: profissional.id, nota: 4 });
    expect(res.status).toBe(401);
  });
});


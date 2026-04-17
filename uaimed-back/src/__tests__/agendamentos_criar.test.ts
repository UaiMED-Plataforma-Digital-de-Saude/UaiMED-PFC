import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

describe('Agendamentos — criar e sugestões de horário', () => {
  let user: any;
  let profUsuario: any;
  let profissional: any;
  let token: string;

  beforeAll(async () => {
    const unique = uuidv4();
    const hash = await bcrypt.hash('pass123', 8);

    user = await prisma.usuario.create({
      data: {
        nome: 'Agenda Criar',
        email: `agcria-${unique}@example.com`,
        cpf: `ac${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11955555555',
        senha: hash,
        tipo: 'paciente',
      },
    });
    profUsuario = await prisma.usuario.create({
      data: {
        nome: 'Dr Criar',
        email: `drcria-${unique}@example.com`,
        cpf: `dc${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11966666666',
        senha: hash,
        tipo: 'medico',
      },
    });
    profissional = await prisma.profissional.create({
      data: {
        usuarioId: profUsuario.id,
        especialidade: 'Neurologia',
        crm: `CRM-CR-${unique}`,
        dataFormacao: new Date(),
        endereco: 'Rua W',
        cidade: 'SP',
        estado: 'SP',
        cep: '01000-000',
      },
    });
    token = generateToken({ id: user.id, email: user.email, tipo: user.tipo });
  });

  afterAll(async () => {
    if (user?.id) await prisma.agendamento.deleteMany({ where: { usuarioId: user.id } }).catch(() => {});
    if (profissional?.id) await prisma.profissional.deleteMany({ where: { id: profissional.id } }).catch(() => {});
    if (profUsuario?.id) await prisma.usuario.deleteMany({ where: { id: profUsuario.id } }).catch(() => {});
    if (user?.id) await prisma.usuario.deleteMany({ where: { id: user.id } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('cria um agendamento com dados válidos', async () => {
    const dataHora = new Date(Date.now() + 86400000).toISOString();
    const res = await request(app)
      .post('/api/agendamentos')
      .set('Authorization', `Bearer ${token}`)
      .send({ medicoId: profissional.id, dataHora });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.profissionalId).toBe(profissional.id);
  });

  it('rejeita criação de agendamento sem autenticação', async () => {
    const dataHora = new Date(Date.now() + 86400000).toISOString();
    const res = await request(app)
      .post('/api/agendamentos')
      .send({ medicoId: profissional.id, dataHora });
    expect(res.status).toBe(401);
  });

  it('rejeita agendamento sem medicoId', async () => {
    const dataHora = new Date(Date.now() + 86400000).toISOString();
    const res = await request(app)
      .post('/api/agendamentos')
      .set('Authorization', `Bearer ${token}`)
      .send({ dataHora });
    expect(res.status).toBe(400);
  });

  it('retorna sugestões de horário para um médico', async () => {
    const res = await request(app)
      .get(`/api/agendamentos/sugestoes-horario?medicoId=${profissional.id}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('retorna erro ao buscar sugestões sem medicoId', async () => {
    const res = await request(app).get('/api/agendamentos/sugestoes-horario');
    expect(res.status).toBe(400);
  });
});


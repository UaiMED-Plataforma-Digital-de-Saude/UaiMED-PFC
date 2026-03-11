
import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

describe('Medicos and Agendamentos endpoints', () => {
  let user: any;
  let profUsuario: any;
  let profissional: any;
  let agendamento: any;
  let token: string;

  beforeAll(async () => {
    // create a user
    const unique = uuidv4();
    const hash = await bcrypt.hash('userpass', 8);
    user = await prisma.usuario.create({ data: { nome: 'User Test', email: `user-${unique}@example.com`, cpf: `333${unique}`, telefone: '912345678', senha: hash, tipo: 'paciente' } });

    // create professional user
    const phash = await bcrypt.hash('profpass', 8);
    profUsuario = await prisma.usuario.create({ data: { nome: 'Prof Test', email: `prof-${unique}@example.com`, cpf: `444${unique}`, telefone: '923456789', senha: phash, tipo: 'medico' } });

    profissional = await prisma.profissional.create({ data: { usuarioId: profUsuario.id, especialidade: 'Cardiologia', crm: `CRM-${unique}`, dataFormacao: new Date(), endereco: 'Rua Y', cidade: 'Cidade', estado: 'ST', cep: '11111-111' } });

    // create an agendamento for user
    agendamento = await prisma.agendamento.create({ data: { usuarioId: user.id, profissionalId: profissional.id, dataHora: new Date(), duracao: 30, status: 'confirmado' } });

    token = generateToken({ id: user.id, email: user.email, tipo: user.tipo });
  });

  afterAll(async () => {
    await prisma.agendamento.deleteMany({ where: { usuarioId: user.id } }).catch(() => {});
    await prisma.profissional.deleteMany({ where: { id: profissional.id } }).catch(() => {});
    await prisma.usuario.deleteMany({ where: { email: { contains: 'user-' } } }).catch(() => {});
    await prisma.usuario.deleteMany({ where: { email: { contains: 'prof-' } } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('should list medicos and include created professional', async () => {
    const res = await request(app).get('/api/medicos').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    const found = res.body.find((m: any) => m.id === profissional.id);
    expect(found).toBeDefined();
    expect(found.especialidade).toBe('Cardiologia');
  });

  it('should return agendamentos for authenticated user', async () => {
    const res = await request(app).get('/api/agendamentos').set('Authorization', `Bearer ${token}`);
    if (res.status !== 200) {
      // Exibe o corpo da resposta de erro para diagnóstico
      console.error('Erro na resposta:', res.body);
    }
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // look for any confirmed appointment with a medico name — robust to ordering and parallel runs
    const found = res.body.find((a: any) => a.status === 'confirmado' && !!a.medico);
    expect(found).toBeDefined();
    expect(found.medico).toBeTruthy();
    expect(found.status).toBe('confirmado');
  });
});

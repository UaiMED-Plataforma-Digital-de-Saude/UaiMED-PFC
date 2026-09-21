import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

describe('Professionals — atualizar endereço', () => {
  let medico: any;
  let paciente: any;
  let tokenMedico: string;
  let tokenPaciente: string;

  beforeAll(async () => {
    const unique = uuidv4();
    const hash = await bcrypt.hash('pass123', 8);

    medico = await prisma.usuario.create({
      data: {
        nome: 'Médico Endereço Teste',
        email: `medend-${unique}@example.com`,
        cpf: `me${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11988888888',
        senha: hash,
        tipo: 'medico',
      },
    });
    paciente = await prisma.usuario.create({
      data: {
        nome: 'Paciente Endereço Teste',
        email: `pacend-${unique}@example.com`,
        cpf: `pe${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11977777777',
        senha: hash,
        tipo: 'paciente',
      },
    });
    tokenMedico = generateToken({ id: medico.id, email: medico.email, tipo: medico.tipo });
    tokenPaciente = generateToken({ id: paciente.id, email: paciente.email, tipo: paciente.tipo });
  });

  afterAll(async () => {
    await prisma.usuario.deleteMany({ where: { id: { in: [medico.id, paciente.id] } } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('rejeita atualização sem endereço, cidade ou estado', async () => {
    const res = await request(app)
      .put('/api/professionals/me/endereco')
      .set('Authorization', `Bearer ${tokenMedico}`)
      .send({ endereco: '', cidade: '', estado: '' });
    expect(res.status).toBe(400);
  });

  it('rejeita atualização sem autenticação', async () => {
    const res = await request(app)
      .put('/api/professionals/me/endereco')
      .send({ endereco: 'Rua A', cidade: 'BH', estado: 'MG' });
    expect(res.status).toBe(401);
  });

  it('rejeita atualização para usuário que não é médico', async () => {
    const res = await request(app)
      .put('/api/professionals/me/endereco')
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .send({ endereco: 'Rua A', cidade: 'BH', estado: 'MG' });
    expect(res.status).toBe(403);
  });
});

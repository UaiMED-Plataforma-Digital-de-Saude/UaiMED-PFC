import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

describe('Admin summary endpoint', () => {
  let clinicUser: any;
  let medUser: any;
  let token: string;
  let createdProfId: string | null = null;

  beforeAll(async () => {
    const unique = uuidv4();

    // Clínica
    clinicUser = await prisma.usuario.create({
      data: {
        nome: 'Clinica Teste',
        email: `clinic-${unique}@test.local`,
        cpf: `cl${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11999999999',
        senha: 'hashed',
        tipo: 'clinica',
      },
    });
    token = generateToken({ id: clinicUser.id, email: clinicUser.email, tipo: clinicUser.tipo });

    // Médico e profissional
    medUser = await prisma.usuario.create({
      data: {
        nome: 'Dr Test',
        email: `med-${unique}@test.local`,
        cpf: `md${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11988888888',
        senha: 'h',
        tipo: 'medico',
      },
    });
    const prof = await prisma.profissional.create({
      data: {
        usuarioId: medUser.id,
        especialidade: 'Clinica',
        crm: `CRM-ADMIN-${unique}`,
        dataFormacao: new Date(),
        endereco: 'Rua',
        cidade: 'Cidade',
        estado: 'EST',
        cep: '00000-000',
      },
    });
    createdProfId = prof.id;

    await prisma.agendamento.createMany({
      data: [
        { usuarioId: clinicUser.id, profissionalId: prof.id, dataHora: new Date(), observacoes: 'A' },
        { usuarioId: clinicUser.id, profissionalId: prof.id, dataHora: new Date(Date.now() + 86400000), observacoes: 'B' },
      ],
    });
  });

  afterAll(async () => {
    // Limpeza específica por ID — não usa contains para não afetar outros testes paralelos
    if (clinicUser?.id) {
      await prisma.agendamento.deleteMany({ where: { usuarioId: clinicUser.id } }).catch(() => {});
    }
    if (createdProfId) {
      await prisma.agendamento.deleteMany({ where: { profissionalId: createdProfId } }).catch(() => {});
      await prisma.profissional.deleteMany({ where: { id: createdProfId } }).catch(() => {});
    }
    if (medUser?.id) {
      await prisma.usuario.deleteMany({ where: { id: medUser.id } }).catch(() => {});
    }
    if (clinicUser?.id) {
      await prisma.usuario.deleteMany({ where: { id: clinicUser.id } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it('returns summary for clinic user', async () => {
    const res = await request(app)
      .get('/api/admin/summary')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalUsuarios');
    expect(res.body).toHaveProperty('totalAgendamentosHoje');
    expect(res.body).toHaveProperty('topProfissionais');
  });
});

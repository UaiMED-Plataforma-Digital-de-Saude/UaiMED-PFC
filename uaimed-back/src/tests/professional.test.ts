import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

describe('Professional summary endpoint', () => {
  let medUser: any;
  let token: string;
  let prof: any;
  let patientUser: any;

  beforeAll(async () => {
    const unique = uuidv4();

    // Médico
    medUser = await prisma.usuario.create({
      data: {
        nome: 'Dr Me',
        email: `drme-${unique}@test.local`,
        cpf: `dr${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11977777777',
        senha: 'h',
        tipo: 'medico',
      },
    });
    prof = await prisma.profissional.create({
      data: {
        usuarioId: medUser.id,
        especialidade: 'Test',
        crm: `CRM-PROF-${unique}`,
        dataFormacao: new Date(),
        endereco: 'Rua',
        cidade: 'C',
        estado: 'E',
        cep: '11111-111',
      },
    });

    // Paciente para ser dono do agendamento/pagamento
    patientUser = await prisma.usuario.create({
      data: {
        nome: 'Paciente Test',
        email: `patient-${unique}@test.local`,
        cpf: `pt${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11966666666',
        senha: 'h',
        tipo: 'paciente',
      },
    });

    const a1 = await prisma.agendamento.create({
      data: { usuarioId: patientUser.id, profissionalId: prof.id, dataHora: new Date(Date.now() + 3600000) },
    });
    await prisma.pagamento.create({
      data: { usuarioId: patientUser.id, agendamentoId: a1.id, valor: 100, desconto: 0, valorFinal: 100, metodo: 'pix', status: 'concluido' },
    });

    token = generateToken({ id: medUser.id, email: medUser.email, tipo: medUser.tipo });
  });

  afterAll(async () => {
    // Limpeza específica por ID — não usa contains para não afetar outros testes paralelos
    if (patientUser?.id) {
      await prisma.pagamento.deleteMany({ where: { usuarioId: patientUser.id } }).catch(() => {});
      await prisma.agendamento.deleteMany({ where: { usuarioId: patientUser.id } }).catch(() => {});
      await prisma.usuario.deleteMany({ where: { id: patientUser.id } }).catch(() => {});
    }
    if (prof?.id) {
      await prisma.profissional.deleteMany({ where: { id: prof.id } }).catch(() => {});
    }
    if (medUser?.id) {
      await prisma.usuario.deleteMany({ where: { id: medUser.id } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it('returns professional summary for authenticated medico', async () => {
    const res = await request(app)
      .get('/api/professionals/me/summary')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalToday');
    expect(res.body).toHaveProperty('nextAppointments');
    expect(res.body).toHaveProperty('revenueThisMonth');
  });
});

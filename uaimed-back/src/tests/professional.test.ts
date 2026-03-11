
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
  let createdPatientId: string | null = null;

  beforeAll(async () => {
    const unique = uuidv4();
    const medEmail = `drme-${unique}@test.local`;
    medUser = await prisma.usuario.create({ data: { nome: 'Dr Me', email: medEmail, cpf: `22222222222${unique}`, telefone: '11977777777', senha: 'h', tipo: 'medico' } });
    prof = await prisma.profissional.create({ data: { usuarioId: medUser.id, especialidade: 'Test', crm: `CRM2-${unique}`, dataFormacao: new Date(), endereco: 'Rua', cidade: 'C', estado: 'E', cep: '11111-111' } });

    // create a patient user and link appointment/payment to patient
    const patient = await prisma.usuario.create({ data: { nome: 'Paciente Test', email: `patient-${unique}@test.local`, cpf: `33333333333${unique}`, telefone: '11966666666', senha: 'h', tipo: 'paciente' } });
    createdPatientId = patient.id;

    // create appointments and payments — link to patient as usuarioId
    const a1 = await prisma.agendamento.create({ data: { usuarioId: patient.id, profissionalId: prof.id, dataHora: new Date(Date.now() + 3600000) } });
    await prisma.pagamento.create({ data: { usuarioId: patient.id, agendamentoId: a1.id, valor: 100, desconto: 0, valorFinal: 100, metodo: 'pix', status: 'concluido' } });

    token = generateToken({ id: medUser.id, email: medUser.email, tipo: medUser.tipo });
  });

  afterAll(async () => {
    // cleanup created records only
    if (createdPatientId) {
      await prisma.pagamento.deleteMany({ where: { usuarioId: createdPatientId } }).catch(() => {});
      await prisma.agendamento.deleteMany({ where: { usuarioId: createdPatientId } }).catch(() => {});
    }
    if (prof?.id) {
      await prisma.profissional.deleteMany({ where: { id: prof.id } }).catch(() => {});
    }
    await prisma.usuario.deleteMany({ where: { email: { contains: '@test.local' } } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('returns professional summary for authenticated medico', async () => {
    const res = await request(app).get('/api/professionals/me/summary').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalToday');
    expect(res.body).toHaveProperty('nextAppointments');
    expect(res.body).toHaveProperty('revenueThisMonth');
  });
});

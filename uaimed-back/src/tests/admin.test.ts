
import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

describe('Admin summary endpoint', () => {
  let clinicUser: any;
  let token: string;
  let createdProfId: string | null = null;
  let createdAgendamentoIds: string[] = [];

  beforeAll(async () => {
    // create a clinic user
    clinicUser = await prisma.usuario.create({
      data: {
        nome: 'Clinica Teste',
        email: 'clinic@test.local',
        cpf: '00000000000',
        telefone: '11999999999',
        senha: 'hashed',
        tipo: 'clinica',
      }
    });

    token = generateToken({ id: clinicUser.id, email: clinicUser.email, tipo: clinicUser.tipo });

    // create a professional and some appointments
    const unique = uuidv4();
    const medEmail = `med-${unique}@test.local`;
    const userMed = await prisma.usuario.create({ data: { nome: 'Dr Test', email: medEmail, cpf: `11111111111${unique}`, telefone: '11988888888', senha: 'h', tipo: 'medico' } });
    const prof = await prisma.profissional.create({ data: { usuarioId: userMed.id, especialidade: 'Clinica', crm: `CRM1-${unique}`, dataFormacao: new Date(), endereco: 'Rua', cidade: 'Cidade', estado: 'EST', cep: '00000-000' } });
    createdProfId = prof.id;

    await prisma.agendamento.createMany({ data: [
      { usuarioId: clinicUser.id, profissionalId: prof.id, dataHora: new Date(), observacoes: 'A' },
      { usuarioId: clinicUser.id, profissionalId: prof.id, dataHora: new Date(Date.now() + 86400000), observacoes: 'B' },
    ]});
  });

  afterAll(async () => {
    // cleanup created records only
    if (clinicUser?.id) {
      await prisma.agendamento.deleteMany({ where: { usuarioId: clinicUser.id } }).catch(() => {});
      await prisma.pagamento.deleteMany({ where: { usuarioId: clinicUser.id } }).catch(() => {});
    }
    if (createdProfId) {
      await prisma.profissional.deleteMany({ where: { id: createdProfId } }).catch(() => {});
    }
    // remove users created with the unique suffix
    await prisma.usuario.deleteMany({ where: { email: { contains: '@test.local' } } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('returns summary for clinic user', async () => {
    const res = await request(app).get('/api/admin/summary').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalUsuarios');
    expect(res.body).toHaveProperty('totalAgendamentosHoje');
    expect(res.body).toHaveProperty('topProfissionais');
  });
});

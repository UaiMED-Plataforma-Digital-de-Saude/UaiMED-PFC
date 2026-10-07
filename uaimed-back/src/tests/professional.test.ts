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

  it('returns weekly and monthly series including the seeded appointment', async () => {
    const res = await request(app)
      .get('/api/professionals/me/summary')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);

    expect(res.body.weekly).toHaveLength(7);
    expect(res.body.monthly).toHaveLength(6);

    const hoje = res.body.weekly[res.body.weekly.length - 1];
    expect(hoje.count).toBeGreaterThanOrEqual(1);
    expect(hoje.revenue).toBeGreaterThanOrEqual(100);

    const mesAtual = res.body.monthly[res.body.monthly.length - 1];
    expect(mesAtual.count).toBeGreaterThanOrEqual(1);
    expect(mesAtual.revenue).toBeGreaterThanOrEqual(100);

    for (const ponto of [...res.body.weekly, ...res.body.monthly]) {
      expect(typeof ponto.count).toBe('number');
      expect(typeof ponto.revenue).toBe('number');
    }
  });

  it('updates the consultation price for the authenticated medico', async () => {
    const res = await request(app)
      .put('/api/professionals/me/preco')
      .set('Authorization', `Bearer ${token}`)
      .send({ precoConsulta: 199.9 });
    expect(res.status).toBe(200);
    expect(res.body.precoConsulta).toBe(199.9);
  });

  it('rejects a non-positive consultation price', async () => {
    const res = await request(app)
      .put('/api/professionals/me/preco')
      .set('Authorization', `Bearer ${token}`)
      .send({ precoConsulta: -10 });
    expect(res.status).toBe(400);
  });

  it('returns a default availability template when the medico never configured one', async () => {
    const res = await request(app)
      .get('/api/professionals/me/disponibilidade')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(7);
    expect(res.body.find((d: any) => d.diaSemana === 0).ativo).toBe(false);
    expect(res.body.find((d: any) => d.diaSemana === 1).ativo).toBe(true);
  });

  it('replaces the weekly availability and reflects it back on GET', async () => {
    const semanaCustom = Array.from({ length: 7 }, (_, diaSemana) => ({
      diaSemana,
      ativo: diaSemana !== 0,
      horaInicio: '09:00',
      horaFim: '12:00',
    }));

    const putRes = await request(app)
      .put('/api/professionals/me/disponibilidade')
      .set('Authorization', `Bearer ${token}`)
      .send(semanaCustom);
    expect(putRes.status).toBe(200);
    expect(putRes.body).toHaveLength(7);

    const getRes = await request(app)
      .get('/api/professionals/me/disponibilidade')
      .set('Authorization', `Bearer ${token}`);
    const domingo = getRes.body.find((d: any) => d.diaSemana === 0);
    expect(domingo.ativo).toBe(false);
    const segunda = getRes.body.find((d: any) => d.diaSemana === 1);
    expect(segunda).toMatchObject({ ativo: true, horaInicio: '09:00', horaFim: '12:00' });
  });

  it('rejects availability payloads with less than 7 days or invalid time range', async () => {
    const incompleta = await request(app)
      .put('/api/professionals/me/disponibilidade')
      .set('Authorization', `Bearer ${token}`)
      .send([{ diaSemana: 0, ativo: true, horaInicio: '08:00', horaFim: '17:00' }]);
    expect(incompleta.status).toBe(400);

    const semanaInvalida = Array.from({ length: 7 }, (_, diaSemana) => ({
      diaSemana,
      ativo: true,
      horaInicio: '18:00',
      horaFim: '08:00', // fim antes do início
    }));
    const horarioInvalido = await request(app)
      .put('/api/professionals/me/disponibilidade')
      .set('Authorization', `Bearer ${token}`)
      .send(semanaInvalida);
    expect(horarioInvalido.status).toBe(400);
  });

  it('rejects preco/disponibilidade endpoints for non-medico users', async () => {
    const patientToken = generateToken({ id: patientUser.id, email: patientUser.email, tipo: patientUser.tipo });
    const res = await request(app)
      .put('/api/professionals/me/preco')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ precoConsulta: 100 });
    expect(res.status).toBe(403);
  });
});

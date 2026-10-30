import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

describe('Relatório anonimizado de pacientes (LGPD)', () => {
  let clinicaUser: any;
  let medUser: any;
  let patientUser: any;
  let prof: any;
  let tokenClinica: string;
  const cpfPaciente = '12345678901';
  const telefonePaciente = '11987654321';

  beforeAll(async () => {
    const unique = uuidv4();

    clinicaUser = await prisma.usuario.create({
      data: {
        nome: 'Clinica Relatorio Teste',
        email: `clinica-relatorio-${unique}@test.local`,
        cnpj: `rl${unique.replace(/-/g, '').slice(0, 12)}`,
        telefone: '11933333333',
        senha: 'h',
        tipo: 'clinica',
      },
    });
    tokenClinica = generateToken({ id: clinicaUser.id, email: clinicaUser.email, tipo: clinicaUser.tipo });

    medUser = await prisma.usuario.create({
      data: {
        nome: 'Dr Relatorio',
        email: `dr-relatorio-${unique}@test.local`,
        cpf: `re${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11922222222',
        senha: 'h',
        tipo: 'medico',
      },
    });
    prof = await prisma.profissional.create({
      data: {
        usuarioId: medUser.id,
        especialidade: 'Test',
        crm: `CRM-RELATORIO-${unique}`,
        dataFormacao: new Date(),
        endereco: 'Rua',
        cidade: 'C',
        estado: 'E',
        cep: '33333-333',
      },
    });

    await prisma.clinicaProfissional.create({
      data: { clinicaId: clinicaUser.id, profissionalId: prof.id, status: 'aceito' },
    });

    patientUser = await prisma.usuario.create({
      data: {
        nome: 'Paciente Relatorio',
        email: `patient-relatorio-${unique}@test.local`,
        cpf: cpfPaciente,
        telefone: telefonePaciente,
        senha: 'h',
        tipo: 'paciente',
      },
    });

    await prisma.agendamento.create({
      data: { usuarioId: patientUser.id, profissionalId: prof.id, dataHora: new Date() },
    });
  });

  afterAll(async () => {
    await prisma.logAuditoria.deleteMany({ where: { pacienteId: patientUser?.id } }).catch(() => {});
    if (patientUser?.id) {
      await prisma.agendamento.deleteMany({ where: { usuarioId: patientUser.id } }).catch(() => {});
      await prisma.usuario.deleteMany({ where: { id: patientUser.id } }).catch(() => {});
    }
    if (prof?.id) {
      await prisma.clinicaProfissional.deleteMany({ where: { profissionalId: prof.id } }).catch(() => {});
      await prisma.profissional.deleteMany({ where: { id: prof.id } }).catch(() => {});
    }
    if (medUser?.id) {
      await prisma.usuario.deleteMany({ where: { id: medUser.id } }).catch(() => {});
    }
    if (clinicaUser?.id) {
      await prisma.usuario.deleteMany({ where: { id: clinicaUser.id } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it('exporta o CSV com nome em claro mas CPF/telefone mascarados, e audita a exportação', async () => {
    const res = await request(app)
      .get('/api/admin/relatorios/pacientes')
      .set('Authorization', `Bearer ${tokenClinica}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('Paciente Relatorio');
    expect(res.text).not.toContain(cpfPaciente);
    expect(res.text).not.toContain(telefonePaciente);
    expect(res.text).toContain(`***.***.***-${cpfPaciente.slice(-2)}`);
    expect(res.text).toContain(`(**) *****-${telefonePaciente.slice(-4)}`);

    const log = await prisma.logAuditoria.findFirst({
      where: { acao: 'EXPORTAR_RELATORIO_PACIENTES', pacienteId: patientUser.id, atorId: clinicaUser.id },
    });
    expect(log).not.toBeNull();
  });

  it('nega acesso ao relatório para usuários que não são clínica', async () => {
    const tokenMedico = generateToken({ id: medUser.id, email: medUser.email, tipo: medUser.tipo });
    const res = await request(app)
      .get('/api/admin/relatorios/pacientes')
      .set('Authorization', `Bearer ${tokenMedico}`);
    expect(res.status).toBe(403);
  });
});

import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import AuditoriaService from '../services/auditoria.service';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

describe('Log de auditoria de acesso a dados de pacientes', () => {
  let medUser: any;
  let patientUser: any;
  let prof: any;
  let token: string;

  beforeAll(async () => {
    const unique = uuidv4();

    medUser = await prisma.usuario.create({
      data: {
        nome: 'Dra Auditoria',
        email: `dr-audit-${unique}@test.local`,
        cpf: `au${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11955555555',
        senha: 'h',
        tipo: 'medico',
      },
    });
    prof = await prisma.profissional.create({
      data: {
        usuarioId: medUser.id,
        especialidade: 'Test',
        crm: `CRM-AUDIT-${unique}`,
        dataFormacao: new Date(),
        endereco: 'Rua',
        cidade: 'C',
        estado: 'E',
        cep: '22222-222',
      },
    });

    patientUser = await prisma.usuario.create({
      data: {
        nome: 'Paciente Auditado',
        email: `patient-audit-${unique}@test.local`,
        cpf: `pa${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11944444444',
        senha: 'h',
        tipo: 'paciente',
      },
    });

    await prisma.agendamento.create({
      data: { usuarioId: patientUser.id, profissionalId: prof.id, dataHora: new Date(Date.now() + 3600000) },
    });

    token = generateToken({ id: medUser.id, email: medUser.email, tipo: medUser.tipo });
  });

  afterAll(async () => {
    await prisma.logAuditoria.deleteMany({ where: { pacienteId: patientUser?.id } }).catch(() => {});
    if (patientUser?.id) {
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

  it('registra um log de auditoria quando o médico lista os agendamentos dos pacientes', async () => {
    const res = await request(app)
      .get('/api/professionals/me/agendamentos')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);

    const log = await prisma.logAuditoria.findFirst({
      where: { acao: 'LISTAR_AGENDAMENTOS_PACIENTES', pacienteId: patientUser.id, atorId: medUser.id },
    });
    expect(log).not.toBeNull();
    expect(log?.recurso).toBe('Agendamento');
  });

  it('purgarAntigos remove só os logs mais velhos que a retenção configurada', async () => {
    const seteMesesAtras = new Date();
    seteMesesAtras.setMonth(seteMesesAtras.getMonth() - 7);

    const antigo = await prisma.logAuditoria.create({
      data: { acao: 'LOG_ANTIGO_TESTE', recurso: 'Teste', pacienteId: patientUser.id, criado_em: seteMesesAtras },
    });
    const recente = await prisma.logAuditoria.create({
      data: { acao: 'LOG_RECENTE_TESTE', recurso: 'Teste', pacienteId: patientUser.id },
    });

    const removidos = await AuditoriaService.purgarAntigos(6);
    expect(removidos).toBeGreaterThanOrEqual(1);

    const aindaExisteAntigo = await prisma.logAuditoria.findUnique({ where: { id: antigo.id } });
    const aindaExisteRecente = await prisma.logAuditoria.findUnique({ where: { id: recente.id } });
    expect(aindaExisteAntigo).toBeNull();
    expect(aindaExisteRecente).not.toBeNull();
  });
});

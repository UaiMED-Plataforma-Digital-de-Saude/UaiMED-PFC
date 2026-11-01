import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

describe('Agendamentos — cancelar', () => {
  let user: any;
  let outroUsuario: any;
  let profUsuario: any;
  let profissional: any;
  let token: string;
  let outroToken: string;

  beforeAll(async () => {
    const unique = uuidv4();
    const hash = await bcrypt.hash('pass123', 8);

    user = await prisma.usuario.create({
      data: {
        nome: 'Agenda Cancelar',
        email: `agcancel-${unique}@example.com`,
        cpf: `ag${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11955555555',
        senha: hash,
        tipo: 'paciente',
      },
    });
    outroUsuario = await prisma.usuario.create({
      data: {
        nome: 'Outro Paciente',
        email: `outro-${unique}@example.com`,
        cpf: `ou${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11977777777',
        senha: hash,
        tipo: 'paciente',
      },
    });
    profUsuario = await prisma.usuario.create({
      data: {
        nome: 'Dr Cancelar',
        email: `drcancel-${unique}@example.com`,
        cpf: `dc${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11966666666',
        senha: hash,
        tipo: 'medico',
      },
    });
    profissional = await prisma.profissional.create({
      data: {
        usuarioId: profUsuario.id,
        especialidade: 'Cardiologia',
        crm: `CRM-CA-${unique}`,
        dataFormacao: new Date(),
        endereco: 'Rua Z',
        cidade: 'BH',
        estado: 'MG',
        cep: '30000-000',
      },
    });
    token = generateToken({ id: user.id, email: user.email, tipo: user.tipo });
    outroToken = generateToken({ id: outroUsuario.id, email: outroUsuario.email, tipo: outroUsuario.tipo });
  });

  afterAll(async () => {
    const usuarioIds = [user?.id, outroUsuario?.id].filter(Boolean);
    await prisma.logAuditoria.deleteMany({ where: { pacienteId: { in: usuarioIds } } }).catch(() => {});
    await prisma.agendamento.deleteMany({ where: { usuarioId: { in: usuarioIds } } }).catch(() => {});
    if (profissional?.id) await prisma.profissional.deleteMany({ where: { id: profissional.id } }).catch(() => {});
    if (profUsuario?.id) await prisma.usuario.deleteMany({ where: { id: profUsuario.id } }).catch(() => {});
    await prisma.usuario.deleteMany({ where: { id: { in: usuarioIds } } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('cancela um agendamento futuro com mais de 24h de antecedência', async () => {
    const agendamento = await prisma.agendamento.create({
      data: {
        usuarioId: user.id,
        profissionalId: profissional.id,
        dataHora: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'agendado',
      },
    });

    const res = await request(app)
      .patch(`/api/agendamentos/${agendamento.id}/cancelar`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('cancelado');

    const atualizado = await prisma.agendamento.findUnique({ where: { id: agendamento.id } });
    expect(atualizado?.status).toBe('cancelado');

    const log = await prisma.logAuditoria.findFirst({ where: { acao: 'CANCELAR_AGENDAMENTO', recursoId: agendamento.id } });
    expect(log).not.toBeNull();
  });

  it('rejeita cancelamento sem autenticação', async () => {
    const agendamento = await prisma.agendamento.create({
      data: {
        usuarioId: user.id,
        profissionalId: profissional.id,
        dataHora: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'agendado',
      },
    });

    const res = await request(app).patch(`/api/agendamentos/${agendamento.id}/cancelar`);
    expect(res.status).toBe(401);
  });

  it('rejeita cancelamento de agendamento de outro usuário', async () => {
    const agendamento = await prisma.agendamento.create({
      data: {
        usuarioId: user.id,
        profissionalId: profissional.id,
        dataHora: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'agendado',
      },
    });

    const res = await request(app)
      .patch(`/api/agendamentos/${agendamento.id}/cancelar`)
      .set('Authorization', `Bearer ${outroToken}`);

    expect(res.status).toBe(403);

    const inalterado = await prisma.agendamento.findUnique({ where: { id: agendamento.id } });
    expect(inalterado?.status).toBe('agendado');
  });

  it('rejeita cancelamento com menos de 24h de antecedência', async () => {
    const agendamento = await prisma.agendamento.create({
      data: {
        usuarioId: user.id,
        profissionalId: profissional.id,
        dataHora: new Date(Date.now() + 2 * 60 * 60 * 1000),
        status: 'agendado',
      },
    });

    const res = await request(app)
      .patch(`/api/agendamentos/${agendamento.id}/cancelar`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(422);

    const inalterado = await prisma.agendamento.findUnique({ where: { id: agendamento.id } });
    expect(inalterado?.status).toBe('agendado');
  });

  it('rejeita cancelamento de agendamento já cancelado', async () => {
    const agendamento = await prisma.agendamento.create({
      data: {
        usuarioId: user.id,
        profissionalId: profissional.id,
        dataHora: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'cancelado',
      },
    });

    const res = await request(app)
      .patch(`/api/agendamentos/${agendamento.id}/cancelar`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(409);
  });

  it('retorna 404 para agendamento inexistente', async () => {
    const res = await request(app)
      .patch(`/api/agendamentos/${uuidv4()}/cancelar`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

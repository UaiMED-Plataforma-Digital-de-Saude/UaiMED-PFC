import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

describe('Agendamentos — remarcar', () => {
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
        nome: 'Agenda Remarcar',
        email: `agremarcar-${unique}@example.com`,
        cpf: `rm${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11955555555',
        senha: hash,
        tipo: 'paciente',
      },
    });
    outroUsuario = await prisma.usuario.create({
      data: {
        nome: 'Outro Paciente Remarcar',
        email: `outrorm-${unique}@example.com`,
        cpf: `or${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11977777777',
        senha: hash,
        tipo: 'paciente',
      },
    });
    profUsuario = await prisma.usuario.create({
      data: {
        nome: 'Dr Remarcar',
        email: `drremarcar-${unique}@example.com`,
        cpf: `dr${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11966666666',
        senha: hash,
        tipo: 'medico',
      },
    });
    profissional = await prisma.profissional.create({
      data: {
        usuarioId: profUsuario.id,
        especialidade: 'Dermatologia',
        crm: `CRM-RM-${unique}`,
        dataFormacao: new Date(),
        endereco: 'Rua Y',
        cidade: 'BH',
        estado: 'MG',
        cep: '30100-000',
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

  it('remarca um agendamento futuro com mais de 24h de antecedência, mantendo o mesmo id', async () => {
    const agendamento = await prisma.agendamento.create({
      data: {
        usuarioId: user.id,
        profissionalId: profissional.id,
        dataHora: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'agendado',
      },
    });
    const novaDataHora = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

    const res = await request(app)
      .patch(`/api/agendamentos/${agendamento.id}/remarcar`)
      .set('Authorization', `Bearer ${token}`)
      .send({ dataHora: novaDataHora });

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(agendamento.id);
    expect(new Date(res.body.dataHora).toISOString()).toBe(novaDataHora);

    const atualizado = await prisma.agendamento.findUnique({ where: { id: agendamento.id } });
    expect(atualizado?.dataHora.toISOString()).toBe(novaDataHora);

    const log = await prisma.logAuditoria.findFirst({ where: { acao: 'REMARCAR_AGENDAMENTO', recursoId: agendamento.id } });
    expect(log).not.toBeNull();

    const total = await prisma.agendamento.count({ where: { usuarioId: user.id } });
    expect(total).toBe(1);
  });

  it('rejeita remarcação sem autenticação', async () => {
    const agendamento = await prisma.agendamento.create({
      data: {
        usuarioId: user.id,
        profissionalId: profissional.id,
        dataHora: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'agendado',
      },
    });

    const res = await request(app)
      .patch(`/api/agendamentos/${agendamento.id}/remarcar`)
      .send({ dataHora: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString() });
    expect(res.status).toBe(401);
  });

  it('rejeita remarcação de agendamento de outro usuário', async () => {
    const agendamento = await prisma.agendamento.create({
      data: {
        usuarioId: user.id,
        profissionalId: profissional.id,
        dataHora: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'agendado',
      },
    });

    const res = await request(app)
      .patch(`/api/agendamentos/${agendamento.id}/remarcar`)
      .set('Authorization', `Bearer ${outroToken}`)
      .send({ dataHora: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString() });

    expect(res.status).toBe(403);
  });

  it('rejeita remarcação com menos de 24h de antecedência da consulta atual', async () => {
    const agendamento = await prisma.agendamento.create({
      data: {
        usuarioId: user.id,
        profissionalId: profissional.id,
        dataHora: new Date(Date.now() + 2 * 60 * 60 * 1000),
        status: 'agendado',
      },
    });

    const res = await request(app)
      .patch(`/api/agendamentos/${agendamento.id}/remarcar`)
      .set('Authorization', `Bearer ${token}`)
      .send({ dataHora: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString() });

    expect(res.status).toBe(422);
  });

  it('rejeita remarcação para um horário já ocupado do mesmo profissional', async () => {
    const horarioOcupado = new Date(Date.now() + 96 * 60 * 60 * 1000);
    await prisma.agendamento.create({
      data: {
        usuarioId: user.id,
        profissionalId: profissional.id,
        dataHora: horarioOcupado,
        status: 'confirmado',
      },
    });
    const agendamento = await prisma.agendamento.create({
      data: {
        usuarioId: user.id,
        profissionalId: profissional.id,
        dataHora: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'agendado',
      },
    });

    const res = await request(app)
      .patch(`/api/agendamentos/${agendamento.id}/remarcar`)
      .set('Authorization', `Bearer ${token}`)
      .send({ dataHora: horarioOcupado.toISOString() });

    expect(res.status).toBe(409);
  });

  it('rejeita remarcação de agendamento já cancelado', async () => {
    const agendamento = await prisma.agendamento.create({
      data: {
        usuarioId: user.id,
        profissionalId: profissional.id,
        dataHora: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'cancelado',
      },
    });

    const res = await request(app)
      .patch(`/api/agendamentos/${agendamento.id}/remarcar`)
      .set('Authorization', `Bearer ${token}`)
      .send({ dataHora: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString() });

    expect(res.status).toBe(409);
  });

  it('rejeita dataHora inválida', async () => {
    const agendamento = await prisma.agendamento.create({
      data: {
        usuarioId: user.id,
        profissionalId: profissional.id,
        dataHora: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'agendado',
      },
    });

    const res = await request(app)
      .patch(`/api/agendamentos/${agendamento.id}/remarcar`)
      .set('Authorization', `Bearer ${token}`)
      .send({ dataHora: 'não-é-uma-data' });

    expect(res.status).toBe(400);
  });

  it('retorna 404 para agendamento inexistente', async () => {
    const res = await request(app)
      .patch(`/api/agendamentos/${uuidv4()}/remarcar`)
      .set('Authorization', `Bearer ${token}`)
      .send({ dataHora: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString() });

    expect(res.status).toBe(404);
  });
});

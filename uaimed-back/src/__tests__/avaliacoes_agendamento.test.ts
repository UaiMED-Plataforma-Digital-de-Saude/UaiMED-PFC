import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

describe('Avaliações vinculadas a um agendamento', () => {
  let user: any;
  let outroUsuario: any;
  let profUsuario: any;
  let profissional: any;
  let outroProfissional: any;
  let outroProfUsuario: any;
  let token: string;
  let outroToken: string;

  beforeAll(async () => {
    const unique = uuidv4();
    const hash = await bcrypt.hash('pass123', 8);

    user = await prisma.usuario.create({
      data: {
        nome: 'Paciente Avalia Consulta',
        email: `avag-${unique}@example.com`,
        cpf: `ag${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11933333333',
        senha: hash,
        tipo: 'paciente',
      },
    });
    outroUsuario = await prisma.usuario.create({
      data: {
        nome: 'Outro Paciente',
        email: `outroav-${unique}@example.com`,
        cpf: `oa${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11944444444',
        senha: hash,
        tipo: 'paciente',
      },
    });
    profUsuario = await prisma.usuario.create({
      data: {
        nome: 'Dr Avalia Consulta',
        email: `dravag-${unique}@example.com`,
        cpf: `dg${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11955555555',
        senha: hash,
        tipo: 'medico',
      },
    });
    profissional = await prisma.profissional.create({
      data: {
        usuarioId: profUsuario.id,
        especialidade: 'Clínica Geral',
        crm: `CRM-AG-${unique}`,
        dataFormacao: new Date(),
        endereco: 'Rua AG',
        cidade: 'BH',
        estado: 'MG',
        cep: '30000-000',
      },
    });
    outroProfUsuario = await prisma.usuario.create({
      data: {
        nome: 'Dr Outro',
        email: `droutro-${unique}@example.com`,
        cpf: `do${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11966666666',
        senha: hash,
        tipo: 'medico',
      },
    });
    outroProfissional = await prisma.profissional.create({
      data: {
        usuarioId: outroProfUsuario.id,
        especialidade: 'Dermatologia',
        crm: `CRM-OT-${unique}`,
        dataFormacao: new Date(),
        endereco: 'Rua OT',
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
    await prisma.avaliacao.deleteMany({ where: { usuarioId: { in: usuarioIds } } }).catch(() => {});
    await prisma.agendamento.deleteMany({ where: { usuarioId: { in: usuarioIds } } }).catch(() => {});
    await prisma.profissional.deleteMany({ where: { id: { in: [profissional?.id, outroProfissional?.id].filter(Boolean) } } }).catch(() => {});
    await prisma.usuario.deleteMany({ where: { id: { in: [profUsuario?.id, outroProfUsuario?.id].filter(Boolean) } } }).catch(() => {});
    await prisma.usuario.deleteMany({ where: { id: { in: usuarioIds } } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('avalia uma consulta concluída e marca avaliado=true em GET /agendamentos', async () => {
    const agendamento = await prisma.agendamento.create({
      data: { usuarioId: user.id, profissionalId: profissional.id, dataHora: new Date(Date.now() - 48 * 3600 * 1000), status: 'concluido' },
    });

    const res = await request(app)
      .post('/api/avaliacoes')
      .set('Authorization', `Bearer ${token}`)
      .send({ profissionalId: profissional.id, agendamentoId: agendamento.id, nota: 5, comentario: 'Excelente!' });
    expect(res.status).toBe(201);
    expect(res.body.agendamentoId).toBe(agendamento.id);

    const lista = await request(app).get('/api/agendamentos').set('Authorization', `Bearer ${token}`);
    const item = lista.body.find((a: any) => a.id === agendamento.id);
    expect(item.avaliado).toBe(true);
  });

  it('retorna avaliado=false para consulta concluída sem avaliação', async () => {
    const agendamento = await prisma.agendamento.create({
      data: { usuarioId: user.id, profissionalId: profissional.id, dataHora: new Date(Date.now() - 24 * 3600 * 1000), status: 'concluido' },
    });

    const lista = await request(app).get('/api/agendamentos').set('Authorization', `Bearer ${token}`);
    const item = lista.body.find((a: any) => a.id === agendamento.id);
    expect(item.avaliado).toBe(false);
  });

  it('rejeita avaliar agendamento de outro paciente', async () => {
    const agendamento = await prisma.agendamento.create({
      data: { usuarioId: user.id, profissionalId: profissional.id, dataHora: new Date(Date.now() - 24 * 3600 * 1000), status: 'concluido' },
    });

    const res = await request(app)
      .post('/api/avaliacoes')
      .set('Authorization', `Bearer ${outroToken}`)
      .send({ profissionalId: profissional.id, agendamentoId: agendamento.id, nota: 5 });
    expect(res.status).toBe(403);
  });

  it('rejeita avaliar consulta que ainda não foi realizada', async () => {
    const agendamento = await prisma.agendamento.create({
      data: { usuarioId: user.id, profissionalId: profissional.id, dataHora: new Date(Date.now() + 48 * 3600 * 1000), status: 'confirmado' },
    });

    const res = await request(app)
      .post('/api/avaliacoes')
      .set('Authorization', `Bearer ${token}`)
      .send({ profissionalId: profissional.id, agendamentoId: agendamento.id, nota: 5 });
    expect(res.status).toBe(422);
  });

  it('rejeita avaliação duplicada para o mesmo agendamento', async () => {
    const agendamento = await prisma.agendamento.create({
      data: { usuarioId: user.id, profissionalId: profissional.id, dataHora: new Date(Date.now() - 24 * 3600 * 1000), status: 'concluido' },
    });
    await request(app)
      .post('/api/avaliacoes')
      .set('Authorization', `Bearer ${token}`)
      .send({ profissionalId: profissional.id, agendamentoId: agendamento.id, nota: 4 });

    const res = await request(app)
      .post('/api/avaliacoes')
      .set('Authorization', `Bearer ${token}`)
      .send({ profissionalId: profissional.id, agendamentoId: agendamento.id, nota: 2 });
    expect(res.status).toBe(409);
  });

  it('rejeita quando profissionalId não corresponde ao profissional do agendamento', async () => {
    const agendamento = await prisma.agendamento.create({
      data: { usuarioId: user.id, profissionalId: profissional.id, dataHora: new Date(Date.now() - 24 * 3600 * 1000), status: 'concluido' },
    });

    const res = await request(app)
      .post('/api/avaliacoes')
      .set('Authorization', `Bearer ${token}`)
      .send({ profissionalId: outroProfissional.id, agendamentoId: agendamento.id, nota: 5 });
    expect(res.status).toBe(400);
  });

  it('retorna 404 para agendamentoId inexistente', async () => {
    const res = await request(app)
      .post('/api/avaliacoes')
      .set('Authorization', `Bearer ${token}`)
      .send({ profissionalId: profissional.id, agendamentoId: uuidv4(), nota: 5 });
    expect(res.status).toBe(404);
  });
});

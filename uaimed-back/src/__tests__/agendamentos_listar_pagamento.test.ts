import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

describe('Agendamentos — status de pagamento no GET /agendamentos', () => {
  let user: any;
  let profUsuario: any;
  let profissional: any;
  let agendamentoPago: any;
  let agendamentoNaoPago: any;
  let token: string;

  beforeAll(async () => {
    const unique = uuidv4();
    const hash = await bcrypt.hash('pass123', 8);

    user = await prisma.usuario.create({
      data: {
        nome: 'Paciente Pagamento',
        email: `agpag-${unique}@example.com`,
        cpf: `pg${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11955555555',
        senha: hash,
        tipo: 'paciente',
      },
    });
    profUsuario = await prisma.usuario.create({
      data: {
        nome: 'Dr Pagamento',
        email: `drpag-${unique}@example.com`,
        cpf: `dp${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11966666666',
        senha: hash,
        tipo: 'medico',
      },
    });
    profissional = await prisma.profissional.create({
      data: {
        usuarioId: profUsuario.id,
        especialidade: 'Ortopedia',
        crm: `CRM-PG-${unique}`,
        dataFormacao: new Date(),
        endereco: 'Rua X',
        cidade: 'SP',
        estado: 'SP',
        cep: '01000-000',
        precoConsulta: 180,
        pixKey: 'dr.pagamento@uaimed.com.br',
      },
    });

    agendamentoPago = await prisma.agendamento.create({
      data: { usuarioId: user.id, profissionalId: profissional.id, dataHora: new Date(Date.now() + 48 * 3600 * 1000), status: 'confirmado' },
    });
    agendamentoNaoPago = await prisma.agendamento.create({
      data: { usuarioId: user.id, profissionalId: profissional.id, dataHora: new Date(Date.now() + 72 * 3600 * 1000), status: 'agendado' },
    });
    await prisma.pagamento.create({
      data: {
        usuarioId: user.id,
        agendamentoId: agendamentoPago.id,
        valor: 180,
        desconto: 0,
        valorFinal: 180,
        metodo: 'pix',
        status: 'concluido',
      },
    });

    token = generateToken({ id: user.id, email: user.email, tipo: user.tipo });
  });

  afterAll(async () => {
    if (user?.id) await prisma.pagamento.deleteMany({ where: { usuarioId: user.id } }).catch(() => {});
    if (user?.id) await prisma.agendamento.deleteMany({ where: { usuarioId: user.id } }).catch(() => {});
    if (profissional?.id) await prisma.profissional.deleteMany({ where: { id: profissional.id } }).catch(() => {});
    if (profUsuario?.id) await prisma.usuario.deleteMany({ where: { id: profUsuario.id } }).catch(() => {});
    if (user?.id) await prisma.usuario.deleteMany({ where: { id: user.id } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('inclui pagamento concluído, valor e pixKey para um agendamento pago', async () => {
    const res = await request(app).get('/api/agendamentos').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const item = res.body.find((a: any) => a.id === agendamentoPago.id);
    expect(item).toBeDefined();
    expect(item.pagamento).toMatchObject({ status: 'concluido', valorFinal: 180, metodo: 'pix' });
    expect(item.valor).toBe(180);
    expect(item.pixKey).toBe('dr.pagamento@uaimed.com.br');
  });

  it('retorna pagamento null para um agendamento sem pagamento', async () => {
    const res = await request(app).get('/api/agendamentos').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const item = res.body.find((a: any) => a.id === agendamentoNaoPago.id);
    expect(item).toBeDefined();
    expect(item.pagamento).toBeNull();
    expect(item.valor).toBe(180);
  });
});

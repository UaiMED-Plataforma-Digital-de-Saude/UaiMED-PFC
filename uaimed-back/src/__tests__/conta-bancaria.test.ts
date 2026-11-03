import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { TipoUsuario } from '@prisma/client';

describe('Conta bancária — atualizar', () => {
  let clinica: any;
  let paciente: any;
  let token: string;
  let tokenPaciente: string;

  beforeAll(async () => {
    const unique = uuidv4();
    const hash = await bcrypt.hash('pass123', 8);

    clinica = await prisma.usuario.create({
      data: {
        nome: 'Clínica Conta Teste',
        email: `clinicaconta-${unique}@example.com`,
        cpf: `cc${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11911111111',
        senha: hash,
        tipo: 'clinica',
      },
    });
    token = generateToken({ id: clinica.id, email: clinica.email, tipo: clinica.tipo });

    paciente = await prisma.usuario.create({
      data: {
        nome: 'Paciente Conta Teste',
        email: `pacienteconta-${unique}@example.com`,
        cpf: `pc${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11922222222',
        senha: hash,
        tipo: 'paciente',
      },
    });
    tokenPaciente = generateToken({ id: paciente.id, email: paciente.email, tipo: paciente.tipo });
  });

  afterAll(async () => {
    await prisma.logAuditoria.deleteMany({ where: { pacienteId: { in: [clinica.id, paciente.id] } } }).catch(() => {});
    await prisma.usuario.deleteMany({ where: { id: { in: [clinica.id, paciente.id] } } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('atualiza dados bancários com dados válidos', async () => {
    const res = await request(app)
      .put('/api/conta-bancaria')
      .set('Authorization', `Bearer ${token}`)
      .send({ pixKey: 'chave@pix.com', banco: '001', agencia: '1234', conta: '56789', tipoConta: 'corrente' });
    expect(res.status).toBe(200);

    const log = await prisma.logAuditoria.findFirst({ where: { acao: 'ATUALIZAR_DADOS_BANCARIOS', pacienteId: clinica.id } });
    expect(log).not.toBeNull();
  });

  it('rejeita tipoConta inválido', async () => {
    const res = await request(app)
      .put('/api/conta-bancaria')
      .set('Authorization', `Bearer ${token}`)
      .send({ tipoConta: 'invalido' });
    expect(res.status).toBe(400);
  });

  it('rejeita atualização sem autenticação', async () => {
    const res = await request(app)
      .put('/api/conta-bancaria')
      .send({ tipoConta: 'corrente' });
    expect(res.status).toBe(401);
  });

  it('rejeita atualização para usuário que não é médico nem clínica', async () => {
    const res = await request(app)
      .put('/api/conta-bancaria')
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .send({ pixKey: 'chave@pix.com' });
    expect(res.status).toBe(403);
  });

  it('retorna 404 ao atualizar com token de usuário inexistente', async () => {
    const tokenFantasma = generateToken({ id: uuidv4(), email: 'fantasma@example.com', tipo: TipoUsuario.clinica });
    const res = await request(app)
      .put('/api/conta-bancaria')
      .set('Authorization', `Bearer ${tokenFantasma}`)
      .send({ pixKey: 'chave@pix.com' });
    expect(res.status).toBe(404);
  });
});

describe('Conta bancária — obter', () => {
  let medico: any;
  let profissional: any;
  let clinica: any;
  let paciente: any;
  let tokenMedico: string;
  let tokenClinica: string;
  let tokenPaciente: string;

  beforeAll(async () => {
    const unique = uuidv4();
    const hash = await bcrypt.hash('pass123', 8);

    medico = await prisma.usuario.create({
      data: {
        nome: 'Médico Conta Teste',
        email: `medicoconta-${unique}@example.com`,
        cpf: `mc${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11933333333',
        senha: hash,
        tipo: 'medico',
      },
    });
    profissional = await prisma.profissional.create({
      data: {
        usuarioId: medico.id,
        crm: `crm-${unique.slice(0, 10)}`,
        especialidade: 'Cardiologia',
        dataFormacao: new Date('2015-01-01'),
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        pixKey: 'medico@pix.com',
        banco: '237',
        agencia: '4321',
        conta: '98765',
        tipoConta: 'poupanca',
      },
    });
    tokenMedico = generateToken({ id: medico.id, email: medico.email, tipo: medico.tipo });

    clinica = await prisma.usuario.create({
      data: {
        nome: 'Clínica Obter Teste',
        email: `clinicaobter-${unique}@example.com`,
        cpf: `co${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11944444444',
        senha: hash,
        tipo: 'clinica',
        pixKey: 'clinica@pix.com',
        banco: '001',
        agencia: '1111',
        conta: '22222',
        tipoConta: 'corrente',
      },
    });
    tokenClinica = generateToken({ id: clinica.id, email: clinica.email, tipo: clinica.tipo });

    paciente = await prisma.usuario.create({
      data: {
        nome: 'Paciente Obter Teste',
        email: `pacienteobter-${unique}@example.com`,
        cpf: `po${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11955555555',
        senha: hash,
        tipo: 'paciente',
      },
    });
    tokenPaciente = generateToken({ id: paciente.id, email: paciente.email, tipo: paciente.tipo });
  });

  afterAll(async () => {
    await prisma.profissional.deleteMany({ where: { id: profissional.id } }).catch(() => {});
    await prisma.usuario.deleteMany({ where: { id: { in: [medico.id, clinica.id, paciente.id] } } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('retorna os dados bancários do Profissional quando o usuário é médico', async () => {
    const res = await request(app)
      .get('/api/conta-bancaria')
      .set('Authorization', `Bearer ${tokenMedico}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ pixKey: 'medico@pix.com', banco: '237', agencia: '4321', conta: '98765', tipoConta: 'poupanca' });
  });

  it('retorna os dados bancários do Usuario quando o usuário é clínica', async () => {
    const res = await request(app)
      .get('/api/conta-bancaria')
      .set('Authorization', `Bearer ${tokenClinica}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ pixKey: 'clinica@pix.com', banco: '001', agencia: '1111', conta: '22222', tipoConta: 'corrente' });
  });

  it('retorna os dados bancários do Usuario (nulos) quando o usuário é paciente', async () => {
    const res = await request(app)
      .get('/api/conta-bancaria')
      .set('Authorization', `Bearer ${tokenPaciente}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ pixKey: null, banco: null, agencia: null, conta: null, tipoConta: null });
  });

  it('rejeita consulta sem autenticação', async () => {
    const res = await request(app).get('/api/conta-bancaria');
    expect(res.status).toBe(401);
  });

  it('retorna 404 ao consultar com token de usuário inexistente', async () => {
    const tokenFantasma = generateToken({ id: uuidv4(), email: 'fantasma@example.com', tipo: TipoUsuario.medico });
    const res = await request(app)
      .get('/api/conta-bancaria')
      .set('Authorization', `Bearer ${tokenFantasma}`);
    expect(res.status).toBe(404);
  });

  it('atualiza os dados bancários do Profissional quando o usuário é médico', async () => {
    const res = await request(app)
      .put('/api/conta-bancaria')
      .set('Authorization', `Bearer ${tokenMedico}`)
      .send({ pixKey: 'medico-novo@pix.com', banco: '033', agencia: '5555', conta: '11122', tipoConta: 'corrente' });
    expect(res.status).toBe(200);

    const atualizado = await prisma.profissional.findUnique({ where: { id: profissional.id } });
    expect(atualizado).toMatchObject({ pixKey: 'medico-novo@pix.com', banco: '033', agencia: '5555', conta: '11122', tipoConta: 'corrente' });
  });
});

import request from 'supertest';
import { TipoUsuario } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import app from '../app';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';

describe('Conversas — paciente e médico', () => {
  let paciente: { id: string; email: string; tipo: TipoUsuario };
  let medico: { id: string; email: string; tipo: TipoUsuario };
  let profissional: { id: string };
  let conversaId: string;
  let tokenPaciente: string;
  let tokenMedico: string;

  beforeAll(async () => {
    const unique = uuidv4();
    const senha = await bcrypt.hash('pass123', 4);

    paciente = await prisma.usuario.create({
      data: {
        nome: 'Paciente Chat',
        email: `paciente-chat-${unique}@example.com`,
        cpf: `pc${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11911111111',
        senha,
        tipo: TipoUsuario.paciente,
      },
    });
    medico = await prisma.usuario.create({
      data: {
        nome: 'Médico Chat',
        email: `medico-chat-${unique}@example.com`,
        cpf: `mc${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11922222222',
        senha,
        tipo: TipoUsuario.medico,
      },
    });
    profissional = await prisma.profissional.create({
      data: {
        usuarioId: medico.id,
        especialidade: 'Clínica Médica',
        crm: `CRM-CHAT-${unique}`,
        dataFormacao: new Date('2018-01-01'),
        endereco: 'Rua do Chat, 1',
        cidade: 'Belo Horizonte',
        estado: 'MG',
        cep: '30000-000',
      },
    });

    tokenPaciente = generateToken(paciente);
    tokenMedico = generateToken(medico);
  });

  afterAll(async () => {
    if (conversaId) await prisma.conversa.deleteMany({ where: { id: conversaId } }).catch(() => {});
    if (profissional?.id) await prisma.profissional.deleteMany({ where: { id: profissional.id } }).catch(() => {});
    if (medico?.id) await prisma.usuario.deleteMany({ where: { id: medico.id } }).catch(() => {});
    if (paciente?.id) await prisma.usuario.deleteMany({ where: { id: paciente.id } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('permite ao paciente iniciar uma conversa com o médico', async () => {
    const resposta = await request(app)
      .post('/api/conversas')
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .send({ profissionalId: profissional.id, titulo: medico.email });

    expect(resposta.status).toBe(201);
    expect(resposta.body.usuarioId).toBe(paciente.id);
    expect(resposta.body.profissionalId).toBe(profissional.id);
    conversaId = resposta.body.id;
  });

  it('entrega a mensagem do paciente ao médico e marca como lida ao abrir', async () => {
    const envio = await request(app)
      .post(`/api/conversas/${conversaId}/mensagens`)
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .send({ texto: 'Olá, doutor!' });
    expect(envio.status).toBe(201);

    const lista = await request(app)
      .get('/api/conversas')
      .set('Authorization', `Bearer ${tokenMedico}`);
    expect(lista.status).toBe(200);
    expect(lista.body).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: conversaId, nomeOutro: 'Paciente Chat', naoLidas: 1 }),
    ]));

    const mensagens = await request(app)
      .get(`/api/conversas/${conversaId}/mensagens`)
      .set('Authorization', `Bearer ${tokenMedico}`);
    expect(mensagens.status).toBe(200);
    expect(mensagens.body[0]).toEqual(expect.objectContaining({
      texto: 'Olá, doutor!',
      remetenteId: paciente.id,
      lida: true,
    }));
  });

  it('permite ao médico responder e entrega a resposta ao paciente', async () => {
    const envio = await request(app)
      .post(`/api/conversas/${conversaId}/mensagens`)
      .set('Authorization', `Bearer ${tokenMedico}`)
      .send({ texto: 'Olá! Como posso ajudar?' });
    expect(envio.status).toBe(201);
    expect(envio.body.remetenteId).toBe(medico.id);

    const mensagens = await request(app)
      .get(`/api/conversas/${conversaId}/mensagens`)
      .set('Authorization', `Bearer ${tokenPaciente}`);
    expect(mensagens.status).toBe(200);
    expect(mensagens.body.at(-1)).toEqual(expect.objectContaining({
      texto: 'Olá! Como posso ajudar?',
      remetenteId: medico.id,
      lida: true,
    }));
  });

  it('não permite que o médico crie uma conversa como se fosse paciente', async () => {
    const resposta = await request(app)
      .post('/api/conversas')
      .set('Authorization', `Bearer ${tokenMedico}`)
      .send({ profissionalId: profissional.id });

    expect(resposta.status).toBe(403);
  });
});

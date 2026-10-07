
import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

describe('Contatos API', () => {
  let user: any;
  let profissionalUsuario: any;
  let profissional: any;
  let token: string;
  let medToken: string;

  beforeAll(async () => {
    // create user
    const unique = uuidv4();
    const passwordHash = await bcrypt.hash('testpass', 8);
    user = await prisma.usuario.create({ data: { nome: 'Test User', email: `testuser-${unique}@example.com`, cpf: `000${unique}`, telefone: '99999999', senha: passwordHash, tipo: 'paciente' } });

    // create professional user + profissional
    const profPass = await bcrypt.hash('profpass', 8);
    profissionalUsuario = await prisma.usuario.create({ data: { nome: 'Dr Test', email: `drtest-${unique}@example.com`, cpf: `111${unique}`, telefone: '98888888', senha: profPass, tipo: 'medico' } });

    profissional = await prisma.profissional.create({ data: { usuarioId: profissionalUsuario.id, especialidade: 'Cardiologia', crm: `CRM-${unique}`, dataFormacao: new Date(), endereco: 'Rua X', cidade: 'Cidade', estado: 'UF', cep: '00000-000' } });

    token = generateToken({ id: user.id, email: user.email, tipo: user.tipo });
    medToken = generateToken({ id: profissionalUsuario.id, email: profissionalUsuario.email, tipo: profissionalUsuario.tipo });
  });

  afterAll(async () => {
    // Limpeza específica por ID
    if (user?.id) await prisma.contato.deleteMany({ where: { usuarioId: user.id } }).catch(() => {});
    if (profissional?.id) await prisma.profissional.delete({ where: { id: profissional.id } }).catch(() => {});
    if (profissionalUsuario?.id) await prisma.usuario.deleteMany({ where: { id: profissionalUsuario.id } }).catch(() => {});
    if (user?.id) await prisma.usuario.deleteMany({ where: { id: user.id } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('should create a contato and list it', async () => {
    const payload = { profissionalId: profissional.id, assunto: 'Teste', mensagem: 'Mensagem de teste' };

    const res = await request(app)
      .post('/api/contatos')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.profissionalId).toBe(profissional.id);
    expect(res.body.assunto).toBe('Teste');

    const listRes = await request(app)
      .get('/api/contatos')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    // ensure the endpoint returns at least one contato for this usuario
    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body.length).toBeGreaterThan(0);

    // o contato listado já deve trazer o nome/telefone de quem enviou
    const criado = listRes.body.find((c: any) => c.id === res.body.id);
    expect(criado.usuario).toMatchObject({ id: user.id, nome: user.nome });
  });

  it('allows the recipient medico to mark a contato as lido', async () => {
    const criado = await request(app)
      .post('/api/contatos')
      .set('Authorization', `Bearer ${token}`)
      .send({ profissionalId: profissional.id, assunto: 'Outro teste', mensagem: 'Outra mensagem' })
      .expect(201);

    const patchRes = await request(app)
      .patch(`/api/contatos/${criado.body.id}/lido`)
      .set('Authorization', `Bearer ${medToken}`)
      .expect(200);

    expect(patchRes.body.status).toBe('lido');
  });

  it('rejects marking a contato as lido by someone who is not the recipient', async () => {
    const criado = await request(app)
      .post('/api/contatos')
      .set('Authorization', `Bearer ${token}`)
      .send({ profissionalId: profissional.id, assunto: 'Terceiro teste', mensagem: 'Terceira mensagem' })
      .expect(201);

    // o paciente (dono da mensagem, não o médico destinatário) não é 'medico' -> 403
    await request(app)
      .patch(`/api/contatos/${criado.body.id}/lido`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});

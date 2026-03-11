
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
  });

  afterAll(async () => {
    // cleanup created records
    await prisma.contato.deleteMany({ where: { usuarioId: user.id } });
    await prisma.profissional.delete({ where: { id: profissional.id } }).catch(() => {});
    await prisma.usuario.deleteMany({ where: { email: { contains: 'testuser-' } } }).catch(() => {});
    await prisma.usuario.deleteMany({ where: { email: { contains: 'drtest-' } } }).catch(() => {});
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
  });
});

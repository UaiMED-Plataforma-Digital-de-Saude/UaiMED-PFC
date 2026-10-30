import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

describe('Direitos do titular — exportar e excluir meus dados (LGPD)', () => {
  let user: any;
  let token: string;
  const senha = 'senha123';

  beforeAll(async () => {
    const unique = uuidv4();
    const hash = await bcrypt.hash(senha, 4);
    user = await prisma.usuario.create({
      data: {
        nome: 'Titular Teste',
        email: `titular-${unique}@example.com`,
        cpf: `ti${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11977776666',
        senha: hash,
        tipo: 'paciente',
        consentimentoLgpd: true,
      },
    });
    token = generateToken({ id: user.id, email: user.email, tipo: user.tipo });
  });

  afterAll(async () => {
    await prisma.logAuditoria.deleteMany({ where: { pacienteId: user.id } }).catch(() => {});
    await prisma.usuario.deleteMany({ where: { id: user.id } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('GET /users/me/dados exporta os dados pessoais e audita a exportação', async () => {
    const res = await request(app)
      .get('/api/users/me/dados')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.dadosPessoais.email).toBe(user.email);
    expect(res.body.dadosPessoais).not.toHaveProperty('senha');
    expect(res.body.resumoAtividade).toHaveProperty('agendamentos');

    const log = await prisma.logAuditoria.findFirst({ where: { acao: 'EXPORTAR_MEUS_DADOS', pacienteId: user.id } });
    expect(log).not.toBeNull();
  });

  it('rejeita GET /users/me/dados sem autenticação', async () => {
    const res = await request(app).get('/api/users/me/dados');
    expect(res.status).toBe(401);
  });

  it('DELETE /users/me anonimiza a conta, impede login futuro e audita a operação', async () => {
    const res = await request(app)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);

    const anonimizado = await prisma.usuario.findUnique({ where: { id: user.id } });
    expect(anonimizado?.nome).toBe('Usuário Removido');
    expect(anonimizado?.cpf).toBeNull();
    expect(anonimizado?.ativo).toBe(false);

    const loginDepois = await request(app).post('/api/sessions').send({ email: user.email, password: senha });
    expect(loginDepois.status).toBe(401);

    const log = await prisma.logAuditoria.findFirst({ where: { acao: 'EXCLUIR_CONTA', pacienteId: user.id } });
    expect(log).not.toBeNull();
  });

  it('rejeita DELETE /users/me sem autenticação', async () => {
    const res = await request(app).delete('/api/users/me');
    expect(res.status).toBe(401);
  });
});

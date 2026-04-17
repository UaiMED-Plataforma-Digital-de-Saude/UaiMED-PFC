import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

describe('Pagamentos endpoints', () => {
  let user: any;
  let profUsuario: any;
  let profissional: any;
  let agendamento: any;
  let token: string;
  let cupom: any;

  beforeAll(async () => {
    const unique = uuidv4();
    const hash = await bcrypt.hash('pass123', 8);

    user = await prisma.usuario.create({
      data: {
        nome: 'Pagante Teste',
        email: `pagante-${unique}@example.com`,
        cpf: `pg${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11933333333',
        senha: hash,
        tipo: 'paciente',
      },
    });
    profUsuario = await prisma.usuario.create({
      data: {
        nome: 'Dr Pag',
        email: `drpag-${unique}@example.com`,
        cpf: `dp${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11944444444',
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
        endereco: 'Av Principal',
        cidade: 'BH',
        estado: 'MG',
        cep: '31000-000',
      },
    });
    agendamento = await prisma.agendamento.create({
      data: {
        usuarioId: user.id,
        profissionalId: profissional.id,
        dataHora: new Date(Date.now() + 86400000),
        duracao: 30,
        status: 'confirmado',
      },
    });
    cupom = await prisma.cupom.create({
      data: {
        codigo: `TST${unique.slice(0, 5).toUpperCase()}`,
        desconto: 10,
        dataExpiracao: new Date(Date.now() + 86400000 * 30),
        ativo: true,
        usosAtuais: 0,
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
    if (cupom?.id) await prisma.cupom.deleteMany({ where: { id: cupom.id } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('processa pagamento com dados válidos', async () => {
    const res = await request(app)
      .post('/api/pagamentos')
      .set('Authorization', `Bearer ${token}`)
      .send({ agendamentoId: agendamento.id, valor: 200, metodo: 'pix' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe('concluido');
    expect(res.body.valorFinal).toBe(200);
  });

  it('processa pagamento com cupom de desconto (10%)', async () => {
    const ag2 = await prisma.agendamento.create({
      data: {
        usuarioId: user.id,
        profissionalId: profissional.id,
        dataHora: new Date(Date.now() + 172800000),
        duracao: 30,
        status: 'agendado',
      },
    });
    const res = await request(app)
      .post('/api/pagamentos')
      .set('Authorization', `Bearer ${token}`)
      .send({ agendamentoId: ag2.id, valor: 100, metodo: 'cartao_credito', cupom: cupom.codigo });
    expect(res.status).toBe(201);
    expect(res.body.valorFinal).toBe(90);
  });

  it('lista pagamentos do usuário autenticado', async () => {
    const res = await request(app)
      .get('/api/pagamentos')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('rejeita processamento de pagamento sem campos obrigatórios', async () => {
    const res = await request(app)
      .post('/api/pagamentos')
      .set('Authorization', `Bearer ${token}`)
      .send({ valor: 100 }); // falta agendamentoId e metodo
    expect(res.status).toBe(400);
  });

  it('rejeita listagem de pagamentos sem autenticação', async () => {
    const res = await request(app).get('/api/pagamentos');
    expect(res.status).toBe(401);
  });

  it('valida cupom válido', async () => {
    const res = await request(app)
      .post('/api/cupons/validar')
      .send({ codigo: cupom.codigo });
    expect(res.status).toBe(200);
    expect(res.body.valido).toBe(true);
    expect(res.body).toHaveProperty('desconto');
  });

  it('rejeita cupom inválido', async () => {
    const res = await request(app)
      .post('/api/cupons/validar')
      .send({ codigo: 'CUPOMINEXISTENTE99' });
    expect(res.status).toBe(400);
    expect(res.body.valido).toBe(false);
  });

  it('rejeita validação de cupom sem código', async () => {
    const res = await request(app)
      .post('/api/cupons/validar')
      .send({});
    expect(res.status).toBe(400);
  });
});


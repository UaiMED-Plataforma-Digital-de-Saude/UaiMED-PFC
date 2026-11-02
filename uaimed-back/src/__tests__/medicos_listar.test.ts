import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

describe('GET /medicos — avaliação média e paginação', () => {
  let pacienteUsuario: any;
  let profUsuarioA: any;
  let profissionalA: any;
  let profUsuarioB: any;
  let profissionalB: any;

  beforeAll(async () => {
    const unique = uuidv4();
    const hash = await bcrypt.hash('pass123', 8);

    pacienteUsuario = await prisma.usuario.create({
      data: {
        nome: 'Paciente Lista Medicos',
        email: `pacmed-${unique}@example.com`,
        cpf: `pm${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11911112222',
        senha: hash,
        tipo: 'paciente',
      },
    });
    profUsuarioA = await prisma.usuario.create({
      data: {
        nome: 'Dr Lista A',
        email: `dla-${unique}@example.com`,
        cpf: `da${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11922223333',
        senha: hash,
        tipo: 'medico',
      },
    });
    profissionalA = await prisma.profissional.create({
      data: {
        usuarioId: profUsuarioA.id,
        especialidade: 'Lista Geral',
        crm: `CRM-LA-${unique}`,
        dataFormacao: new Date(),
        endereco: 'Rua LA',
        cidade: 'BH',
        estado: 'MG',
        cep: '30000-000',
      },
    });
    profUsuarioB = await prisma.usuario.create({
      data: {
        nome: 'Dr Lista B',
        email: `dlb-${unique}@example.com`,
        cpf: `db${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11933334444',
        senha: hash,
        tipo: 'medico',
      },
    });
    profissionalB = await prisma.profissional.create({
      data: {
        usuarioId: profUsuarioB.id,
        especialidade: 'Lista Geral',
        crm: `CRM-LB-${unique}`,
        dataFormacao: new Date(),
        endereco: 'Rua LB',
        cidade: 'BH',
        estado: 'MG',
        cep: '30100-000',
      },
    });

    await prisma.avaliacao.createMany({
      data: [
        { usuarioId: pacienteUsuario.id, profissionalId: profissionalA.id, nota: 5 },
        { usuarioId: pacienteUsuario.id, profissionalId: profissionalA.id, nota: 3 },
      ],
    });
  });

  afterAll(async () => {
    await prisma.avaliacao.deleteMany({ where: { profissionalId: { in: [profissionalA?.id, profissionalB?.id].filter(Boolean) } } }).catch(() => {});
    await prisma.profissional.deleteMany({ where: { id: { in: [profissionalA?.id, profissionalB?.id].filter(Boolean) } } }).catch(() => {});
    await prisma.usuario.deleteMany({ where: { id: { in: [profUsuarioA?.id, profUsuarioB?.id, pacienteUsuario?.id].filter(Boolean) } } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('retorna notaMedia e totalAvaliacoes agregados por profissional', async () => {
    const res = await request(app).get('/api/medicos').query({ especialidade: 'Lista Geral' });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const a = res.body.find((p: any) => p.id === profissionalA.id);
    const b = res.body.find((p: any) => p.id === profissionalB.id);
    expect(a).toMatchObject({ notaMedia: 4, totalAvaliacoes: 2 });
    expect(b).toMatchObject({ notaMedia: null, totalAvaliacoes: 0 });
  });

  it('respeita skip/take e expõe o total no header X-Total-Count', async () => {
    const res = await request(app).get('/api/medicos').query({ especialidade: 'Lista Geral', take: 1, skip: 0 });
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(Number(res.headers['x-total-count'])).toBeGreaterThanOrEqual(2);
  });

  it('limita take ao teto de 100', async () => {
    const res = await request(app).get('/api/medicos').query({ especialidade: 'Lista Geral', take: 9999 });
    expect(res.status).toBe(200);
    expect(res.body.length).toBeLessThanOrEqual(100);
  });
});

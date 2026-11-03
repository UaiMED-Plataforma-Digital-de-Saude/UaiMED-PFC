import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

describe('Convênios do profissional — GET/PUT /professionals/me/convenios', () => {
  let medico: any;
  let profissional: any;
  let paciente: any;
  let tokenMedico: string;
  let tokenPaciente: string;

  beforeAll(async () => {
    const unique = uuidv4();
    const hash = await bcrypt.hash('pass123', 8);

    medico = await prisma.usuario.create({
      data: {
        nome: 'Médico Convênios Teste',
        email: `medconv-${unique}@example.com`,
        cpf: `mc${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11966666666',
        senha: hash,
        tipo: 'medico',
      },
    });
    profissional = await prisma.profissional.create({
      data: {
        usuarioId: medico.id,
        crm: `convcrm-${unique.slice(0, 10)}`,
        especialidade: 'Cardiologia',
        dataFormacao: new Date('2015-01-01'),
        endereco: '', cidade: '', estado: '', cep: '',
        convenios: ['Unimed'],
      },
    });
    tokenMedico = generateToken({ id: medico.id, email: medico.email, tipo: medico.tipo });

    paciente = await prisma.usuario.create({
      data: {
        nome: 'Paciente Convênios Teste',
        email: `pacconv-${unique}@example.com`,
        cpf: `pc${unique.replace(/-/g, '').slice(0, 9)}`,
        telefone: '11977777777',
        senha: hash,
        tipo: 'paciente',
      },
    });
    tokenPaciente = generateToken({ id: paciente.id, email: paciente.email, tipo: paciente.tipo });
  });

  afterAll(async () => {
    await prisma.usuario.deleteMany({ where: { id: { in: [medico.id, paciente.id] } } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('retorna os convênios já cadastrados do profissional autenticado', async () => {
    const res = await request(app)
      .get('/api/professionals/me/convenios')
      .set('Authorization', `Bearer ${tokenMedico}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(['Unimed']);
  });

  it('rejeita consulta sem autenticação', async () => {
    const res = await request(app).get('/api/professionals/me/convenios');
    expect(res.status).toBe(401);
  });

  it('rejeita consulta de usuário que não é médico', async () => {
    const res = await request(app)
      .get('/api/professionals/me/convenios')
      .set('Authorization', `Bearer ${tokenPaciente}`);
    expect(res.status).toBe(403);
  });

  it('substitui a lista de convênios aceitos', async () => {
    const res = await request(app)
      .put('/api/professionals/me/convenios')
      .set('Authorization', `Bearer ${tokenMedico}`)
      .send(['Bradesco Saúde', 'Amil', 'Particular']);
    expect(res.status).toBe(200);
    expect(res.body.sort()).toEqual(['Amil', 'Bradesco Saúde', 'Particular'].sort());

    const atualizado = await prisma.profissional.findUnique({ where: { id: profissional.id } });
    expect(atualizado?.convenios.sort()).toEqual(['Amil', 'Bradesco Saúde', 'Particular'].sort());
  });

  it('aceita lista vazia (remove todos os convênios)', async () => {
    const res = await request(app)
      .put('/api/professionals/me/convenios')
      .set('Authorization', `Bearer ${tokenMedico}`)
      .send([]);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('remove duplicatas da lista enviada', async () => {
    const res = await request(app)
      .put('/api/professionals/me/convenios')
      .set('Authorization', `Bearer ${tokenMedico}`)
      .send(['Unimed', 'Unimed', 'Amil']);
    expect(res.status).toBe(200);
    expect(res.body.sort()).toEqual(['Amil', 'Unimed']);
  });

  it('rejeita convênio fora do catálogo', async () => {
    const res = await request(app)
      .put('/api/professionals/me/convenios')
      .set('Authorization', `Bearer ${tokenMedico}`)
      .send(['Convênio Inexistente']);
    expect(res.status).toBe(400);
  });

  it('rejeita atualização de usuário que não é médico', async () => {
    const res = await request(app)
      .put('/api/professionals/me/convenios')
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .send(['Unimed']);
    expect(res.status).toBe(403);
  });

  it('rejeita atualização sem autenticação', async () => {
    const res = await request(app).put('/api/professionals/me/convenios').send(['Unimed']);
    expect(res.status).toBe(401);
  });
});

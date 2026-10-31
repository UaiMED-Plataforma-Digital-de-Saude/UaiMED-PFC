import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { v4 as uuid } from 'uuid';
import { TipoUsuario } from '@prisma/client';
import app from '../app';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';

describe('Perfil profissional — CRM e resumo das avaliações', () => {
  const unique = uuid();
  const numeros = unique.replace(/\D/g, '').padEnd(10, '0').slice(0, 10);
  const crmNovo = `CRM${numeros}-MG`;
  const crmOutro = `b${numeros}`;
  const usuarios: string[] = [];
  let medicoId: string;
  let outroMedicoId: string;
  let pacienteId: string;
  let profissionalId: string;
  let outroProfissionalId: string;
  let tokenMedico: string;
  let tokenOutro: string;
  let tokenPaciente: string;
  let tokenSemPerfil: string;

  beforeAll(async () => {
    const contas = [];
    for (const [indice, tipo] of [TipoUsuario.medico, TipoUsuario.medico, TipoUsuario.paciente, TipoUsuario.medico].entries()) {
      const conta = await prisma.usuario.create({ data: {
        nome: `Perfil Teste ${indice}`, email: `perfil-${indice}-${unique}@example.com`,
        telefone: '31999999999', senha: 'hash-nao-usado-nestes-testes', tipo,
      } });
      usuarios.push(conta.id);
      contas.push(conta);
    }
    [medicoId, outroMedicoId, pacienteId] = contas.map((conta) => conta.id);
    [tokenMedico, tokenOutro, tokenPaciente, tokenSemPerfil] = contas.map((conta) => generateToken({ id: conta.id, email: conta.email, tipo: conta.tipo }));
    const profissionais = [];
    for (const [indice, usuarioId] of [medicoId, outroMedicoId].entries()) {
      profissionais.push(await prisma.profissional.create({ data: {
        usuarioId, crm: indice === 0 ? `A${numeros}` : crmOutro,
        especialidade: 'Cardiologia', dataFormacao: new Date('2015-01-01'),
        endereco: '', cidade: '', estado: '', cep: '', pixKey: 'nao-expor-na-resposta',
      } }));
    }
    [profissionalId, outroProfissionalId] = profissionais.map((profissional) => profissional.id);
    await prisma.avaliacao.createMany({ data: [5, 4].map((nota) => ({ usuarioId: pacienteId, profissionalId, nota })) });
  });

  afterAll(async () => {
    await prisma.avaliacao.deleteMany({ where: { profissionalId: { in: [profissionalId, outroProfissionalId].filter(Boolean) } } });
    await prisma.usuario.deleteMany({ where: { id: { in: usuarios } } });
    await prisma.$disconnect();
  });

  it('salva e normaliza somente o CRM do médico autenticado, sem exigir endereço', async () => {
    const res = await request(app).put('/api/users/me').set('Authorization', `Bearer ${tokenMedico}`)
      .send({ crm: ` ${crmNovo.toLowerCase()} `, usuarioId: outroMedicoId, profissionalId: outroProfissionalId });
    expect(res.status).toBe(200);
    expect(res.body.user.profissional).toEqual({ id: profissionalId, crm: crmNovo });
    expect(res.body.user).not.toHaveProperty('senha');
    expect(res.body.user.profissional).not.toHaveProperty('pixKey');
    expect((await prisma.profissional.findUniqueOrThrow({ where: { usuarioId: medicoId } })).crm).toBe(crmNovo);
    expect((await prisma.profissional.findUniqueOrThrow({ where: { usuarioId: outroMedicoId } })).crm).toBe(crmOutro);
  });

  it('rejeita CRM de outro médico sem diferenciar maiúsculas e sem alterar o nome', async () => {
    const antes = await prisma.usuario.findUniqueOrThrow({ where: { id: medicoId } });
    const res = await request(app).put('/api/users/me').set('Authorization', `Bearer ${tokenMedico}`)
      .send({ nome: 'Não deve ser salvo', crm: crmOutro.toUpperCase() });
    expect(res.status).toBe(409);
    expect(res.body.error).toContain('CRM já cadastrado');
    expect((await prisma.usuario.findUniqueOrThrow({ where: { id: medicoId } })).nome).toBe(antes.nome);
    expect((await prisma.profissional.findUniqueOrThrow({ where: { usuarioId: medicoId } })).crm).toBe(crmNovo);
  });

  it.each(['', '   ', 'ABC', 'CRM@123', '1'.repeat(21)])('rejeita CRM vazio, malformado ou excessivo: %s', async (crm) => {
    const res = await request(app).put('/api/users/me').set('Authorization', `Bearer ${tokenMedico}`).send({ crm });
    expect(res.status).toBe(400);
    expect(res.body.details.some((item: { path: string[] }) => item.path[0] === 'crm')).toBe(true);
  });

  it('exige autenticação e bloqueia alteração de CRM por paciente', async () => {
    expect((await request(app).put('/api/users/me').send({ crm: crmNovo })).status).toBe(401);
    expect((await request(app).put('/api/users/me').set('Authorization', `Bearer ${tokenPaciente}`).send({ crm: crmNovo })).status).toBe(403);
  });

  it('retorna 404 se a conta médica não possui perfil profissional', async () => {
    const res = await request(app).put('/api/users/me').set('Authorization', `Bearer ${tokenSemPerfil}`).send({ crm: crmNovo });
    expect(res.status).toBe(404);
  });

  it('retorna a mesma média e quantidade no perfil e na lista de avaliações recebidas', async () => {
    const resumo = await request(app).get(`/api/avaliacoes/medico/${profissionalId}/media`);
    const recebidas = await request(app).get('/api/professionals/me/avaliacoes').set('Authorization', `Bearer ${tokenMedico}`);
    expect(resumo.status).toBe(200);
    expect(recebidas.status).toBe(200);
    expect(resumo.body).toMatchObject({ notaMedia: 4.5, totalAvaliacoes: 2 });
    expect(recebidas.body).toMatchObject({ notaMedia: 4.5, totalAvaliacoes: 2 });
  });

  it('identifica profissional sem avaliações sem usar avaliações de outro médico', async () => {
    const resumo = await request(app).get(`/api/avaliacoes/medico/${outroProfissionalId}/media`);
    const recebidas = await request(app).get('/api/professionals/me/avaliacoes').set('Authorization', `Bearer ${tokenOutro}`);
    expect(resumo.body).toMatchObject({ notaMedia: 0, totalAvaliacoes: 0 });
    expect(recebidas.body).toMatchObject({ notaMedia: 0, totalAvaliacoes: 0, avaliacoes: [] });
  });

  it('atualiza média e total depois de uma nova avaliação', async () => {
    await prisma.avaliacao.create({ data: { usuarioId: pacienteId, profissionalId, nota: 2 } });
    const resumo = await request(app).get(`/api/avaliacoes/medico/${profissionalId}/media`);
    expect(resumo.body).toMatchObject({ notaMedia: 3.7, totalAvaliacoes: 3 });
  });
});

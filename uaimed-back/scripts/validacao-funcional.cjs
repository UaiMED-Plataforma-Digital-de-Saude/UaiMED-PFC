// Diagnóstico de comportamento: usa somente fixtures próprias em uaimed_test.
// Execute na pasta uaimed-back: node scripts/validacao-funcional.cjs
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.test'), override: true });
const dbUrl = new URL(process.env.DATABASE_URL);
if (!['localhost', '127.0.0.1'].includes(dbUrl.hostname) || dbUrl.pathname !== '/uaimed_test') {
  throw new Error('Diagnóstico permitido apenas no banco local uaimed_test.');
}
process.env.NODE_ENV = 'test';
require('ts-node/register/transpile-only');
const request = require('supertest');
const { randomUUID } = require('crypto');
const app = require('../src/app').default;
const { prisma } = require('../src/config/database');
const { generateToken } = require('../src/utils/jwt');
// Carrega o cálculo da UI diretamente do fonte para comparar a mesma regra.
const { transformSync } = require('esbuild');
const paymentsSource = fs.readFileSync(path.resolve(__dirname, '../../uaimed-front/hooks/usePayments.ts'), 'utf8');
const calculateSource = paymentsSource.match(/const calcularValorFinal = ([\s\S]*?)\n  };\r?\n/);
if (!calculateSource) throw new Error('Cálculo do frontend não encontrado.');
const calculateJs = transformSync('module.exports = ' + calculateSource[1] + '\n};', { loader: 'ts' }).code;
const calcModule = { exports: {} };
new Function('module', calculateJs)(calcModule);
const calcularValorFinal = calcModule.exports;
const results = [];
const userIds = [];
const couponIds = [];
const tag = randomUUID();
const record = (id, actual, expected) => results.push({ id, actual, expected });

async function main() {
  const makeUser = async (tipo) => {
    const user = await prisma.usuario.create({ data: {
      nome: 'Auditoria Funcional', email: `${tipo}-${tag}@audit.invalid`,
      telefone: '31999999999', senha: 'fixture-sem-login', tipo,
    } });
    userIds.push(user.id);
    return user;
  };
  const patient = await makeUser('paciente');
  const doctor = await makeUser('medico');
  const professional = await prisma.profissional.create({ data: {
    usuarioId: doctor.id, especialidade: 'Cardiologia', crm: `AUD-${tag}`,
    dataFormacao: new Date('2020-01-01'), endereco: 'Rua Auditoria',
    cidade: 'Belo Horizonte', estado: 'MG', cep: '30000000', precoConsulta: 100,
  } });
  const token = generateToken({ id: patient.id, email: patient.email, tipo: 'paciente' });
  const doctorToken = generateToken({ id: doctor.id, email: doctor.email, tipo: 'medico' });
  const post = (url, data) => request(app).post(`/api${url}`).set('Authorization', `Bearer ${token}`).send(data);
  const book = (date) => post('/agendamentos', { medicoId: professional.id, dataHora: date.toISOString() });
  const future = new Date();
  future.setDate(future.getDate() + 10);
  future.setHours(14, 0, 0, 0);

  record('recuperacao_senha', (await post('/password-recovery', { email: patient.email })).body, 'Solicitação de recuperação processada');
  record('data_passada', (await book(new Date('2020-01-01T14:00:00Z'))).status, 'Rejeitar data passada');
  const outside = new Date(future); outside.setHours(3);
  record('fora_expediente', (await book(outside)).status, 'Rejeitar horário fora do expediente');
  const initialBooking = await book(future);
  const cancellation = await request(app).patch(`/api/agendamentos/${initialBooking.body.id}/cancelar`).set('Authorization', `Bearer ${token}`);
  record('cancelamento', { http: cancellation.status, body: cancellation.body }, 'Cancelar agendamento existente');
  const overlap = new Date(future.getTime() + 15 * 60000);
  record('sobreposicao_30_minutos', (await book(overlap)).status, 'Rejeitar sobreposição com consulta de 30 minutos');
  const simultaneousDate = new Date(future.getTime() + 86400000);
  const simultaneous = await Promise.all(Array.from({ length: 8 }, () => book(simultaneousDate)));
  record('reserva_concorrente', simultaneous.map(r => r.status), 'Exatamente uma criação 201; demais requisições em conflito 409');

  const sunday = new Date(future);
  while (sunday.getDay() !== 0) sunday.setDate(sunday.getDate() + 1);
  const dateKey = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`;
  const availability = await request(app).get('/api/professionals/me/disponibilidade').set('Authorization', `Bearer ${doctorToken}`);
  const slots = await request(app).get('/api/agendamentos/sugestoes-horario').query({ medicoId: professional.id, data: dateKey });
  record('domingo_sem_configuracao', { medicoExibeAtivo: availability.body.find(d => d.diaSemana === 0).ativo, slotsPaciente: slots.body.length }, 'Ambos os fluxos devem concordar sobre disponibilidade');

  const paymentBooking = await book(new Date(future.getTime() + 2 * 86400000));
  const coupon = await prisma.cupom.create({ data: {
    codigo: `AUD-${tag}`.toUpperCase(), desconto: 10, dataExpiracao: new Date(Date.now() + 86400000),
    usosLimite: 1, usosAtuais: 1,
  } });
  couponIds.push(coupon.id);
  const couponValidation = await post('/cupons/validar', { codigo: coupon.codigo });
  const payBody = { agendamentoId: paymentBooking.body.id, valor: 100, metodo: 'pix', usingPlan: true, cupom: coupon.codigo };
  const payment = await post('/pagamentos', payBody);
  record('cupom_esgotado', { validacao: couponValidation.status, pagamento: payment.status }, 'Pagamento deve respeitar o limite que a validação aplica');
  record('desconto_divergente', { tela: calcularValorFinal(100, true, 10), backend: payment.body.valorFinal }, 'O valor mostrado e o registrado devem ser iguais');
  const paidBooking = await prisma.agendamento.findUnique({ where: { id: paymentBooking.body.id } });
  record('pagamento_e_consulta', { pagamento: payment.body.status, consulta: paidBooking.status }, 'Definir e aplicar transição coerente do ciclo da consulta');
  const beforeRetry = await prisma.cupom.findUnique({ where: { id: coupon.id } });
  const retry = await post('/pagamentos', payBody);
  const afterRetry = await prisma.cupom.findUnique({ where: { id: coupon.id } });
  record('repetir_pagamento', { http: retry.status, usosAntes: beforeRetry.usosAtuais, usosDepois: afterRetry.usosAtuais }, 'Repetição idempotente, sem consumir cupom em pagamento rejeitado');

  const ratingResults = [];
  for (let i = 0; i < 6; i++) {
    const rating = await post('/avaliacoes', { profissionalId: professional.id, nota: i === 0 ? 1 : 5, comentario: 'Fixture auditoria' });
    ratingResults.push(rating.status);
  }
  record('avaliacoes_antes_consulta_e_repetidas', ratingResults, 'Exigir consulta realizada e impedir repetição da mesma avaliação');
  // Datas determinísticas garantem qual avaliação fica fora do recorte das últimas cinco.
  const ratings = await prisma.avaliacao.findMany({ where: { profissionalId: professional.id }, orderBy: { criado_em: 'asc' } });
  for (let i = 0; i < ratings.length; i++) {
    await prisma.avaliacao.update({ where: { id: ratings[i].id }, data: { criado_em: new Date(Date.UTC(2020, 0, i + 1)) } });
  }
  const detail = await request(app).get(`/api/medicos/${professional.id}`);
  const average = await request(app).get(`/api/avaliacoes/medico/${professional.id}/media`);
  record('medias_divergentes', { perfil: detail.body.notaMedia, endpointMedia: average.body.notaMedia, total: detail.body.totalAvaliacoes }, 'Média global igual nas duas respostas');
  const savedNotifications = await post('/users/me/notifications', { email: false, push: false });
  const persistedUser = await prisma.usuario.findUnique({ where: { id: patient.id } });
  record('preferencias_notificacao', { http: savedNotifications.status, camposPersistidos: Object.keys(persistedUser).filter(k => /notif|push/i.test(k)) }, 'Persistir e recuperar as preferências salvas');
  const appointments = await request(app).get('/api/agendamentos').set('Authorization', `Bearer ${token}`);
  record('retomar_pagamento', { campos: Object.keys(appointments.body[0]) }, 'Listagem deve permitir identificar pendência e retomar pagamento');
}

main().catch(err => { console.error(err); process.exitCode = 1; }).finally(async () => {
  // Cascades removem exclusivamente as fixtures criadas nesta execução.
  if (userIds.length) await prisma.usuario.deleteMany({ where: { id: { in: userIds } } });
  if (couponIds.length) await prisma.cupom.deleteMany({ where: { id: { in: couponIds } } });
  await prisma.$disconnect();
  const output = path.resolve(__dirname, '../../documents/VALIDACAO_FUNCIONAL_2026-10-18_RESULTADOS.json');
  fs.writeFileSync(output, JSON.stringify({ executadoEm: new Date().toISOString(), cenarios: results }, null, 2) + '\n');
  console.log(JSON.stringify(results, null, 2));
});

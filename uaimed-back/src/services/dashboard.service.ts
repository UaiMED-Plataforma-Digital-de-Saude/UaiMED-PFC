import { prisma } from "../config/database";

export interface SeriePonto {
  count: number;
  revenue: number;
}

export interface SerieDiaria extends SeriePonto {
  day: string;
}

export interface SerieMensal extends SeriePonto {
  month: string;
}

async function contarEReceberNoPeriodo(profissionalIds: string[], inicio: Date, fim: Date): Promise<SeriePonto> {
  const [count, receitaAgg] = await Promise.all([
    prisma.agendamento.count({
      where: { profissionalId: { in: profissionalIds }, dataHora: { gte: inicio, lt: fim } },
    }),
    prisma.pagamento.aggregate({
      where: { agendamento: { profissionalId: { in: profissionalIds }, dataHora: { gte: inicio, lt: fim } } },
      _sum: { valorFinal: true },
    }),
  ]);

  return { count, revenue: receitaAgg._sum.valorFinal ?? 0 };
}

/**
 * Série dos últimos 7 dias (hoje incluso) de agendamentos/receita, por
 * profissionalId — recebe uma lista pra poder ser reaproveitada pelo
 * dashboard da clínica (vários profissionais vinculados), hoje usada só
 * com um profissional (o médico autenticado).
 */
export async function getWeeklySeries(profissionalIds: string[]): Promise<SerieDiaria[]> {
  const dias: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    dias.push(d);
  }

  return Promise.all(dias.map(async (inicio) => {
    const fim = new Date(inicio);
    fim.setDate(fim.getDate() + 1);
    const ponto = await contarEReceberNoPeriodo(profissionalIds, inicio, fim);
    return { day: inicio.toISOString().slice(0, 10), ...ponto };
  }));
}

/**
 * Série dos últimos 6 meses (mês atual incluso) de agendamentos/receita.
 */
export async function getMonthlySeries(profissionalIds: string[]): Promise<SerieMensal[]> {
  const meses: Date[] = [];
  const agora = new Date();
  for (let i = 5; i >= 0; i--) {
    meses.push(new Date(agora.getFullYear(), agora.getMonth() - i, 1));
  }

  return Promise.all(meses.map(async (inicio) => {
    const fim = new Date(inicio.getFullYear(), inicio.getMonth() + 1, 1);
    const ponto = await contarEReceberNoPeriodo(profissionalIds, inicio, fim);
    return { month: inicio.toISOString().slice(0, 7), ...ponto };
  }));
}

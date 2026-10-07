import { Request, Response } from "express";
import { prisma } from "../config/database";
import logger from "../utils/logger";

interface JanelaDia {
  ativo: boolean;
  inicioMin: number;
  fimMin: number;
}

function paraMinutos(horaHHmm: string): number {
  const [h, m] = horaHHmm.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Resolve a janela de atendimento (ativo + intervalo em minutos) de um dia da
 * semana. Sem configuração (médico nunca definiu disponibilidade), cai no
 * comportamento padrão de sempre: ativo, 08:00-17:00.
 */
function janelaDoDia(diaSemana: number, config: Map<number, { ativo: boolean; horaInicio: string; horaFim: string }>): JanelaDia {
  const dia = config.get(diaSemana);
  if (!dia) return { ativo: true, inicioMin: 8 * 60, fimMin: 17 * 60 };
  return { ativo: dia.ativo, inicioMin: paraMinutos(dia.horaInicio), fimMin: paraMinutos(dia.horaFim) };
}

class AgendamentosController {
  // POST /api/agendamentos
  async criar(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).user?.id;
      if (!usuarioId) return res.status(401).json({ error: 'Usuário não autenticado' });

      const { medicoId, dataHora, observacoes } = req.body;

      // Verifica se o usuário ainda existe na DB (token pode ter userId de sessão antiga)
      const usuarioExiste = await prisma.usuario.findUnique({ where: { id: usuarioId } });
      if (!usuarioExiste) {
        return res.status(401).json({ error: 'Sessão inválida. Faça login novamente.' });
      }

      // Verifica se o profissional existe
      const profissional = await prisma.profissional.findUnique({ where: { id: String(medicoId) } });
      if (!profissional) return res.status(404).json({ error: 'Profissional não encontrado' });

      // Verifica conflito de horário
      const conflito = await prisma.agendamento.findFirst({
        where: {
          profissionalId: String(medicoId),
          dataHora: new Date(dataHora),
          status: { in: ['agendado', 'confirmado'] },
        },
      });
      if (conflito) return res.status(409).json({ error: 'Horário já ocupado para este profissional' });

      const agendamento = await prisma.agendamento.create({
        data: {
          usuarioId,
          profissionalId: String(medicoId),
          dataHora: new Date(dataHora),
          observacoes: observacoes ?? null,
          status: 'agendado',
        },
      });

      logger.success(`Agendamento criado: ${agendamento.id}`);
      return res.status(201).json({
        id: agendamento.id,
        status: agendamento.status,
        dataHora: agendamento.dataHora,
        profissionalId: agendamento.profissionalId,
        valor: profissional.precoConsulta,
      });
    } catch (err: any) {
      logger.error('Erro ao criar agendamento', err);
      const detail = process.env.NODE_ENV !== 'production' ? (err?.message ?? String(err)) : undefined;
      // P2003 = FK constraint violation (usuário ou profissional não existe)
      if (err?.code === 'P2003') {
        return res.status(422).json({ error: 'Referência inválida: usuário ou profissional não encontrado. Faça login novamente.', detail });
      }
      // P2002 = unique constraint (agendamento duplicado exato)
      if (err?.code === 'P2002') {
        return res.status(409).json({ error: 'Já existe um agendamento neste horário.', detail });
      }
      return res.status(500).json({ error: 'Erro ao criar agendamento', detail });
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const agendamentos = await prisma.agendamento.findMany({
        where: { usuarioId: userId },
        include: { profissional: { include: { usuario: true } } },
        orderBy: { dataHora: 'desc' },
      });

      const mapped = agendamentos.map(a => ({
        id: a.id,
        medicoId: a.profissionalId,
        medico: a.profissional?.usuario?.nome || null,
        especialidade: a.profissional?.especialidade || null,
        data: a.dataHora,
        status: a.status,
        endereco: a.profissional?.endereco || null,
        cidade: a.profissional?.cidade || null,
        estado: a.profissional?.estado || null,
        latitude: a.profissional?.latitude ?? null,
        longitude: a.profissional?.longitude ?? null,
      }));

      return res.json(mapped);
    } catch (err) {
      logger.error('Erro ao listar agendamentos', err);
      return res.status(500).json({ error: 'Erro ao listar agendamentos' });
    }
  }

  async sugerirHorarios(req: Request, res: Response) {
    try {
      const { medicoId, data } = req.query;
      if (!medicoId) return res.status(400).json({ error: 'medicoId é obrigatório' });

      const now = new Date();

      // Verifica se foi passada uma data específica no formato YYYY-MM-DD
      const specificDate =
        typeof data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data);

      let startDate: Date;
      let endDate: Date;

      if (specificDate) {
        // Parsear em tempo local para evitar deslocamento de fuso UTC
        const [year, month, day] = (data as string).split('-').map(Number);
        startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
        endDate   = new Date(year, month - 1, day, 23, 59, 59, 999);
      } else {
        startDate = now;
        endDate   = new Date(now);
        endDate.setDate(now.getDate() + 7);
      }

      // Busca todos os conflitos de uma vez (evita N+1 queries)
      const conflitos = await prisma.agendamento.findMany({
        where: {
          profissionalId: String(medicoId),
          dataHora: { gte: startDate, lte: endDate },
          status: { in: ['agendado', 'confirmado'] },
        },
        select: { dataHora: true },
      });
      const conflitosSet = new Set(conflitos.map((c) => c.dataHora.toISOString()));

      // Disponibilidade configurada pelo médico (vazio = cai no padrão 08:00-17:00 ativo todo dia)
      const horariosConfigurados = await prisma.horarioAtendimento.findMany({
        where: { profissionalId: String(medicoId) },
        select: { diaSemana: true, ativo: true, horaInicio: true, horaFim: true },
      });
      const configPorDia = new Map(horariosConfigurados.map((h) => [h.diaSemana, h]));

      const horarios: string[] = [];

      if (specificDate) {
        // Retorna todos os slots do dia solicitado, respeitando a janela do médico pra esse dia da semana
        const [year, month, day] = (data as string).split('-').map(Number);
        const diaSemana = new Date(year, month - 1, day).getDay();
        const janela = janelaDoDia(diaSemana, configPorDia);

        if (janela.ativo) {
          for (let min = janela.inicioMin; min < janela.fimMin; min += 30) {
            const slot = new Date(year, month - 1, day, Math.floor(min / 60), min % 60, 0, 0);
            if (slot > now && !conflitosSet.has(slot.toISOString())) {
              horarios.push(slot.toISOString());
            }
          }
        }
      } else {
        // Comportamento original — próximos 7 dias, até 10 slots
        for (let dia = 0; dia < 7 && horarios.length < 10; dia++) {
          const baseDate = new Date(now);
          baseDate.setDate(now.getDate() + dia);
          const janela = janelaDoDia(baseDate.getDay(), configPorDia);
          if (!janela.ativo) continue;

          for (let min = janela.inicioMin; min < janela.fimMin && horarios.length < 10; min += 30) {
            const slot = new Date(baseDate);
            slot.setHours(Math.floor(min / 60), min % 60, 0, 0);
            if (slot > now && !conflitosSet.has(slot.toISOString())) {
              horarios.push(slot.toISOString());
            }
          }
        }
      }

      return res.json(horarios);
    } catch (err) {
      logger.error('Erro ao sugerir horários', err);
      return res.status(500).json({ error: 'Erro ao sugerir horários' });
    }
  }
}

export default AgendamentosController;


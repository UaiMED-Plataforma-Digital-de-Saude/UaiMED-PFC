import { Request, Response } from "express";
import { prisma } from "../config/database";
import logger from "../utils/logger";

class AgendamentosController {
  // POST /api/agendamentos
  async criar(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).user?.id;
      if (!usuarioId) return res.status(401).json({ error: 'Usuário não autenticado' });

      const { medicoId, dataHora, observacoes } = req.body;
      if (!medicoId || !dataHora) {
        return res.status(400).json({ error: 'medicoId e dataHora são obrigatórios' });
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
      });
    } catch (err) {
      logger.error('Erro ao criar agendamento', err);
      return res.status(500).json({ error: 'Erro ao criar agendamento' });
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
        medico: a.profissional?.usuario?.nome || null,
        especialidade: a.profissional?.especialidade || null,
        data: a.dataHora,
        status: a.status,
      }));

      return res.json(mapped);
    } catch (err) {
      logger.error('Erro ao listar agendamentos', err);
      return res.status(500).json({ error: 'Erro ao listar agendamentos' });
    }
  }

  async sugerirHorarios(req: Request, res: Response) {
    try {
      const { medicoId } = req.query;
      if (!medicoId) return res.status(400).json({ error: 'medicoId é obrigatório' });

      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(now.getDate() + 7);

      // Busca todos os conflitos de uma vez (evita N+1 queries)
      const conflitos = await prisma.agendamento.findMany({
        where: {
          profissionalId: String(medicoId),
          dataHora: { gte: now, lt: endDate },
          status: { in: ['agendado', 'confirmado'] },
        },
        select: { dataHora: true },
      });
      const conflitosSet = new Set(conflitos.map((c) => c.dataHora.toISOString()));

      const horarios: string[] = [];
      for (let dia = 0; dia < 7 && horarios.length < 10; dia++) {
        const data = new Date(now);
        data.setDate(now.getDate() + dia);
        for (let hora = 8; hora < 17 && horarios.length < 10; hora++) {
          for (let min = 0; min < 60 && horarios.length < 10; min += 30) {
            const slot = new Date(data);
            slot.setHours(hora, min, 0, 0);
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


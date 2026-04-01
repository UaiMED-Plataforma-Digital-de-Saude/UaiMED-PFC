
import { Request, Response } from "express";
import { prisma } from "../config/database";
import logger from "../utils/logger";

class AgendamentosController {
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


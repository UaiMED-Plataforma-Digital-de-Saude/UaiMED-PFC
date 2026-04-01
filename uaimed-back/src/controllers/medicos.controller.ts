import { Request, Response } from "express";
import { prisma } from "../config/database";
import logger from "../utils/logger";

class MedicosController {
  async recomendados(req: Request, res: Response) {
    try {
      const profs = await prisma.profissional.findMany({
        include: {
          usuario: true,
          _count: { select: { agendamentos: true } },
        },
      });

      const top = profs
        .map(p => ({
          id: p.id,
          nome: p.usuario?.nome || null,
          especialidade: p.especialidade,
          cidade: p.cidade,
          estado: p.estado,
          avatar: p.usuario?.avatar || null,
          totalAgendamentos: p._count?.agendamentos ?? 0,
        }))
        .sort((a, b) => b.totalAgendamentos - a.totalAgendamentos)
        .slice(0, 10);

      return res.json(top);
    } catch (err) {
      logger.error('Erro ao recomendar profissionais', err);
      return res.status(500).json({ error: 'Erro ao recomendar profissionais' });
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const { query, especialidade } = req.query as { query?: string; especialidade?: string };
      const where: any = {};

      if (especialidade) {
        where.especialidade = { contains: especialidade, mode: 'insensitive' };
      }

      // Filtra pelo nome do usuário se ?query= for fornecido
      if (query) {
        where.usuario = { nome: { contains: query, mode: 'insensitive' } };
      }

      const profs = await prisma.profissional.findMany({
        where,
        include: { usuario: true },
        take: 50,
      });

      const mapped = profs.map(p => ({
        id: p.id,
        nome: p.usuario?.nome || null,
        especialidade: p.especialidade,
        cidade: p.cidade,
        estado: p.estado,
        avatar: p.usuario?.avatar || null,
      }));

      return res.json(mapped);
    } catch (err) {
      logger.error('Erro ao listar profissionais', err);
      return res.status(500).json({ error: 'Erro ao listar profissionais' });
    }
  }
}

export default new MedicosController();

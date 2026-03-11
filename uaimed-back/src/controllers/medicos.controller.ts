import { Request, Response } from "express";
import { prisma } from "../config/database";

class MedicosController {
    async recomendados(req: Request, res: Response) {
      try {
        // Profissionais com mais agendamentos (top 10)
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
        console.error('Erro ao recomendar profissionais', err);
        return res.status(500).json({ error: 'Erro ao recomendar profissionais' });
      }
    }
  async listar(req: Request, res: Response) {
    try {
      const { query, especialidade } = req.query as any;
      const where: any = {};
      if (especialidade) where.especialidade = { contains: especialidade, mode: 'insensitive' };

      // Busca profissionais com dados do usuário associado
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
      console.error('Erro ao listar profissionais', err);
      return res.status(500).json({ error: 'Erro ao listar profissionais' });
    }
  }
}

export default new MedicosController();

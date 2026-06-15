import { Request, Response } from "express";
import { prisma } from "../config/database";
import logger from "../utils/logger";

class MedicosController {
  async recomendados(req: Request, res: Response) {
    try {
      const { cidade, estado } = req.query as { cidade?: string; estado?: string };
      const where: any = {};
      if (estado) where.estado = { contains: estado, mode: 'insensitive' };
      if (cidade)  where.cidade = { contains: cidade,  mode: 'insensitive' };

      const profs = await prisma.profissional.findMany({
        where,
        include: { usuario: true, _count: { select: { agendamentos: true } } },
      });

      const top = profs
        .map(p => ({
          id: p.id,
          nome: p.usuario?.nome || null,
          especialidade: p.especialidade,
          cidade: p.cidade,
          estado: p.estado,
          avatar: p.usuario?.avatar || null,
          pixKey: p.pixKey || null,
          banco: p.banco || null,
          agencia: p.agencia || null,
          conta: p.conta || null,
          tipoConta: p.tipoConta || null,
          precoConsulta: p.precoConsulta,
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
      const { query, especialidade, cidade, estado } = req.query as {
        query?: string; especialidade?: string; cidade?: string; estado?: string;
      };
      const where: any = {};
      if (especialidade) where.especialidade = { contains: especialidade, mode: 'insensitive' };
      if (estado)        where.estado        = { contains: estado,        mode: 'insensitive' };
      if (cidade)        where.cidade        = { contains: cidade,        mode: 'insensitive' };
      if (query)         where.usuario       = { nome: { contains: query, mode: 'insensitive' } };

      const profs = await prisma.profissional.findMany({
        where,
        include: { usuario: true },
        take: 50,
      });

      return res.json(profs.map(p => ({
        id: p.id,
        nome: p.usuario?.nome || null,
        especialidade: p.especialidade,
        cidade: p.cidade,
        estado: p.estado,
        avatar: p.usuario?.avatar || null,
        pixKey: p.pixKey || null,
        precoConsulta: p.precoConsulta,
      })));
    } catch (err) {
      logger.error('Erro ao listar profissionais', err);
      return res.status(500).json({ error: 'Erro ao listar profissionais' });
    }
  }

  async detalhe(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const prof = await prisma.profissional.findUnique({
        where: { id },
        include: {
          usuario: true,
          avaliacoes: {
            include: { usuario: { select: { id: true, nome: true } } },
            orderBy: { criado_em: 'desc' },
            take: 5,
          },
          _count: { select: { agendamentos: true, avaliacoes: true } },
        },
      });
      if (!prof) return res.status(404).json({ error: 'Profissional não encontrado' });

      const notaMedia = prof.avaliacoes.length
        ? prof.avaliacoes.reduce((s, a) => s + a.nota, 0) / prof.avaliacoes.length
        : null;

      return res.json({
        id: prof.id,
        nome: prof.usuario?.nome ?? null,
        email: prof.usuario?.email ?? null,
        telefone: prof.usuario?.telefone ?? null,
        avatar: prof.usuario?.avatar ?? null,
        especialidade: prof.especialidade,
        crm: prof.crm,
        cidade: prof.cidade,
        estado: prof.estado,
        endereco: prof.endereco,
        dataFormacao: prof.dataFormacao,
        pixKey: prof.pixKey ?? null,
        precoConsulta: prof.precoConsulta,
        totalAgendamentos: prof._count.agendamentos,
        totalAvaliacoes: prof._count.avaliacoes,
        notaMedia: notaMedia ? parseFloat(notaMedia.toFixed(1)) : null,
        avaliacoes: prof.avaliacoes.map(a => ({
          id: a.id, nota: a.nota, comentario: a.comentario,
          paciente: a.usuario?.nome ?? 'Paciente', data: a.criado_em,
        })),
      });
    } catch (err) {
      logger.error('Erro ao buscar detalhe do médico', err);
      return res.status(500).json({ error: 'Erro ao buscar profissional' });
    }
  }
}

export default new MedicosController();

import { Request, Response } from "express";
import { prisma } from "../config/database";
import logger from "../utils/logger";
import { Prisma, TipoUsuario } from '@prisma/client';
import { ARTICLE_ADMIN_EMAIL } from '../constants/articleAdmin';

class MedicosController {
  async recomendados(req: Request, res: Response) {
    try {
      const { cidade, estado } = req.query as { cidade?: string; estado?: string };
      const where: Prisma.ProfissionalWhereInput = {
        destaque: true,
        usuario: { ativo: true, tipo: TipoUsuario.medico, email: { not: ARTICLE_ADMIN_EMAIL } },
      };
      if (estado) where.estado = { contains: estado, mode: 'insensitive' };
      if (cidade)  where.cidade = { contains: cidade,  mode: 'insensitive' };

      const profs = await prisma.profissional.findMany({
        where,
        orderBy: { usuario: { nome: 'asc' } },
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
        }));

      return res.json(top);
    } catch (err) {
      logger.error('Erro ao recomendar profissionais', err);
      return res.status(500).json({ error: 'Erro ao recomendar profissionais' });
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const { query, especialidade, cidade, estado, convenio } = req.query as {
        query?: string; especialidade?: string; cidade?: string; estado?: string; convenio?: string;
      };
      const skip = Number(req.query.skip) || 0;
      const take = Math.min(Number(req.query.take) || 50, 100);
      const precoMin = req.query.precoMin !== undefined ? Number(req.query.precoMin) : undefined;
      const precoMax = req.query.precoMax !== undefined ? Number(req.query.precoMax) : undefined;

      const where: any = {};
      if (especialidade) where.especialidade = { contains: especialidade, mode: 'insensitive' };
      if (estado)        where.estado        = { contains: estado,        mode: 'insensitive' };
      if (cidade)        where.cidade        = { contains: cidade,        mode: 'insensitive' };
      if (query)         where.usuario       = { nome: { contains: query, mode: 'insensitive' } };
      if (convenio)      where.convenios     = { has: convenio };
      if (precoMin !== undefined && !Number.isNaN(precoMin)) where.precoConsulta = { ...where.precoConsulta, gte: precoMin };
      if (precoMax !== undefined && !Number.isNaN(precoMax)) where.precoConsulta = { ...where.precoConsulta, lte: precoMax };

      const [profs, total] = await Promise.all([
        prisma.profissional.findMany({ where, include: { usuario: true }, skip, take }),
        prisma.profissional.count({ where }),
      ]);

      // Média/contagem de avaliações em uma única query agregada (evita N+1)
      const mediasPorProfissional = await prisma.avaliacao.groupBy({
        by: ['profissionalId'],
        where: { profissionalId: { in: profs.map(p => p.id) } },
        _avg: { nota: true },
        _count: { nota: true },
      });
      const mediaMap = new Map(mediasPorProfissional.map(m => [m.profissionalId, m]));

      // Resposta continua um array (contrato existente preservado) — total/paginação
      // vão no header para não quebrar os consumidores atuais de GET /medicos.
      res.setHeader('X-Total-Count', String(total));
      return res.json(profs.map(p => {
        const media = mediaMap.get(p.id);
        return {
          id: p.id,
          nome: p.usuario?.nome || null,
          especialidade: p.especialidade,
          cidade: p.cidade,
          estado: p.estado,
          avatar: p.usuario?.avatar || null,
          pixKey: p.pixKey || null,
          precoConsulta: p.precoConsulta,
          convenios: p.convenios,
          notaMedia: media?._avg.nota != null ? parseFloat(media._avg.nota.toFixed(1)) : null,
          totalAvaliacoes: media?._count.nota ?? 0,
        };
      }));
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
        latitude: prof.latitude,
        longitude: prof.longitude,
        dataFormacao: prof.dataFormacao,
        pixKey: prof.pixKey ?? null,
        precoConsulta: prof.precoConsulta,
        convenios: prof.convenios,
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

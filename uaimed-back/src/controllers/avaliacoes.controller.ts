import { Request, Response } from "express";
import { prisma } from "../config/database";
import logger from "../utils/logger";

class AvaliacoesController {
  async criar(req: Request, res: Response) {
    try {
      const { profissionalId, agendamentoId, nota, comentario } = req.body;
      const usuarioId = (req as any).user?.id;
      if (!usuarioId) return res.status(401).json({ error: "Usuário não autenticado" });

      if (agendamentoId) {
        const agendamento = await prisma.agendamento.findUnique({ where: { id: agendamentoId } });
        if (!agendamento) return res.status(404).json({ error: "Agendamento não encontrado" });
        if (agendamento.usuarioId !== usuarioId) {
          return res.status(403).json({ error: "Você não tem permissão para avaliar este agendamento" });
        }
        if (agendamento.profissionalId !== profissionalId) {
          return res.status(400).json({ error: "O agendamento não pertence ao profissional informado" });
        }
        if (agendamento.status !== "concluido") {
          return res.status(422).json({ error: "Só é possível avaliar consultas já realizadas" });
        }
        const avaliacaoExistente = await prisma.avaliacao.findUnique({ where: { agendamentoId } });
        if (avaliacaoExistente) {
          return res.status(409).json({ error: "Este agendamento já foi avaliado" });
        }
      }

      const avaliacao = await prisma.avaliacao.create({ data: { usuarioId, profissionalId, agendamentoId: agendamentoId ?? null, nota, comentario } });
      logger.success(`Avaliação criada: ${avaliacao.id}`);
      return res.status(201).json(avaliacao);
    } catch (err) {
      logger.error("Erro ao criar avaliação", err);
      return res.status(500).json({ error: "Erro ao criar avaliação" });
    }
  }

  // GET /avaliacoes/minhas — avaliações feitas pelo paciente autenticado
  async minhas(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).user?.id;
      if (!usuarioId) return res.status(401).json({ error: "Usuário não autenticado" });

      const avaliacoes = await prisma.avaliacao.findMany({
        where: { usuarioId },
        select: {
          id: true,
          nota: true,
          comentario: true,
          criado_em: true,
          profissional: {
            select: {
              id: true,
              especialidade: true,
              usuario: { select: { nome: true, avatar: true } },
            },
          },
        },
        orderBy: { criado_em: "desc" },
      });

      return res.json(avaliacoes);
    } catch (err) {
      logger.error("Erro ao listar avaliações do paciente", err);
      return res.status(500).json({ error: "Erro ao listar avaliações" });
    }
  }

  async obterMedia(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id || id.length !== 36) return res.status(400).json({ error: "ID inválido" });

      const avaliacoes = await prisma.avaliacao.findMany({ where: { profissionalId: id } });
      if (avaliacoes.length === 0) return res.json({ profissionalId: id, notaMedia: 0, totalAvaliacoes: 0 });

      const soma = avaliacoes.reduce((acc, a) => acc + a.nota, 0);
      const notaMedia = parseFloat((soma / avaliacoes.length).toFixed(1));

      return res.json({ profissionalId: id, notaMedia, totalAvaliacoes: avaliacoes.length, distribuicao: {
        cinco: avaliacoes.filter(a => a.nota === 5).length,
        quatro: avaliacoes.filter(a => a.nota === 4).length,
        tres: avaliacoes.filter(a => a.nota === 3).length,
        dois: avaliacoes.filter(a => a.nota === 2).length,
        um: avaliacoes.filter(a => a.nota === 1).length,
      } });
    } catch (err) {
      logger.error("Erro ao obter média de avaliações", err);
      return res.status(500).json({ error: "Erro ao obter média de avaliações" });
    }
  }
}

export default new AvaliacoesController();

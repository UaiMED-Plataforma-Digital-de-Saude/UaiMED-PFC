import { Request, Response } from "express";
import { prisma } from "../config/database";
import logger from "../utils/logger";

class AvaliacoesController {
  async criar(req: Request, res: Response) {
    try {
      const { profissionalId, nota, comentario } = req.body;
      const usuarioId = (req as any).user?.id;
      if (!usuarioId) return res.status(401).json({ error: "Usuário não autenticado" });

      const avaliacao = await prisma.avaliacao.create({ data: { usuarioId, profissionalId, nota, comentario } });
      logger.success(`Avaliação criada: ${avaliacao.id}`);
      return res.status(201).json(avaliacao);
    } catch (err) {
      logger.error("Erro ao criar avaliação", err);
      return res.status(500).json({ error: "Erro ao criar avaliação" });
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

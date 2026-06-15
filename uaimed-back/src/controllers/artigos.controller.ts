import { Request, Response } from 'express';
import { prisma } from '../config/database';
import logger from '../utils/logger';

class ArtigosController {
  // GET /api/artigos
  async listar(req: Request, res: Response) {
    try {
      const artigos = await prisma.artigo.findMany({
        where: { publicado: true },
        orderBy: { criado_em: 'desc' },
        select: {
          id: true,
          titulo: true,
          resumo: true,
          categoria: true,
          banner: true,
          criado_em: true,
          autor: { select: { nome: true, tipo: true } },
        },
      });
      return res.json(artigos);
    } catch (err) {
      logger.error('Erro ao listar artigos', err);
      return res.status(500).json({ error: 'Erro ao listar artigos' });
    }
  }

  // GET /api/artigos/:id
  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const artigo = await prisma.artigo.findUnique({
        where: { id },
        include: { autor: { select: { nome: true, tipo: true } } },
      });
      if (!artigo || !artigo.publicado) {
        return res.status(404).json({ error: 'Artigo não encontrado' });
      }
      return res.json(artigo);
    } catch (err) {
      logger.error('Erro ao buscar artigo', err);
      return res.status(500).json({ error: 'Erro ao buscar artigo' });
    }
  }

  // POST /api/artigos
  async criar(req: Request, res: Response) {
    try {
      const autorId = (req as any).user?.id;
      if (!autorId) return res.status(401).json({ error: 'Usuário não autenticado' });

      const { titulo, resumo, categoria, corpo, banner } = req.body as {
        titulo?: string;
        resumo?: string;
        categoria?: string;
        corpo?: string;
        banner?: string;
      };

      if (!titulo?.trim() || !categoria?.trim() || !corpo?.trim()) {
        return res.status(400).json({ error: 'Título, categoria e corpo são obrigatórios' });
      }

      const artigo = await prisma.artigo.create({
        data: {
          titulo:    titulo.trim(),
          resumo:    resumo?.trim() || null,
          categoria: categoria.trim().toUpperCase(),
          corpo:     corpo.trim(),
          banner:    banner || null,
          autorId,
          publicado: true,
        },
        include: { autor: { select: { nome: true } } },
      });

      logger.success(`Artigo criado: ${artigo.id} por ${autorId}`);
      return res.status(201).json(artigo);
    } catch (err) {
      logger.error('Erro ao criar artigo', err);
      return res.status(500).json({ error: 'Erro ao criar artigo' });
    }
  }
}

export default new ArtigosController();

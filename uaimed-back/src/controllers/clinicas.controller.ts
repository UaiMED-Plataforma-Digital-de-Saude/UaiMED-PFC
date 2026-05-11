import { Request, Response } from 'express';
import { prisma } from '../config/database';

class ClinicasController {
  async recomendadas(req: Request, res: Response) {
    try {
      const { estado, cidade } = req.query;

      const where: any = {
        tipo: 'clinica',
        ativo: true,
      };

      if (estado) where.estado = estado;
      if (cidade) where.cidade = cidade;

      const clinicas = await prisma.usuario.findMany({
        where,
        select: {
          id: true,
          nome: true,
          email: true,
          cidade: true,
          estado: true,
          avatar: true,
        },
        take: 10,
        orderBy: { criado_em: 'desc' },
      });

      const formatted = clinicas.map(c => ({
        id: c.id,
        nome: c.nome,
        avatar: c.avatar ?? null,
        localizacao: c.cidade && c.estado ? `${c.cidade}, ${c.estado}` : c.cidade || c.estado || null,
        nota: 5.0,
      }));

      return res.json(formatted);
    } catch (error) {
      console.error('Erro ao buscar clínicas recomendadas:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const clinicas = await prisma.usuario.findMany({
        where: { tipo: 'clinica', ativo: true },
        select: {
          id: true,
          nome: true,
          email: true,
          cidade: true,
          estado: true,
          avatar: true,
          criado_em: true,
        },
        orderBy: { nome: 'asc' },
      });
      return res.json(clinicas);
    } catch (error) {
      console.error('Erro ao listar clínicas:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

export default new ClinicasController();

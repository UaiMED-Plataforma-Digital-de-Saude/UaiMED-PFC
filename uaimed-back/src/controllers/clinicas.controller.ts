import { Request, Response } from 'express';
import prisma from '../prisma/prismaClient';

class ClinicasController {
  async recomendadas(req: Request, res: Response) {
    try {
      const { estado, cidade } = req.query;

      const where: any = {
        tipo: 'clinica',
      };

      if (estado) where.estado = estado;
      if (cidade) where.cidade = cidade;

      // Busca usuários do tipo clinica que tenham nome e localização (simplificado)
      const clinicas = await prisma.usuario.findMany({
        where,
        select: {
          id: true,
          nome: true,
          email: true,
          cidade: true,
          estado: true,
          fotoPerfil: true, // Ou avatar se preferir padronizar
        },
        take: 10,
      });

      // Mapeia para o formato esperado pelo front
      const formatted = clinicas.map(c => ({
        id: c.id,
        nome: c.nome,
        avatar: c.fotoPerfil,
        localizacao: `${c.cidade}, ${c.estado}`,
        nota: 5.0, // Mock de nota por enquanto
      }));

      return res.json(formatted);
    } catch (error) {
      console.error('Erro ao buscar clínicas recomendadas:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async listar(req: Request, res: Response) {
      // Implementação básica de listagem se necessário
      const clinicas = await prisma.usuario.findMany({ where: { tipo: 'clinica' } });
      return res.json(clinicas);
  }
}

export default new ClinicasController();

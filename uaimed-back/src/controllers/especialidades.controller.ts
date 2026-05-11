import { Request, Response } from 'express';
import { prisma } from '../config/database';

class EspecialidadesController {
  async listar(req: Request, res: Response) {
    try {
      // Busca especialidades únicas dos profissionais cadastrados
      const profissionais = await prisma.profissional.findMany({
        select: { especialidade: true },
        distinct: ['especialidade'],
        orderBy: { especialidade: 'asc' },
      });

      const especialidades = profissionais.map((p, index) => ({
        id: String(index + 1),
        nome: p.especialidade,
      }));

      return res.json(especialidades);
    } catch (error) {
      console.error('Erro ao listar especialidades:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

export default new EspecialidadesController();


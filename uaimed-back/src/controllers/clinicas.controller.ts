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
          pixKey: true,
          banco: true,
          agencia: true,
          conta: true,
          tipoConta: true,
        },
        take: 10,
        orderBy: { criado_em: 'desc' },
      });

      const formatted = clinicas.map(c => ({
        id: c.id,
        nome: c.nome,
        avatar: c.avatar ?? null,
        localizacao: c.cidade && c.estado ? `${c.cidade}, ${c.estado}` : c.cidade || c.estado || null,
        pixKey: c.pixKey ?? null,
        banco: c.banco ?? null,
        agencia: c.agencia ?? null,
        conta: c.conta ?? null,
        tipoConta: c.tipoConta ?? null,
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
          pixKey: true,
          banco: true,
          agencia: true,
          conta: true,
          tipoConta: true,
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
  async detalhe(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const clinica = await prisma.usuario.findFirst({
        where: { id, tipo: 'clinica', ativo: true },
      });
      if (!clinica) return res.status(404).json({ error: 'Clínica não encontrada' });

      // Busca avaliacoes de profissionais vinculados à clínica (simplificado: sem vínculo direto por ora, retorna array vazio)
      return res.json({
        id: clinica.id,
        nome: clinica.nome,
        email: clinica.email,
        telefone: clinica.telefone,
        avatar: clinica.avatar ?? null,
        cidade: clinica.cidade ?? null,
        estado: clinica.estado ?? null,
        localizacao: clinica.cidade && clinica.estado
          ? `${clinica.cidade}, ${clinica.estado}`
          : clinica.cidade || clinica.estado || null,
        pixKey: clinica.pixKey ?? null,
        nota: 5.0,
      });
    } catch (error) {
      console.error('Erro ao buscar detalhe da clínica:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

export default new ClinicasController();

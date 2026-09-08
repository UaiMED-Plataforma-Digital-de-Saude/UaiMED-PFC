import { Request, Response } from "express";
import { prisma } from "../config/database";
import { geocodeEndereco } from "../services/geocoding.service";
import logger from "../utils/logger";

class ProfessionalController {
  async listarAvaliacoes(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' });

      const profissional = await prisma.profissional.findUnique({
        where: { usuarioId: userId },
        select: { id: true },
      });
      if (!profissional) return res.status(404).json({ error: 'Profissional não encontrado' });

      const avaliacoes = await prisma.avaliacao.findMany({
        where: { profissionalId: profissional.id },
        select: {
          id: true,
          nota: true,
          comentario: true,
          criado_em: true,
          usuario: { select: { id: true, nome: true, avatar: true } },
        },
        orderBy: { criado_em: 'desc' },
      });

      const totalAvaliacoes = avaliacoes.length;
      const notaMedia = totalAvaliacoes
        ? Number((avaliacoes.reduce((soma, item) => soma + item.nota, 0) / totalAvaliacoes).toFixed(1))
        : 0;

      return res.json({ notaMedia, totalAvaliacoes, avaliacoes });
    } catch (err) {
      logger.error('Erro ao listar avaliações do profissional', err);
      return res.status(500).json({ error: 'Erro ao listar avaliações recebidas' });
    }
  }

  async listarAgendamentos(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' });

      const profissional = await prisma.profissional.findUnique({
        where: { usuarioId: userId },
        select: { id: true },
      });
      if (!profissional) return res.status(404).json({ error: 'Profissional não encontrado' });

      const agendamentos = await prisma.agendamento.findMany({
        where: { profissionalId: profissional.id },
        select: {
          id: true,
          dataHora: true,
          duracao: true,
          status: true,
          observacoes: true,
          criado_em: true,
          usuario: {
            select: { id: true, nome: true, telefone: true },
          },
        },
        orderBy: { dataHora: 'asc' },
      });

      return res.json(agendamentos);
    } catch (err) {
      logger.error('Erro ao listar agendamentos do profissional', err);
      return res.status(500).json({ error: 'Erro ao listar consultas do profissional' });
    }
  }

  async meSummary(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' });

      const profissional = await prisma.profissional.findUnique({ where: { usuarioId: userId } });
      if (!profissional) return res.status(404).json({ error: 'Profissional não encontrado' });

      // Agendamentos de hoje
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const totalToday = await prisma.agendamento.count({ where: { profissionalId: profissional.id, dataHora: { gte: start, lt: end } } });

      // Próximos agendamentos (limit 10)
      const nextAppointments = await prisma.agendamento.findMany({
        where: {
          profissionalId: profissional.id,
          dataHora: { gte: new Date() },
          status: { in: ['agendado', 'confirmado'] },
        },
        include: { usuario: { select: { id: true, nome: true, telefone: true } } },
        orderBy: { dataHora: 'asc' },
        take: 10,
      });

      // Média de avaliação
      const ratingAgg = await prisma.avaliacao.aggregate({ where: { profissionalId: profissional.id }, _avg: { nota: true } });
      const ratingAvg = ratingAgg._avg.nota ?? null;

      // Receita do mês atual (somente pagamentos ligados a agendamentos do profissional)
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const revenueAgg = await prisma.pagamento.aggregate({
        where: { agendamento: { profissionalId: profissional.id, dataHora: { gte: monthStart, lt: monthEnd } } },
        _sum: { valorFinal: true },
      });
      const revenueThisMonth = revenueAgg._sum.valorFinal ?? 0;

      // Pendências: contatos não lidos
      const pendingContacts = await prisma.contato.count({ where: { profissionalId: profissional.id, status: 'nao_lido' } });

      return res.json({
        profissional: { id: profissional.id, especialidade: profissional.especialidade },
        totalToday,
        nextAppointments,
        ratingAvg,
        revenueThisMonth,
        pendingContacts,
      });
    } catch (err) {
      logger.error('Professional summary error', err);
      return res.status(500).json({ error: 'Erro ao gerar resumo do profissional' });
    }
  }

  /** PUT /api/professionals/me/endereco — atualiza o endereço e re-geocodifica */
  async atualizarEndereco(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' });

      const { endereco, cidade, estado, cep } = req.body as {
        endereco?: string; cidade?: string; estado?: string; cep?: string;
      };
      if (!endereco?.trim() || !cidade?.trim() || !estado?.trim()) {
        return res.status(400).json({ error: 'Endereço, cidade e estado são obrigatórios' });
      }

      const profissional = await prisma.profissional.findUnique({ where: { usuarioId: userId } });
      if (!profissional) return res.status(404).json({ error: 'Profissional não encontrado' });

      const coordenadas = await geocodeEndereco({
        endereco: endereco.trim(),
        cidade: cidade.trim(),
        estado: estado.trim(),
      });

      // Em uma atualização, um endereço não localizável precisa sobrescrever
      // coordenadas antigas com null — se usássemos `undefined` aqui, o Prisma
      // manteria a latitude/longitude antiga, deixando o pino desatualizado
      // apontando para o endereço anterior.
      const atualizado = await prisma.profissional.update({
        where: { id: profissional.id },
        data: {
          endereco: endereco.trim(),
          cidade: cidade.trim(),
          estado: estado.trim(),
          cep: cep?.trim() || '',
          latitude: coordenadas?.latitude ?? null,
          longitude: coordenadas?.longitude ?? null,
        },
        select: { endereco: true, cidade: true, estado: true, cep: true, latitude: true, longitude: true },
      });

      logger.success(`Endereço atualizado: profissional ${profissional.id}`);
      return res.json(atualizado);
    } catch (err) {
      logger.error('Erro ao atualizar endereço do profissional', err);
      return res.status(500).json({ error: 'Erro ao atualizar endereço' });
    }
  }
}

export default new ProfessionalController();

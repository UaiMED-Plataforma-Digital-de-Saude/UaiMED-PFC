import { Request, Response } from "express";
import { prisma } from "../config/database";
import { geocodeEndereco } from "../services/geocoding.service";
import { getWeeklySeries, getMonthlySeries } from "../services/dashboard.service";
import logger from "../utils/logger";

const DIAS_SEMANA = [0, 1, 2, 3, 4, 5, 6];

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

      // Séries semanal (7 dias) e mensal (6 meses) de agendamentos/receita
      const [weekly, monthly] = await Promise.all([
        getWeeklySeries([profissional.id]),
        getMonthlySeries([profissional.id]),
      ]);

      return res.json({
        profissional: { id: profissional.id, especialidade: profissional.especialidade },
        totalToday,
        nextAppointments,
        ratingAvg,
        revenueThisMonth,
        pendingContacts,
        weekly,
        monthly,
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
        endereco: string; cidade: string; estado: string; cep?: string;
      };

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

  /** PUT /api/professionals/me/preco — atualiza o preço da consulta */
  async atualizarPreco(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' });

      const { precoConsulta } = req.body as { precoConsulta: number };

      const profissional = await prisma.profissional.findUnique({ where: { usuarioId: userId } });
      if (!profissional) return res.status(404).json({ error: 'Profissional não encontrado' });

      const atualizado = await prisma.profissional.update({
        where: { id: profissional.id },
        data: { precoConsulta },
        select: { precoConsulta: true },
      });

      logger.success(`Preço de consulta atualizado: profissional ${profissional.id}`);
      return res.json(atualizado);
    } catch (err) {
      logger.error('Erro ao atualizar preço da consulta', err);
      return res.status(500).json({ error: 'Erro ao atualizar preço da consulta' });
    }
  }

  /** GET /api/professionals/me/disponibilidade — retorna a janela de atendimento por dia da semana */
  async obterDisponibilidade(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' });

      const profissional = await prisma.profissional.findUnique({ where: { usuarioId: userId } });
      if (!profissional) return res.status(404).json({ error: 'Profissional não encontrado' });

      const horarios = await prisma.horarioAtendimento.findMany({
        where: { profissionalId: profissional.id },
        orderBy: { diaSemana: 'asc' },
        select: { diaSemana: true, ativo: true, horaInicio: true, horaFim: true },
      });

      // Médico ainda não configurou nada — devolve o padrão atual (seg-sex, 08:00-17:00)
      // sem persistir, só pra tela abrir com algo sensato pra editar.
      if (horarios.length === 0) {
        return res.json(DIAS_SEMANA.map((diaSemana) => ({
          diaSemana,
          ativo: diaSemana >= 1 && diaSemana <= 5,
          horaInicio: '08:00',
          horaFim: '17:00',
        })));
      }

      return res.json(horarios);
    } catch (err) {
      logger.error('Erro ao buscar disponibilidade do profissional', err);
      return res.status(500).json({ error: 'Erro ao buscar disponibilidade' });
    }
  }

  /** PUT /api/professionals/me/disponibilidade — substitui a janela de atendimento dos 7 dias */
  async atualizarDisponibilidade(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' });

      const dias = req.body as Array<{ diaSemana: number; ativo: boolean; horaInicio: string; horaFim: string }>;

      const profissional = await prisma.profissional.findUnique({ where: { usuarioId: userId } });
      if (!profissional) return res.status(404).json({ error: 'Profissional não encontrado' });

      const resultado = await prisma.$transaction([
        prisma.horarioAtendimento.deleteMany({ where: { profissionalId: profissional.id } }),
        ...dias.map((dia) => prisma.horarioAtendimento.create({
          data: { profissionalId: profissional.id, ...dia },
        })),
      ]);

      logger.success(`Disponibilidade atualizada: profissional ${profissional.id}`);
      return res.json(resultado.slice(1));
    } catch (err) {
      logger.error('Erro ao atualizar disponibilidade do profissional', err);
      return res.status(500).json({ error: 'Erro ao atualizar disponibilidade' });
    }
  }
}

export default new ProfessionalController();

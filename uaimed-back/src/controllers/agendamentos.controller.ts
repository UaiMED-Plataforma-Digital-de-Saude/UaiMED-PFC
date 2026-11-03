import { Request, Response } from "express";
import { prisma } from "../config/database";
import AuditoriaService from "../services/auditoria.service";
import { enviarEmailConfirmacaoAgendamento } from "../services/email.service";
import logger from "../utils/logger";

// Antecedência mínima em horas para cancelar ou remarcar um agendamento (mantido em sincronia com o front).
const HORAS_MINIMAS_CANCELAMENTO = 24;

interface JanelaDia {
  ativo: boolean;
  inicioMin: number;
  fimMin: number;
}

function paraMinutos(horaHHmm: string): number {
  const [h, m] = horaHHmm.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Resolve a janela de atendimento (ativo + intervalo em minutos) de um dia da
 * semana. Sem configuração (médico nunca definiu disponibilidade), cai no
 * comportamento padrão de sempre: ativo, 08:00-17:00.
 */
function janelaDoDia(diaSemana: number, config: Map<number, { ativo: boolean; horaInicio: string; horaFim: string }>): JanelaDia {
  const dia = config.get(diaSemana);
  if (!dia) return { ativo: true, inicioMin: 8 * 60, fimMin: 17 * 60 };
  return { ativo: dia.ativo, inicioMin: paraMinutos(dia.horaInicio), fimMin: paraMinutos(dia.horaFim) };
}

class AgendamentosController {
  // POST /api/agendamentos
  async criar(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).user?.id;
      if (!usuarioId) return res.status(401).json({ error: 'Usuário não autenticado' });

      const { medicoId, dataHora, observacoes } = req.body;

      // Verifica se o usuário ainda existe na DB (token pode ter userId de sessão antiga)
      const usuarioExiste = await prisma.usuario.findUnique({ where: { id: usuarioId } });
      if (!usuarioExiste) {
        return res.status(401).json({ error: 'Sessão inválida. Faça login novamente.' });
      }

      // Verifica se o profissional existe
      const profissional = await prisma.profissional.findUnique({
        where: { id: String(medicoId) },
        include: { usuario: { select: { nome: true, email: true } } },
      });
      if (!profissional) return res.status(404).json({ error: 'Profissional não encontrado' });

      // Verifica conflito de horário
      const conflito = await prisma.agendamento.findFirst({
        where: {
          profissionalId: String(medicoId),
          dataHora: new Date(dataHora),
          status: { in: ['agendado', 'confirmado'] },
        },
      });
      if (conflito) return res.status(409).json({ error: 'Horário já ocupado para este profissional' });

      const agendamento = await prisma.agendamento.create({
        data: {
          usuarioId,
          profissionalId: String(medicoId),
          dataHora: new Date(dataHora),
          observacoes: observacoes ?? null,
          status: 'agendado',
        },
      });

      logger.success(`Agendamento criado: ${agendamento.id}`);

      await AuditoriaService.registrarAcesso({
        ator: { id: usuarioId, tipo: req.user?.tipo },
        acao: "CRIAR_AGENDAMENTO",
        recurso: "Agendamento",
        recursoId: agendamento.id,
        pacientes: [{ id: usuarioId, nome: usuarioExiste.nome }],
        ip: req.ip,
      });

      // E-mail de confirmação é um efeito colateral — não deve derrubar a criação
      // do agendamento se o envio falhar (enviarEmailConfirmacaoAgendamento já
      // nunca lança, mas o try/catch aqui é uma segunda camada de segurança).
      try {
        await enviarEmailConfirmacaoAgendamento({
          paciente: { nome: usuarioExiste.nome, email: usuarioExiste.email },
          medico: { nome: profissional.usuario.nome, email: profissional.usuario.email, especialidade: profissional.especialidade },
          dataHora: agendamento.dataHora,
        });
      } catch (emailErr) {
        logger.error('Falha ao enviar e-mail de confirmação de agendamento', emailErr);
      }

      return res.status(201).json({
        id: agendamento.id,
        status: agendamento.status,
        dataHora: agendamento.dataHora,
        profissionalId: agendamento.profissionalId,
        valor: profissional.precoConsulta,
      });
    } catch (err: any) {
      logger.error('Erro ao criar agendamento', err);
      const detail = process.env.NODE_ENV !== 'production' ? (err?.message ?? String(err)) : undefined;
      // P2003 = FK constraint violation (usuário ou profissional não existe)
      if (err?.code === 'P2003') {
        return res.status(422).json({ error: 'Referência inválida: usuário ou profissional não encontrado. Faça login novamente.', detail });
      }
      // P2002 = unique constraint (agendamento duplicado exato)
      if (err?.code === 'P2002') {
        return res.status(409).json({ error: 'Já existe um agendamento neste horário.', detail });
      }
      return res.status(500).json({ error: 'Erro ao criar agendamento', detail });
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const agendamentos = await prisma.agendamento.findMany({
        where: { usuarioId: userId },
        include: { profissional: { include: { usuario: true } }, pagamento: true, avaliacao: { select: { id: true } } },
        orderBy: { dataHora: 'desc' },
      });

      const mapped = agendamentos.map(a => ({
        id: a.id,
        medicoId: a.profissionalId,
        medico: a.profissional?.usuario?.nome || null,
        especialidade: a.profissional?.especialidade || null,
        data: a.dataHora,
        status: a.status,
        endereco: a.profissional?.endereco || null,
        cidade: a.profissional?.cidade || null,
        estado: a.profissional?.estado || null,
        latitude: a.profissional?.latitude ?? null,
        longitude: a.profissional?.longitude ?? null,
        valor: a.profissional?.precoConsulta ?? null,
        pixKey: a.profissional?.pixKey || null,
        pagamento: a.pagamento
          ? { status: a.pagamento.status, valorFinal: a.pagamento.valorFinal, metodo: a.pagamento.metodo }
          : null,
        avaliado: !!a.avaliacao,
      }));

      return res.json(mapped);
    } catch (err) {
      logger.error('Erro ao listar agendamentos', err);
      return res.status(500).json({ error: 'Erro ao listar agendamentos' });
    }
  }

  // PATCH /api/agendamentos/:id/cancelar
  async cancelar(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).user?.id;
      if (!usuarioId) return res.status(401).json({ error: 'Usuário não autenticado' });

      const { id } = req.params;

      const agendamento = await prisma.agendamento.findUnique({ where: { id } });
      if (!agendamento) return res.status(404).json({ error: 'Agendamento não encontrado' });
      if (agendamento.usuarioId !== usuarioId) {
        return res.status(403).json({ error: 'Você não tem permissão para cancelar este agendamento' });
      }
      if (agendamento.status === 'cancelado') {
        return res.status(409).json({ error: 'Este agendamento já está cancelado' });
      }
      if (agendamento.status === 'realizado' || agendamento.status === 'concluido') {
        return res.status(409).json({ error: 'Não é possível cancelar uma consulta já realizada' });
      }

      const horasAteConsulta = (agendamento.dataHora.getTime() - Date.now()) / (1000 * 60 * 60);
      if (horasAteConsulta < HORAS_MINIMAS_CANCELAMENTO) {
        return res.status(422).json({
          error: `Não é possível cancelar consultas com menos de ${HORAS_MINIMAS_CANCELAMENTO} horas de antecedência.`,
        });
      }

      const atualizado = await prisma.agendamento.update({
        where: { id },
        data: { status: 'cancelado' },
      });

      logger.success(`Agendamento cancelado: ${atualizado.id}`);

      await AuditoriaService.registrarAcesso({
        ator: { id: usuarioId, tipo: req.user?.tipo },
        acao: "CANCELAR_AGENDAMENTO",
        recurso: "Agendamento",
        recursoId: atualizado.id,
        pacientes: [{ id: usuarioId }],
        ip: req.ip,
      });

      return res.json({ id: atualizado.id, status: atualizado.status });
    } catch (err: any) {
      logger.error('Erro ao cancelar agendamento', err);
      const detail = process.env.NODE_ENV !== 'production' ? (err?.message ?? String(err)) : undefined;
      return res.status(500).json({ error: 'Erro ao cancelar agendamento', detail });
    }
  }

  // PATCH /api/agendamentos/:id/remarcar
  async remarcar(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).user?.id;
      if (!usuarioId) return res.status(401).json({ error: 'Usuário não autenticado' });

      const { id } = req.params;
      const { dataHora } = req.body;

      const agendamento = await prisma.agendamento.findUnique({ where: { id } });
      if (!agendamento) return res.status(404).json({ error: 'Agendamento não encontrado' });
      if (agendamento.usuarioId !== usuarioId) {
        return res.status(403).json({ error: 'Você não tem permissão para remarcar este agendamento' });
      }
      if (agendamento.status === 'cancelado') {
        return res.status(409).json({ error: 'Não é possível remarcar uma consulta cancelada' });
      }
      if (agendamento.status === 'realizado' || agendamento.status === 'concluido') {
        return res.status(409).json({ error: 'Não é possível remarcar uma consulta já realizada' });
      }

      const horasAteConsultaAtual = (agendamento.dataHora.getTime() - Date.now()) / (1000 * 60 * 60);
      if (horasAteConsultaAtual < HORAS_MINIMAS_CANCELAMENTO) {
        return res.status(422).json({
          error: `Não é possível remarcar consultas com menos de ${HORAS_MINIMAS_CANCELAMENTO} horas de antecedência.`,
        });
      }

      const novaDataHora = new Date(dataHora);
      if (novaDataHora.getTime() <= Date.now()) {
        return res.status(422).json({ error: 'O novo horário precisa estar no futuro.' });
      }

      const conflito = await prisma.agendamento.findFirst({
        where: {
          id: { not: id },
          profissionalId: agendamento.profissionalId,
          dataHora: novaDataHora,
          status: { in: ['agendado', 'confirmado'] },
        },
      });
      if (conflito) return res.status(409).json({ error: 'Horário já ocupado para este profissional' });

      const atualizado = await prisma.agendamento.update({
        where: { id },
        data: { dataHora: novaDataHora },
      });

      logger.success(`Agendamento remarcado: ${atualizado.id}`);

      await AuditoriaService.registrarAcesso({
        ator: { id: usuarioId, tipo: req.user?.tipo },
        acao: "REMARCAR_AGENDAMENTO",
        recurso: "Agendamento",
        recursoId: atualizado.id,
        pacientes: [{ id: usuarioId }],
        detalhes: { dataAnterior: agendamento.dataHora, dataNova: atualizado.dataHora },
        ip: req.ip,
      });

      return res.json({ id: atualizado.id, status: atualizado.status, dataHora: atualizado.dataHora });
    } catch (err: any) {
      logger.error('Erro ao remarcar agendamento', err);
      const detail = process.env.NODE_ENV !== 'production' ? (err?.message ?? String(err)) : undefined;
      return res.status(500).json({ error: 'Erro ao remarcar agendamento', detail });
    }
  }

  async sugerirHorarios(req: Request, res: Response) {
    try {
      const { medicoId, data } = req.query;
      if (!medicoId) return res.status(400).json({ error: 'medicoId é obrigatório' });

      const now = new Date();

      // Verifica se foi passada uma data específica no formato YYYY-MM-DD
      const specificDate =
        typeof data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data);

      let startDate: Date;
      let endDate: Date;

      if (specificDate) {
        // Parsear em tempo local para evitar deslocamento de fuso UTC
        const [year, month, day] = (data as string).split('-').map(Number);
        startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
        endDate   = new Date(year, month - 1, day, 23, 59, 59, 999);
      } else {
        startDate = now;
        endDate   = new Date(now);
        endDate.setDate(now.getDate() + 7);
      }

      // Busca todos os conflitos de uma vez (evita N+1 queries)
      const conflitos = await prisma.agendamento.findMany({
        where: {
          profissionalId: String(medicoId),
          dataHora: { gte: startDate, lte: endDate },
          status: { in: ['agendado', 'confirmado'] },
        },
        select: { dataHora: true },
      });
      const conflitosSet = new Set(conflitos.map((c) => c.dataHora.toISOString()));

      // Disponibilidade configurada pelo médico (vazio = cai no padrão 08:00-17:00 ativo todo dia)
      const horariosConfigurados = await prisma.horarioAtendimento.findMany({
        where: { profissionalId: String(medicoId) },
        select: { diaSemana: true, ativo: true, horaInicio: true, horaFim: true },
      });
      const configPorDia = new Map(horariosConfigurados.map((h) => [h.diaSemana, h]));

      const horarios: string[] = [];

      if (specificDate) {
        // Retorna todos os slots do dia solicitado, respeitando a janela do médico pra esse dia da semana
        const [year, month, day] = (data as string).split('-').map(Number);
        const diaSemana = new Date(year, month - 1, day).getDay();
        const janela = janelaDoDia(diaSemana, configPorDia);

        if (janela.ativo) {
          for (let min = janela.inicioMin; min < janela.fimMin; min += 30) {
            const slot = new Date(year, month - 1, day, Math.floor(min / 60), min % 60, 0, 0);
            if (slot > now && !conflitosSet.has(slot.toISOString())) {
              horarios.push(slot.toISOString());
            }
          }
        }
      } else {
        // Comportamento original — próximos 7 dias, até 10 slots
        for (let dia = 0; dia < 7 && horarios.length < 10; dia++) {
          const baseDate = new Date(now);
          baseDate.setDate(now.getDate() + dia);
          const janela = janelaDoDia(baseDate.getDay(), configPorDia);
          if (!janela.ativo) continue;

          for (let min = janela.inicioMin; min < janela.fimMin && horarios.length < 10; min += 30) {
            const slot = new Date(baseDate);
            slot.setHours(Math.floor(min / 60), min % 60, 0, 0);
            if (slot > now && !conflitosSet.has(slot.toISOString())) {
              horarios.push(slot.toISOString());
            }
          }
        }
      }

      return res.json(horarios);
    } catch (err) {
      logger.error('Erro ao sugerir horários', err);
      return res.status(500).json({ error: 'Erro ao sugerir horários' });
    }
  }
}

export default AgendamentosController;


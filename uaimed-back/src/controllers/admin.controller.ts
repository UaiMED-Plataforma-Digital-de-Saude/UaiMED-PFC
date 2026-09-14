import { Request, Response } from "express";
import { StatusVinculoClinica } from "@prisma/client";
import { prisma } from "../config/database";
import logger from "../utils/logger";

class AdminController {
  async summary(req: Request, res: Response) {
    try {
      const clinicaId = req.user?.id;
      if (!clinicaId) return res.status(401).json({ error: 'Usuário não autenticado' });

      const vinculos = await prisma.clinicaProfissional.findMany({
        where: { clinicaId, status: StatusVinculoClinica.aceito },
        select: { profissionalId: true },
      });
      const profissionalIds = vinculos.map((item) => item.profissionalId);

      const pacientes = await prisma.agendamento.findMany({
        where: { profissionalId: { in: profissionalIds } },
        select: { usuarioId: true },
        distinct: ['usuarioId'],
      });
      const totalPacientes = pacientes.length;
      const totalUsuarios = totalPacientes;
      const totalMedicos = profissionalIds.length;

      const totalContatosPendentes = await prisma.contato.count({
        where: { profissionalId: { in: profissionalIds }, status: 'nao_lido' },
      });

      // Agendamentos hoje
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const totalAgendamentosHoje = await prisma.agendamento.count({
        where: { profissionalId: { in: profissionalIds }, dataHora: { gte: start, lt: end } },
      });

      // Agendamentos por status (groupBy)
      const agendPorStatusRaw = await prisma.agendamento.groupBy({
        by: ['status'],
        where: { profissionalId: { in: profissionalIds } },
        _count: { _all: true },
      });

      // Top profissionais (por número de agendamentos) - buscamos contagens e ordenamos em JS
      const profs = await prisma.profissional.findMany({
        where: { id: { in: profissionalIds } },
        include: {
          usuario: { select: { nome: true } },
          _count: { select: { agendamentos: true } },
        },
      });

      const topProfissionais = profs
        .map((p) => ({ id: p.id, nome: p.usuario?.nome || '', especialidade: p.especialidade, total: p._count?.agendamentos ?? 0 }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      // Appointments by day (last 7 days)
      const days: Array<{ day: string; date: Date }> = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        days.push({ day: d.toISOString().slice(0, 10), date: d });
      }

      const appointmentsByDay = await Promise.all(days.map(async (d) => {
        const startD = new Date(d.date);
        const endD = new Date(startD);
        endD.setDate(endD.getDate() + 1);
        const count = await prisma.agendamento.count({
          where: { profissionalId: { in: profissionalIds }, dataHora: { gte: startD, lt: endD } },
        });
        return { day: d.day, count };
      }));

      return res.json({
        totalUsuarios,
        totalPacientes,
        totalMedicos,
        totalAgendamentosHoje,
        totalContatosPendentes,
        agendamentosPorStatus: agendPorStatusRaw,
        topProfissionais,
        appointmentsByDay,
      });
    } catch (err) {
      logger.error('Admin summary error', err);
      return res.status(500).json({ error: 'Erro ao gerar resumo' });
    }
  }
}

export default new AdminController();

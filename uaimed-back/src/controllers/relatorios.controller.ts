import { Request, Response } from "express";
import { StatusVinculoClinica } from "@prisma/client";
import { prisma } from "../config/database";
import AuditoriaService from "../services/auditoria.service";
import { mascararCpf, mascararTelefone, mascararEmail } from "../utils/anonimizacao";
import logger from "../utils/logger";

function csvEscape(valor: string): string {
  if (/[",\n]/.test(valor)) return `"${valor.replace(/"/g, '""')}"`;
  return valor;
}

class RelatoriosController {
  // GET /admin/relatorios/pacientes — relatório anonimizado dos pacientes
  // atendidos pela clínica (CPF/telefone/e-mail mascarados).
  async pacientesCsv(req: Request, res: Response) {
    try {
      const clinicaId = req.user?.id;
      if (!clinicaId) return res.status(401).json({ error: "Usuário não autenticado" });

      const vinculos = await prisma.clinicaProfissional.findMany({
        where: { clinicaId, status: StatusVinculoClinica.aceito },
        select: { profissionalId: true },
      });
      const profissionalIds = vinculos.map((v) => v.profissionalId);

      const agendamentos = await prisma.agendamento.findMany({
        where: { profissionalId: { in: profissionalIds } },
        select: {
          dataHora: true,
          usuario: { select: { id: true, nome: true, cpf: true, telefone: true, email: true } },
        },
        orderBy: { dataHora: "desc" },
      });

      const porPaciente = new Map<string, { nome: string; cpf: string | null; telefone: string; email: string; total: number; ultima: Date }>();
      for (const ag of agendamentos) {
        const atual = porPaciente.get(ag.usuario.id);
        if (!atual) {
          porPaciente.set(ag.usuario.id, { ...ag.usuario, total: 1, ultima: ag.dataHora });
        } else {
          atual.total += 1;
          if (ag.dataHora > atual.ultima) atual.ultima = ag.dataHora;
        }
      }

      const cabecalho = ["Nome", "CPF", "Telefone", "Email", "TotalConsultas", "UltimaConsulta"];
      const linhas = Array.from(porPaciente.values()).map((p) => [
        p.nome,
        mascararCpf(p.cpf),
        mascararTelefone(p.telefone),
        mascararEmail(p.email),
        String(p.total),
        p.ultima.toISOString().slice(0, 10),
      ]);
      const csv = [cabecalho, ...linhas].map((linha) => linha.map(csvEscape).join(",")).join("\n");

      await AuditoriaService.registrarAcesso({
        ator: { id: clinicaId, tipo: req.user?.tipo },
        acao: "EXPORTAR_RELATORIO_PACIENTES",
        recurso: "RelatorioPacientes",
        pacientes: Array.from(porPaciente.entries()).map(([id, p]) => ({ id, nome: p.nome })),
        ip: req.ip,
      });

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", 'attachment; filename="relatorio-pacientes-anonimizado.csv"');
      return res.status(200).send(csv);
    } catch (err) {
      logger.error("Erro ao gerar relatório de pacientes", err);
      return res.status(500).json({ error: "Erro ao gerar relatório" });
    }
  }
}

export default new RelatoriosController();

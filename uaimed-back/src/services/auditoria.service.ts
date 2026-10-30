import { prisma } from "../config/database";
import logger from "../utils/logger";

export interface AtorAuditoria {
  id?: string;
  nome?: string | null;
  tipo?: string | null;
}

export interface PacienteAlvo {
  id: string;
  nome?: string | null;
}

interface RegistrarAcessoParams {
  ator?: AtorAuditoria;
  acao: string;
  recurso: string;
  recursoId?: string;
  // Pacientes cujos dados foram acessados. Se vazio/ausente, grava um único
  // registro sem pacienteId (ex.: ação que não é por paciente específico).
  pacientes?: PacienteAlvo[];
  detalhes?: Record<string, unknown>;
  ip?: string;
}

interface ListarFiltros {
  pacienteId?: string;
  pacienteIds?: string[];
  atorId?: string;
  skip?: number;
  take?: number;
}

class AuditoriaService {
  // Nunca deve lançar: uma falha ao auditar não pode derrubar a requisição principal.
  async registrarAcesso(params: RegistrarAcessoParams): Promise<void> {
    try {
      const alvos = params.pacientes && params.pacientes.length > 0 ? params.pacientes : [undefined];
      await prisma.logAuditoria.createMany({
        data: alvos.map((paciente) => ({
          atorId: params.ator?.id,
          atorNome: params.ator?.nome ?? undefined,
          atorTipo: params.ator?.tipo ?? undefined,
          acao: params.acao,
          recurso: params.recurso,
          recursoId: params.recursoId,
          pacienteId: paciente?.id,
          pacienteNome: paciente?.nome ?? undefined,
          detalhes: params.detalhes as any,
          ip: params.ip,
        })),
      });
    } catch (err) {
      logger.error("Erro ao registrar log de auditoria", err);
    }
  }

  async listar(filtros: ListarFiltros) {
    return prisma.logAuditoria.findMany({
      where: {
        ...(filtros.pacienteId ? { pacienteId: filtros.pacienteId } : {}),
        ...(filtros.pacienteIds ? { pacienteId: { in: filtros.pacienteIds } } : {}),
        ...(filtros.atorId ? { atorId: filtros.atorId } : {}),
      },
      orderBy: { criado_em: "desc" },
      skip: filtros.skip ?? 0,
      take: filtros.take ?? 50,
    });
  }

  // Expurgo de retenção: o próprio log de auditoria guarda dado pessoal
  // (pacienteNome) e não pode ficar retido indefinidamente. Chamado pelo
  // script `src/scripts/purgar-logs-auditoria.ts` (ver npm run logs:purgar).
  async purgarAntigos(retencaoEmMeses = 6): Promise<number> {
    const limite = new Date();
    limite.setMonth(limite.getMonth() - retencaoEmMeses);

    const resultado = await prisma.logAuditoria.deleteMany({
      where: { criado_em: { lt: limite } },
    });
    logger.info(`Expurgo de auditoria: ${resultado.count} registro(s) anteriores a ${limite.toISOString()} removidos`);
    return resultado.count;
  }
}

export default new AuditoriaService();

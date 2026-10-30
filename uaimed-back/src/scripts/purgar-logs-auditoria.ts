// Expurgo de retenção do log de auditoria (LGPD). Roda via `npm run
// logs:purgar`. Não há agendador de jobs no backend (sem infra de cron) —
// este script é pensado para ser chamado por um cron externo (crontab do
// host, scheduled task do Docker/CI, etc). Retenção padrão: 6 meses,
// ajustável pela env var LOGS_AUDITORIA_RETENCAO_MESES.
import AuditoriaService from "../services/auditoria.service";
import { prisma } from "../config/database";
import logger from "../utils/logger";

async function main() {
  const retencaoEmMeses = Number(process.env.LOGS_AUDITORIA_RETENCAO_MESES) || 6;
  const removidos = await AuditoriaService.purgarAntigos(retencaoEmMeses);
  logger.success(`Expurgo concluído: ${removidos} registro(s) de auditoria removido(s) (retenção: ${retencaoEmMeses} meses)`);
}

main()
  .catch((err) => {
    logger.error("Falha no expurgo de logs de auditoria", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

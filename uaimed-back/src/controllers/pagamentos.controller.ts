import { Request, Response } from "express";
import { prisma } from "../config/database";
import logger from "../utils/logger";

class PagamentosController {
  async validarCupom(req: Request, res: Response) {
    try {
      const { codigo } = req.body;
      if (!codigo) return res.status(400).json({ error: "Código do cupom obrigatório" });

      const cupom = await prisma.cupom.findUnique({ where: { codigo: codigo.toUpperCase() } });
      if (!cupom || !cupom.ativo) return res.status(400).json({ valido: false, mensagem: "Cupom inválido ou expirado" });
      if (cupom.usosLimite && cupom.usosAtuais >= cupom.usosLimite) return res.status(400).json({ valido: false, mensagem: "Cupom expirado (limite de usos atingido)" });
      if (new Date() > cupom.dataExpiracao) return res.status(400).json({ valido: false, mensagem: "Cupom expirado" });

      return res.json({ codigo: cupom.codigo, desconto: cupom.desconto, valido: true, dataExpiracao: cupom.dataExpiracao });
    } catch (err) {
      logger.error("Erro ao validar cupom", err);
      return res.status(500).json({ error: "Erro ao validar cupom" });
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).user?.id;
      if (!usuarioId) return res.status(401).json({ error: "Usuário não autenticado" });

      const pagamentos = await prisma.pagamento.findMany({
        where: { usuarioId },
        include: {
          agendamento: {
            select: {
              dataHora: true,
              profissional: {
                select: {
                  especialidade: true,
                  usuario: { select: { nome: true } },
                },
              },
            },
          },
        },
        orderBy: { criado_em: "desc" },
      });

      return res.json(pagamentos);
    } catch (err) {
      logger.error("Erro ao listar pagamentos", err);
      return res.status(500).json({ error: "Erro ao listar pagamentos" });
    }
  }

  async processar(req: Request, res: Response) {
    try {
      const { agendamentoId, valor, metodo, cupom, usingPlan, insuranceProvider, insuranceCoveragePercent } = req.body;
      const usuarioId = (req as any).user?.id;
      if (!usuarioId) return res.status(401).json({ error: "Usuário não autenticado" });
      if (!agendamentoId || !valor || !metodo) return res.status(400).json({ error: "Campos obrigatórios ausentes" });

      let desconto = 0;
      let planDiscount = 0;
      if (cupom) {
        const cupomData = await prisma.cupom.findUnique({ where: { codigo: cupom.toUpperCase() } });
        if (cupomData?.ativo && new Date() < cupomData.dataExpiracao) {
          desconto = (valor * cupomData.desconto) / 100;
          await prisma.cupom.update({ where: { id: cupomData.id }, data: { usosAtuais: cupomData.usosAtuais + 1 } });
        }
      }

      // Se o paciente estiver usando plano de saúde, aplicar desconto padrão (15%)
      if (usingPlan) {
        if (insuranceCoveragePercent && typeof insuranceCoveragePercent === 'number') {
          planDiscount = (valor * insuranceCoveragePercent) / 100;
        } else {
          planDiscount = (valor * 15) / 100; // default 15%
        }
      }

      const valorFinal = valor - desconto - planDiscount;

      const pagamento = await prisma.pagamento.create({ data: { usuarioId, agendamentoId, valor, desconto, valorFinal, metodo, cupom, status: "concluido" } });
      logger.success(`Pagamento processado: ${pagamento.id}`);

      return res.status(201).json({ id: pagamento.id, status: pagamento.status, valor: pagamento.valor, desconto: pagamento.desconto, valorFinal: pagamento.valorFinal, dataProcessamento: pagamento.criado_em });
    } catch (err) {
      logger.error("Erro ao processar pagamento", err);
      return res.status(500).json({ error: "Erro ao processar pagamento" });
    }
  }
}

export default new PagamentosController();

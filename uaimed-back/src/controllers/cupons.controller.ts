import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/database";
import logger from "../utils/logger";
import { CupomAtivoInput, CupomInput } from "../schemas/cupom.schema";

class CuponsController {
  // GET /api/admin/cupons
  async listar(_req: Request, res: Response) {
    try {
      const cupons = await prisma.cupom.findMany({ orderBy: { criado_em: "desc" } });
      return res.json(cupons);
    } catch (err) {
      logger.error("Erro ao listar cupons", err);
      return res.status(500).json({ error: "Erro ao listar cupons" });
    }
  }

  // POST /api/admin/cupons
  async criar(req: Request, res: Response) {
    try {
      const { codigo, desconto, dataExpiracao, usosLimite } = req.body as CupomInput;

      const cupom = await prisma.cupom.create({
        data: {
          codigo: codigo.toUpperCase(),
          desconto,
          dataExpiracao,
          usosLimite: usosLimite ?? null,
        },
      });

      logger.success(`Cupom criado: ${cupom.codigo}`);
      return res.status(201).json(cupom);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        return res.status(409).json({ error: "Já existe um cupom com esse código" });
      }
      logger.error("Erro ao criar cupom", err);
      return res.status(500).json({ error: "Erro ao criar cupom" });
    }
  }

  // PUT /api/admin/cupons/:id — ativa ou desativa (sem exclusão física: cupom
  // pode já ter sido usado em pagamentos concluídos, que precisam manter a referência)
  async atualizarAtivo(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { ativo } = req.body as CupomAtivoInput;

      const cupomAtual = await prisma.cupom.findUnique({ where: { id } });
      if (!cupomAtual) return res.status(404).json({ error: "Cupom não encontrado" });

      const cupom = await prisma.cupom.update({ where: { id }, data: { ativo } });

      logger.success(`Cupom ${ativo ? "reativado" : "desativado"}: ${cupom.codigo}`);
      return res.json(cupom);
    } catch (err) {
      logger.error("Erro ao atualizar cupom", err);
      return res.status(500).json({ error: "Erro ao atualizar cupom" });
    }
  }
}

export default new CuponsController();

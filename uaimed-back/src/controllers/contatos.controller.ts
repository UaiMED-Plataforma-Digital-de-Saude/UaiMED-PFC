import { Request, Response } from "express";
import { prisma } from "../config/database";
import logger from "../utils/logger";

class ContatosController {
  async criar(req: Request, res: Response) {
    try {
      const { profissionalId, assunto, mensagem } = req.body;
      const usuarioId = (req as any).user?.id;
      if (!usuarioId) return res.status(401).json({ error: "Usuário não autenticado" });
      if (!profissionalId || !assunto || !mensagem) return res.status(400).json({ error: "Preencha todos os campos" });

      const contato = await prisma.contato.create({ data: { usuarioId, profissionalId, assunto, mensagem } });
      logger.success(`Contato criado: ${contato.id}`);
      return res.status(201).json(contato);
    } catch (err) {
      logger.error("Erro ao criar contato", err);
      return res.status(500).json({ error: "Erro ao criar contato" });
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).user?.id;
      if (!usuarioId) return res.status(401).json({ error: "Usuário não autenticado" });

      // Busca o profissional vinculado ao usuário (caso seja médico)
      const profissional = await prisma.profissional.findUnique({ where: { usuarioId } });

      const contatos = await prisma.contato.findMany({
        where: {
          OR: [
            { usuarioId },
            // Se o usuário é um profissional, mostra também os contatos recebidos
            ...(profissional ? [{ profissionalId: profissional.id }] : []),
          ],
        },
        include: { usuario: { select: { id: true, nome: true, telefone: true } } },
        orderBy: { criado_em: "desc" },
      });
      return res.json(contatos);
    } catch (err) {
      logger.error("Erro ao listar contatos", err);
      return res.status(500).json({ error: "Erro ao listar contatos" });
    }
  }

  async marcarLido(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado" });

      const profissional = await prisma.profissional.findUnique({ where: { usuarioId: userId } });
      if (!profissional) return res.status(404).json({ error: "Profissional não encontrado" });

      const { id } = req.params;
      const contato = await prisma.contato.findUnique({ where: { id } });
      if (!contato || contato.profissionalId !== profissional.id) {
        return res.status(404).json({ error: "Contato não encontrado" });
      }

      const atualizado = await prisma.contato.update({ where: { id }, data: { status: "lido" } });
      return res.json(atualizado);
    } catch (err) {
      logger.error("Erro ao marcar contato como lido", err);
      return res.status(500).json({ error: "Erro ao marcar contato como lido" });
    }
  }
}

export default new ContatosController();

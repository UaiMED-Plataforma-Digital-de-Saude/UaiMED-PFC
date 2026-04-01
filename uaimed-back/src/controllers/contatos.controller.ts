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
        orderBy: { criado_em: "desc" },
      });
      return res.json(contatos);
    } catch (err) {
      logger.error("Erro ao listar contatos", err);
      return res.status(500).json({ error: "Erro ao listar contatos" });
    }
  }
}

export default new ContatosController();

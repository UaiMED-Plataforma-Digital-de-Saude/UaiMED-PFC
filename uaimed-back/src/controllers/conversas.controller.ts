import { Request, Response } from "express";
import { TipoUsuario } from "@prisma/client";
import { prisma } from "../config/database";
import logger from "../utils/logger";

const LIMITE_MENSAGEM = 500;

class ConversasController {
  // ── Listar todas as conversas do usuário logado ──────────────────────────────
  async listar(req: Request, res: Response) {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) return res.status(401).json({ error: "Não autenticado" });

      const profissional = await prisma.profissional.findUnique({ where: { usuarioId } });

      const conversas = await prisma.conversa.findMany({
        where: {
          OR: [
            { usuarioId },
            ...(profissional ? [{ profissionalId: profissional.id }] : []),
          ],
        },
        include: {
          usuario: { select: { id: true, nome: true, avatar: true } },
          profissional: {
            include: {
              usuario: { select: { id: true, nome: true, avatar: true } },
            },
          },
          mensagens: {
            orderBy: { criado_em: "desc" },
            take: 1,
          },
        },
        orderBy: { atualizado_em: "desc" },
      });

      // Contar mensagens não lidas por conversa
      const resultado = await Promise.all(
        conversas.map(async (conversa) => {
          const naoLidas = await prisma.mensagem.count({
            where: {
              conversaId: conversa.id,
              lida: false,
              // não conta as próprias mensagens
              NOT: { remetenteId: usuarioId },
            },
          });

          // Determinar o "outro lado" da conversa
          const isPaciente = conversa.usuarioId === usuarioId;
          const nomeOutro = isPaciente
            ? conversa.profissional.usuario.nome
            : conversa.usuario.nome;
          const avatarOutro = isPaciente
            ? conversa.profissional.usuario.avatar
            : conversa.usuario.avatar;
          const outroUsuarioId = isPaciente
            ? conversa.profissional.usuario.id
            : conversa.usuario.id;

          const ultimaMensagem = conversa.mensagens[0] ?? null;

          return {
            id: conversa.id,
            titulo: conversa.titulo ?? nomeOutro,
            nomeOutro,
            avatarOutro,
            outroUsuarioId,
            ultimaMensagem: ultimaMensagem
              ? { texto: ultimaMensagem.texto, criado_em: ultimaMensagem.criado_em }
              : null,
            naoLidas,
            criado_em: conversa.criado_em,
            atualizado_em: conversa.atualizado_em,
          };
        })
      );

      return res.json(resultado);
    } catch (err) {
      logger.error("Erro ao listar conversas", err);
      return res.status(500).json({ error: "Erro ao listar conversas" });
    }
  }

  // ── Iniciar ou retomar conversa com profissional ─────────────────────────────
  async iniciarOuRetomar(req: Request, res: Response) {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) return res.status(401).json({ error: "Não autenticado" });

      if (req.user?.tipo !== TipoUsuario.paciente) {
        return res.status(403).json({
          error: "Apenas pacientes podem iniciar uma conversa com um médico",
        });
      }

      const { profissionalId, titulo } = req.body;
      if (typeof profissionalId !== "string" || !profissionalId.trim()) {
        return res.status(400).json({ error: "profissionalId obrigatório" });
      }

      const profissional = await prisma.profissional.findFirst({
        where: {
          id: profissionalId,
          usuario: { ativo: true, tipo: TipoUsuario.medico },
        },
        select: { id: true, usuarioId: true },
      });

      if (!profissional) {
        return res.status(404).json({ error: "Médico não encontrado" });
      }

      if (profissional.usuarioId === usuarioId) {
        return res.status(400).json({ error: "Não é possível conversar consigo mesmo" });
      }

      const tituloNormalizado = typeof titulo === "string"
        ? titulo.trim().slice(0, 120) || undefined
        : undefined;

      const conversa = await prisma.conversa.upsert({
        where: { usuarioId_profissionalId: { usuarioId, profissionalId: profissional.id } },
        create: { usuarioId, profissionalId: profissional.id, titulo: tituloNormalizado },
        update: {},
        include: {
          usuario: { select: { id: true, nome: true } },
          profissional: { include: { usuario: { select: { id: true, nome: true } } } },
        },
      });

      logger.success(`Conversa ${conversa.id} iniciada/retomada`);
      return res.status(201).json(conversa);
    } catch (err) {
      logger.error("Erro ao iniciar conversa", err);
      return res.status(500).json({ error: "Erro ao iniciar conversa" });
    }
  }

  // ── Buscar mensagens de uma conversa ─────────────────────────────────────────
  async listarMensagens(req: Request, res: Response) {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) return res.status(401).json({ error: "Não autenticado" });

      const { conversaId } = req.params;

      // Verifica se o usuário tem acesso a essa conversa
      const profissional = await prisma.profissional.findUnique({ where: { usuarioId } });
      const conversa = await prisma.conversa.findFirst({
        where: {
          id: conversaId,
          OR: [
            { usuarioId },
            ...(profissional ? [{ profissionalId: profissional.id }] : []),
          ],
        },
      });
      if (!conversa) return res.status(403).json({ error: "Sem acesso a esta conversa" });

      // Marcar mensagens como lidas
      await prisma.mensagem.updateMany({
        where: { conversaId, lida: false, NOT: { remetenteId: usuarioId } },
        data: { lida: true },
      });

      const mensagens = await prisma.mensagem.findMany({
        where: { conversaId },
        include: {
          remetente: { select: { id: true, nome: true, avatar: true } },
        },
        orderBy: { criado_em: "asc" },
      });

      return res.json(mensagens);
    } catch (err) {
      logger.error("Erro ao buscar mensagens", err);
      return res.status(500).json({ error: "Erro ao buscar mensagens" });
    }
  }

  // ── Enviar mensagem ───────────────────────────────────────────────────────────
  async enviarMensagem(req: Request, res: Response) {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) return res.status(401).json({ error: "Não autenticado" });

      const { conversaId } = req.params;
      const { texto } = req.body;
      if (typeof texto !== "string" || !texto.trim()) {
        return res.status(400).json({ error: "Mensagem não pode ser vazia" });
      }
      if (texto.trim().length > LIMITE_MENSAGEM) {
        return res.status(400).json({
          error: `A mensagem deve ter no máximo ${LIMITE_MENSAGEM} caracteres`,
        });
      }

      // Verifica acesso
      const profissional = await prisma.profissional.findUnique({ where: { usuarioId } });
      const conversa = await prisma.conversa.findFirst({
        where: {
          id: conversaId,
          OR: [
            { usuarioId },
            ...(profissional ? [{ profissionalId: profissional.id }] : []),
          ],
        },
      });
      if (!conversa) return res.status(403).json({ error: "Sem acesso a esta conversa" });

      const [mensagem] = await prisma.$transaction([
        prisma.mensagem.create({
          data: { conversaId, remetenteId: usuarioId, texto: texto.trim() },
          include: {
            remetente: { select: { id: true, nome: true, avatar: true } },
          },
        }),
        prisma.conversa.update({
          where: { id: conversaId },
          data: { atualizado_em: new Date() },
        }),
      ]);

      logger.success(`Mensagem enviada na conversa ${conversaId}`);
      return res.status(201).json(mensagem);
    } catch (err) {
      logger.error("Erro ao enviar mensagem", err);
      return res.status(500).json({ error: "Erro ao enviar mensagem" });
    }
  }
}

export default new ConversasController();

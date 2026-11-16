import { Request, Response } from "express";
import UsersService from "../services/users.service";
import logger from "../utils/logger";

class UsersController {
  async atualizarPerfil(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado" });

      const updated = await UsersService.atualizarPerfil(userId, req.body);
      return res.json({ user: updated });
    } catch (err: any) {
      logger.error("Erro ao atualizar perfil", err);
      if (err?.code === "P2002" || err?.message === "CRM já cadastrado para outro profissional") {
        return res.status(409).json({ error: "CRM já cadastrado para outro profissional" });
      }
      if (err?.message === "Perfil profissional não encontrado" || err?.message === "Usuário não encontrado") {
        return res.status(404).json({ error: err.message });
      }
      if (err?.message === "Somente médicos podem alterar o próprio CRM") {
        return res.status(403).json({ error: err.message });
      }
      return res.status(500).json({ error: "Erro ao atualizar perfil" });
    }
  }

  async atualizarAvatar(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado" });

      const { avatar } = req.body as { avatar: string };
      const updated = await UsersService.atualizarAvatar(userId, avatar);
      return res.json({ avatar: updated.avatar });
    } catch (err) {
      logger.error("Erro ao atualizar avatar", err);
      return res.status(500).json({ error: "Erro ao atualizar avatar" });
    }
  }

  async salvarNotificacoes(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado" });

      const { email, push } = req.body as { email: boolean; push: boolean };
      const data = UsersService.registrarNotificacoes(userId, { email, push });
      return res.json({ message: "Preferências salvas", data });
    } catch (err) {
      logger.error("Erro ao salvar notificações", err);
      return res.status(500).json({ error: "Erro ao salvar notificações" });
    }
  }

  async registrarConsentimentoLgpd(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado" });

      const usuario = await UsersService.registrarConsentimentoLgpd(userId, (req as any).user?.tipo, req.ip);
      return res.json({
        precisaConsentimentoLgpd: false,
        consentimentoLgpdVersao: usuario.consentimentoLgpdVersao,
        consentimentoLgpdEm: usuario.consentimentoLgpdEm,
      });
    } catch (err) {
      logger.error("Erro ao registrar consentimento LGPD", err);
      return res.status(500).json({ error: "Erro ao registrar consentimento" });
    }
  }

  async exportarDados(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado" });

      const resultado = await UsersService.exportarDados(userId, (req as any).user?.tipo, req.ip);
      if (!resultado) return res.status(404).json({ error: "Usuário não encontrado" });
      return res.json(resultado);
    } catch (err) {
      logger.error("Erro ao exportar dados do usuário", err);
      return res.status(500).json({ error: "Erro ao exportar dados" });
    }
  }

  async excluirConta(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado" });

      const resultado = await UsersService.excluirConta(userId, (req as any).user?.tipo, req.ip);
      if (!resultado) return res.status(404).json({ error: "Usuário não encontrado" });
      return res.json({ message: "Conta removida. Seus dados identificadores foram anonimizados." });
    } catch (err) {
      logger.error("Erro ao excluir/anonimizar conta", err);
      return res.status(500).json({ error: "Erro ao excluir conta" });
    }
  }
}

export default new UsersController();

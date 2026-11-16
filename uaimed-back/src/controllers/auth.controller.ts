import { Request, Response } from "express";
import AuthService from "../services/auth.service";
import logger from "../utils/logger";

class AuthController {
  async signup(req: Request, res: Response) {
    try {
      const result = await AuthService.signup(req.body);
      return res.status(201).json({
        user: { ...result.usuario, profissional: result.profissional },
        token: result.token,
        refreshToken: result.refreshToken,
      });
    } catch (err: any) {
      logger.error("Erro ao registrar", err);
      // P2002 = unique constraint violation (e-mail ou CPF duplicado)
      // ou mensagem lançada pelo service antes da query
      if (err?.code === 'P2002' || err?.message === 'Email já cadastrado') {
        return res.status(409).json({ error: 'E-mail, CPF ou CNPJ já cadastrado' });
      }
      return res.status(400).json({ error: err?.message || "Erro ao registrar" });
    }
  }

  async signin(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: "Email e senha são obrigatórios" });

      const result = await AuthService.signin({ email, senha: password });
      return res.json({
        user: result.usuario,
        token: result.token,
        refreshToken: result.refreshToken,
      });
    } catch (err: any) {
      logger.error("Erro ao autenticar", err);
      return res.status(401).json({ error: err?.message || "Erro ao autenticar" });
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refresh(refreshToken);
      return res.json({ token: result.token, refreshToken: result.refreshToken });
    } catch (err: any) {
      logger.error("Erro ao renovar token", err);
      return res.status(401).json({ error: err?.message || "Erro ao renovar token" });
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: "oldPassword e newPassword são obrigatórios" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "A nova senha deve ter no mínimo 6 caracteres" });
      }

      await AuthService.changePassword(userId, oldPassword, newPassword, req.ip);
      return res.json({ message: "Senha alterada com sucesso" });
    } catch (err: any) {
      logger.error("Erro ao alterar senha", err);
      if (err?.message === "Senha atual incorreta") return res.status(400).json({ error: err.message });
      if (err?.message === "Usuário não encontrado") return res.status(404).json({ error: err.message });
      return res.status(500).json({ error: "Erro ao alterar senha" });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      await AuthService.logout(userId);
      return res.status(204).send();
    } catch (err) {
      logger.error("Erro ao encerrar sessão", err);
      return res.status(500).json({ error: "Erro ao encerrar sessão" });
    }
  }

  async solicitarRecuperacaoSenha(req: Request, res: Response) {
    try {
      await AuthService.solicitarRecuperacaoSenha(req.body.email);
    } catch (err: any) {
      // Não propaga o erro: resposta é sempre a mesma, pra não revelar se o
      // e-mail existe nem detalhes internos de falha de envio.
      logger.error("Erro ao solicitar recuperação de senha", err);
    }
    return res.json({ message: "Se o e-mail estiver cadastrado, enviaremos um código de recuperação." });
  }

  async confirmarRecuperacaoSenha(req: Request, res: Response) {
    try {
      const { email, codigo, novaSenha } = req.body;
      await AuthService.confirmarRecuperacaoSenha({ email, codigo, novaSenha, ip: req.ip });
      return res.json({ message: "Senha redefinida com sucesso" });
    } catch (err: any) {
      logger.error("Erro ao confirmar recuperação de senha", err);
      return res.status(400).json({ error: err?.message || "Erro ao redefinir senha" });
    }
  }
}

export default new AuthController();

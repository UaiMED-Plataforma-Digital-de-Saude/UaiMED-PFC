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
        return res.status(409).json({ error: 'E-mail ou CPF já cadastrado' });
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
      return res.json({ token: result.token });
    } catch (err: any) {
      logger.error("Erro ao renovar token", err);
      return res.status(401).json({ error: err?.message || "Erro ao renovar token" });
    }
  }
}

export default new AuthController();

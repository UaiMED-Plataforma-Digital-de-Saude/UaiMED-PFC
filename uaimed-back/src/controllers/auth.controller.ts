import { Request, Response } from "express";
import AuthService from "../services/auth.service";
import { prisma } from "../config/database";
import logger from "../utils/logger";

class AuthController {
  async signup(req: Request, res: Response) {
    try {
      const result = await AuthService.signup(req.body);
      // Retorna no formato esperado pelo frontend: { user, token }
      // Se for médico, tente carregar o registro de profissional
      let profissional = null;
      if (result.usuario?.tipo === 'medico') {
        profissional = await prisma.profissional.findUnique({ where: { usuarioId: result.usuario.id } });
      }

      return res.status(201).json({
        user: { ...result.usuario, profissional },
        token: result.token,
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
      // Retorna no formato esperado pelo frontend: { user, token }
      return res.json({
        user: result.usuario,
        token: result.token,
      });
    } catch (err: any) {
      logger.error("Erro ao autenticar", err);
      return res.status(401).json({ error: err?.message || "Erro ao autenticar" });
    }
  }
}

export default new AuthController();

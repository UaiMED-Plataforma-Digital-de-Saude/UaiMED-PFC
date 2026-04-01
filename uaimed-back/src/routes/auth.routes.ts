import { Router, Request, Response } from "express";
import AuthController from "../controllers/auth.controller";
import { signupSchemaValidated as signupSchema, signinSchema } from "../schemas/auth.schema";
import { validateBody } from "../middleware/validate";
import authMiddleware from "../middleware/auth";
import { prisma } from "../config/database";
import bcrypt from "bcryptjs";
import ENV from "../config/env";
import logger from "../utils/logger";

const router = Router();

// POST /api/usuarios
router.post("/usuarios", validateBody(signupSchema), (req: Request, res: Response) => AuthController.signup(req, res));

// POST /api/sessions
router.post("/sessions", validateBody(signinSchema), (req: Request, res: Response) => AuthController.signin(req, res));

// POST /api/auth/change-password — protegido por authMiddleware
router.post("/auth/change-password", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "oldPassword e newPassword são obrigatórios" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "A nova senha deve ter no mínimo 6 caracteres" });
    }

    const userId = (req as any).user?.id;
    const user = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const match = await bcrypt.compare(oldPassword, user.senha);
    if (!match) return res.status(400).json({ error: "Senha atual incorreta" });

    const hashed = await bcrypt.hash(newPassword, ENV.BCRYPT_ROUNDS);
    await prisma.usuario.update({ where: { id: user.id }, data: { senha: hashed } });

    logger.info(`Senha alterada para usuário: ${user.email}`);
    return res.json({ message: "Senha alterada com sucesso" });
  } catch (err) {
    logger.error("Erro ao alterar senha", err);
    return res.status(500).json({ error: "Erro ao alterar senha" });
  }
});

export default router;

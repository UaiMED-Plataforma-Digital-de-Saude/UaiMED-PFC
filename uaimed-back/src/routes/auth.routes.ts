import { Router, Request, Response } from "express";
import AuthController from "../controllers/auth.controller";
import {
  signupSchemaValidated as signupSchema,
  signinSchema,
  refreshSchema,
  passwordRecoverySchema,
  passwordRecoveryConfirmSchema,
} from "../schemas/auth.schema";
import { validateBody } from "../middleware/validate";
import authMiddleware from "../middleware/auth";
import { createAuthRateLimit } from "../middleware/rateLimit";

const router = Router();

// POST /api/usuarios
router.post("/usuarios", createAuthRateLimit(), validateBody(signupSchema), (req: Request, res: Response) => AuthController.signup(req, res));

// POST /api/sessions
router.post("/sessions", createAuthRateLimit({ skipSuccessfulRequests: true }), validateBody(signinSchema), (req: Request, res: Response) => AuthController.signin(req, res));

// POST /api/sessions/refresh — rotaciona o refresh token a cada uso
router.post("/sessions/refresh", createAuthRateLimit(), validateBody(refreshSchema), (req: Request, res: Response) => AuthController.refresh(req, res));

// POST /api/sessions/logout — revoga o refresh token do usuário autenticado
router.post("/sessions/logout", authMiddleware, (req: Request, res: Response) => AuthController.logout(req, res));

// POST /api/password-recovery
router.post("/password-recovery", createAuthRateLimit(), validateBody(passwordRecoverySchema), (req: Request, res: Response) => AuthController.solicitarRecuperacaoSenha(req, res));

// POST /api/password-recovery/confirmar
router.post("/password-recovery/confirmar", createAuthRateLimit(), validateBody(passwordRecoveryConfirmSchema), (req: Request, res: Response) => AuthController.confirmarRecuperacaoSenha(req, res));

// POST /api/auth/change-password
router.post("/auth/change-password", authMiddleware, (req: Request, res: Response) => AuthController.changePassword(req, res));

export default router;

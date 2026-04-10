import { Router, Request, Response } from "express";
import PagamentosController from "../controllers/pagamentos.controller";
import authMiddleware from "../middleware/auth";

const router = Router();

// POST /api/cupons/validar
router.post("/cupons/validar", (req: Request, res: Response) => PagamentosController.validarCupom(req, res));

// GET /api/pagamentos — lista pagamentos do usuário autenticado
router.get("/pagamentos", authMiddleware, (req: Request, res: Response) => PagamentosController.listar(req, res));

// POST /api/pagamentos
router.post("/pagamentos", authMiddleware, (req: Request, res: Response) => PagamentosController.processar(req, res));

export default router;

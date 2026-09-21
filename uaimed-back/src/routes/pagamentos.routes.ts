import { Router, Request, Response } from "express";
import PagamentosController from "../controllers/pagamentos.controller";
import authMiddleware from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { validarCupomSchema, processarPagamentoSchema } from "../schemas/pagamento.schema";

const router = Router();

// POST /api/cupons/validar
router.post("/cupons/validar", validateBody(validarCupomSchema), (req: Request, res: Response) => PagamentosController.validarCupom(req, res));

// GET /api/pagamentos — lista pagamentos do usuário autenticado
router.get("/pagamentos", authMiddleware, (req: Request, res: Response) => PagamentosController.listar(req, res));

// POST /api/pagamentos
router.post("/pagamentos", authMiddleware, validateBody(processarPagamentoSchema), (req: Request, res: Response) => PagamentosController.processar(req, res));

export default router;

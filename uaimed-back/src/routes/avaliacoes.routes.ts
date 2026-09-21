import { Router, Request, Response } from "express";
import AvaliacoesController from "../controllers/avaliacoes.controller";
import authMiddleware from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { criarAvaliacaoSchema } from "../schemas/avaliacao.schema";

const router = Router();

// POST /api/avaliacoes (protegido — requer autenticação)
router.post("/avaliacoes", authMiddleware, validateBody(criarAvaliacaoSchema), (req: Request, res: Response) => AvaliacoesController.criar(req, res));

// GET /api/avaliacoes/medico/:id/media
router.get("/avaliacoes/medico/:id/media", (req: Request, res: Response) => AvaliacoesController.obterMedia(req, res));

export default router;

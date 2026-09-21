import { Router, Request, Response } from 'express';
import ContaBancariaController from '../controllers/conta-bancaria.controller';
import authMiddleware from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { atualizarContaBancariaSchema } from '../schemas/conta-bancaria.schema';

const router = Router();

// GET /api/conta-bancaria
router.get('/conta-bancaria', authMiddleware, (req: Request, res: Response) =>
  ContaBancariaController.obter(req, res)
);

// PUT /api/conta-bancaria
router.put('/conta-bancaria', authMiddleware, validateBody(atualizarContaBancariaSchema), (req: Request, res: Response) =>
  ContaBancariaController.atualizar(req, res)
);

export default router;


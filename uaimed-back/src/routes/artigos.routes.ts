import { Router } from 'express';
import artigosController from '../controllers/artigos.controller';
import authMiddleware from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { artigoSchema } from '../schemas/artigo.schema';

const router = Router();

// Leitura pública — qualquer um pode ler artigos
router.get('/artigos',     artigosController.listar);
router.get('/artigos/:id', artigosController.buscarPorId);

// Criação e edição requerem autenticação
router.post('/artigos', authMiddleware, validateBody(artigoSchema), artigosController.criar);
router.put('/artigos/:id', authMiddleware, validateBody(artigoSchema), artigosController.atualizar);

export default router;

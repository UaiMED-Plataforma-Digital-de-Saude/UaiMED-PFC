import { Router } from 'express';
import artigosController from '../controllers/artigos.controller';
import authMiddleware from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { artigoSchema } from '../schemas/artigo.schema';
import { requireArticleAdmin } from '../middleware/articleAdmin';

const router = Router();

// Leitura pública — qualquer um pode ler artigos
router.get('/artigos',     artigosController.listar);
router.get('/artigos/:id', artigosController.buscarPorId);

// Administração exclusiva da conta admin@uaimed.com.
router.get('/admin/artigos', authMiddleware, requireArticleAdmin, artigosController.listar);
router.post('/artigos', authMiddleware, requireArticleAdmin, validateBody(artigoSchema), artigosController.criar);
router.put('/artigos/:id', authMiddleware, requireArticleAdmin, validateBody(artigoSchema), artigosController.atualizar);

export default router;

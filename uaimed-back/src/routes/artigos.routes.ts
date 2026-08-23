import { Router } from 'express';
import artigosController from '../controllers/artigos.controller';
import authMiddleware from '../middleware/auth';

const router = Router();

// Leitura pública — qualquer um pode ler artigos
router.get('/artigos',     artigosController.listar);
router.get('/artigos/:id', artigosController.buscarPorId);

// Criação e edição requerem autenticação
router.post('/artigos', authMiddleware, artigosController.criar);
router.put('/artigos/:id', authMiddleware, artigosController.atualizar);

export default router;

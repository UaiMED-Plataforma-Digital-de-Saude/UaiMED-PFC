import { Router } from 'express';
import ConveniosController from '../controllers/convenios.controller';

const router = Router();

// GET /api/convenios
router.get('/convenios', (req, res) => ConveniosController.listar(req, res));

export default router;

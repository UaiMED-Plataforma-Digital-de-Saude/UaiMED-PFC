import { Router } from 'express';
import EspecialidadesController from '../controllers/especialidades.controller';

const router = Router();

// GET /api/especialidades
router.get('/especialidades', (req, res) => EspecialidadesController.listar(req, res));

export default router;


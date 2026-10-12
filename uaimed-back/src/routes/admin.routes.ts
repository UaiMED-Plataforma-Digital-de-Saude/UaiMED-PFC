import { Router } from "express";

import AdminController from "../controllers/admin.controller";
import authMiddleware from "../middleware/auth";
import requireRole from "../middleware/role";
import { TipoUsuario } from "@prisma/client";
import DestaquesController from '../controllers/destaques.controller';
import { requireAdmin } from '../middleware/articleAdmin';
import { validateBody } from '../middleware/validate';
import { destaquesSchema } from '../schemas/destaques.schema';

const router = Router();

router.get('/admin/destaques', authMiddleware, requireAdmin, (req, res) => DestaquesController.listar(req, res));
router.put('/admin/destaques', authMiddleware, requireAdmin, validateBody(destaquesSchema), (req, res) => DestaquesController.salvar(req, res));

// Protegido: apenas usuários autenticados com tipo 'clinica'
router.get('/admin/summary', authMiddleware, requireRole(TipoUsuario.clinica), (req, res) => AdminController.summary(req, res));

export default router;

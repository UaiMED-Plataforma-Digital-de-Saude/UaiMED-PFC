import { Router } from "express";

import AdminController from "../controllers/admin.controller";
import authMiddleware from "../middleware/auth";
import requireRole from "../middleware/role";
import { TipoUsuario } from "@prisma/client";

const router = Router();

// Protegido: apenas usuários autenticados com tipo 'clinica'
router.get('/admin/summary', authMiddleware, requireRole(TipoUsuario.clinica), (req, res) => AdminController.summary(req, res));

export default router;

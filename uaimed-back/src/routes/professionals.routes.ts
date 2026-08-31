import { Router } from "express";
import ProfessionalController from "../controllers/professional.controller";
import authMiddleware from "../middleware/auth";
import requireRole from "../middleware/role";
import { TipoUsuario } from "@prisma/client";

const router = Router();

// GET /api/professionals/me/summary - protegido para profissionais
router.get('/professionals/me/summary', authMiddleware, requireRole(TipoUsuario.medico), (req, res) => ProfessionalController.meSummary(req, res));

// PUT /api/professionals/me/endereco - atualiza endereço e re-geocodifica
router.put('/professionals/me/endereco', authMiddleware, requireRole(TipoUsuario.medico), (req, res) => ProfessionalController.atualizarEndereco(req, res));

export default router;

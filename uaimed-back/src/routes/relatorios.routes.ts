import { Router } from "express";
import { TipoUsuario } from "@prisma/client";
import authMiddleware from "../middleware/auth";
import requireRole from "../middleware/role";
import RelatoriosController from "../controllers/relatorios.controller";

const router = Router();

router.get(
  "/admin/relatorios/pacientes",
  authMiddleware,
  requireRole(TipoUsuario.clinica),
  (req, res) => RelatoriosController.pacientesCsv(req, res),
);

export default router;

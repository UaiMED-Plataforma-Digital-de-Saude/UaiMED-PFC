import { Router } from "express";
import AgendamentosController from "../controllers/agendamentos.controller";

const agendamentosController = new AgendamentosController();
import authMiddleware from "../middleware/auth";

const router = Router();


// GET /api/agendamentos/sugestoes-horario?medicoId=xxx
router.get('/agendamentos/sugestoes-horario', (req, res) => agendamentosController.sugerirHorarios(req, res));

// GET /api/agendamentos (protegido)
router.get('/agendamentos', authMiddleware, (req, res) => agendamentosController.listar(req, res));

export default router;

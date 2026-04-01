import { Router } from "express";
import authMiddleware from "../middleware/auth";
import AgendamentosController from "../controllers/agendamentos.controller";

const agendamentosController = new AgendamentosController();

const router = Router();


// GET /api/agendamentos/sugestoes-horario?medicoId=xxx
router.get('/agendamentos/sugestoes-horario', (req, res) => agendamentosController.sugerirHorarios(req, res));

// POST /api/agendamentos (protegido) — cria um novo agendamento
router.post('/agendamentos', authMiddleware, (req, res) => agendamentosController.criar(req, res));

// GET /api/agendamentos (protegido)
router.get('/agendamentos', authMiddleware, (req, res) => agendamentosController.listar(req, res));

export default router;

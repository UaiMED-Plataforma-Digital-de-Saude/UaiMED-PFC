import { Router } from "express";
import authMiddleware from "../middleware/auth";
import AgendamentosController from "../controllers/agendamentos.controller";
import { validateBody } from "../middleware/validate";
import { criarAgendamentoSchema, remarcarAgendamentoSchema } from "../schemas/agendamento.schema";

const agendamentosController = new AgendamentosController();

const router = Router();


// GET /api/agendamentos/sugestoes-horario?medicoId=xxx
router.get('/agendamentos/sugestoes-horario', (req, res) => agendamentosController.sugerirHorarios(req, res));

// POST /api/agendamentos (protegido) — cria um novo agendamento
router.post('/agendamentos', authMiddleware, validateBody(criarAgendamentoSchema), (req, res) => agendamentosController.criar(req, res));

// GET /api/agendamentos (protegido)
router.get('/agendamentos', authMiddleware, (req, res) => agendamentosController.listar(req, res));

// PATCH /api/agendamentos/:id/cancelar (protegido) — cancela um agendamento do próprio usuário
router.patch('/agendamentos/:id/cancelar', authMiddleware, (req, res) => agendamentosController.cancelar(req, res));

// PATCH /api/agendamentos/:id/remarcar (protegido) — altera a data/hora de um agendamento do próprio usuário
router.patch('/agendamentos/:id/remarcar', authMiddleware, validateBody(remarcarAgendamentoSchema), (req, res) => agendamentosController.remarcar(req, res));

export default router;

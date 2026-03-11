import { Router } from "express";
import MedicosController from "../controllers/medicos.controller";

const router = Router();

// GET /api/medicos
router.get('/medicos', (req, res) => MedicosController.listar(req, res));
router.get('/medicos/recomendados', (req, res) => MedicosController.recomendados(req, res));

export default router;

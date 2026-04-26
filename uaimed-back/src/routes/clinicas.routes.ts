import { Router } from "express";
import ClinicasController from "../controllers/clinicas.controller";

const router = Router();

// GET /api/clinicas/recomendadas
router.get('/clinicas/recomendadas', (req, res) => ClinicasController.recomendadas(req, res));
router.get('/clinicas', (req, res) => ClinicasController.listar(req, res));

export default router;

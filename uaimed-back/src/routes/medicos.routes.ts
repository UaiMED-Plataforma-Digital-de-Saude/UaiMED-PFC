import { Router } from "express";
import MedicosController from "../controllers/medicos.controller";

const router = Router();

router.get('/medicos/recomendados', (req, res) => MedicosController.recomendados(req, res));
router.get('/medicos', (req, res) => MedicosController.listar(req, res));
router.get('/medicos/:id', (req, res) => MedicosController.detalhe(req, res));

export default router;

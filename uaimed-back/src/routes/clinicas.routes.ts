import { Router } from "express";
import ClinicasController from "../controllers/clinicas.controller";

const router = Router();

router.get('/clinicas/recomendadas', (req, res) => ClinicasController.recomendadas(req, res));
router.get('/clinicas', (req, res) => ClinicasController.listar(req, res));
router.get('/clinicas/:id', (req, res) => ClinicasController.detalhe(req, res));

export default router;

import { Router } from "express";
import { TipoUsuario } from '@prisma/client';
import ClinicasController from "../controllers/clinicas.controller";
import authMiddleware from '../middleware/auth';
import requireRole from '../middleware/role';

const router = Router();

router.get('/clinicas/recomendadas', (req, res) => ClinicasController.recomendadas(req, res));
router.get('/clinicas', (req, res) => ClinicasController.listar(req, res));
router.get('/clinicas/me', authMiddleware, requireRole(TipoUsuario.clinica), (req, res) =>
  ClinicasController.minhaClinica(req, res));
router.get('/clinicas/me/medicos', authMiddleware, requireRole(TipoUsuario.clinica), (req, res) =>
  ClinicasController.medicosParaVinculo(req, res));
router.post('/clinicas/me/medicos', authMiddleware, requireRole(TipoUsuario.clinica), (req, res) =>
  ClinicasController.vincularMedico(req, res));
router.delete('/clinicas/me/medicos/:profissionalId', authMiddleware, requireRole(TipoUsuario.clinica), (req, res) =>
  ClinicasController.desvincularMedico(req, res));
router.get('/clinicas/solicitacoes', authMiddleware, requireRole(TipoUsuario.medico), (req, res) =>
  ClinicasController.solicitacoesDoMedico(req, res));
router.patch('/clinicas/solicitacoes/:clinicaId', authMiddleware, requireRole(TipoUsuario.medico), (req, res) =>
  ClinicasController.responderSolicitacao(req, res));
router.get('/clinicas/:id', (req, res) => ClinicasController.detalhe(req, res));

export default router;

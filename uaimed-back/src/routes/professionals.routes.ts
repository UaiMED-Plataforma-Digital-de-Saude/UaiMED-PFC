import { Router } from "express";
import ProfessionalController from "../controllers/professional.controller";
import authMiddleware from "../middleware/auth";
import requireRole from "../middleware/role";
import { TipoUsuario } from "@prisma/client";
import { validateBody } from "../middleware/validate";
import { atualizarEnderecoSchema, atualizarPrecoSchema, disponibilidadeSchema } from "../schemas/professional.schema";

const router = Router();

// GET /api/professionals/me/summary - protegido para profissionais
router.get('/professionals/me/summary', authMiddleware, requireRole(TipoUsuario.medico), (req, res) => ProfessionalController.meSummary(req, res));

// GET /api/professionals/me/agendamentos - consultas recebidas pelo médico autenticado
router.get('/professionals/me/agendamentos', authMiddleware, requireRole(TipoUsuario.medico), (req, res) => ProfessionalController.listarAgendamentos(req, res));

// GET /api/professionals/me/avaliacoes - avaliações recebidas pelo médico autenticado
router.get('/professionals/me/avaliacoes', authMiddleware, requireRole(TipoUsuario.medico), (req, res) => ProfessionalController.listarAvaliacoes(req, res));

// PUT /api/professionals/me/endereco - atualiza endereço e re-geocodifica
router.put('/professionals/me/endereco', authMiddleware, requireRole(TipoUsuario.medico), validateBody(atualizarEnderecoSchema), (req, res) => ProfessionalController.atualizarEndereco(req, res));

// PUT /api/professionals/me/preco - atualiza o preço da consulta
router.put('/professionals/me/preco', authMiddleware, requireRole(TipoUsuario.medico), validateBody(atualizarPrecoSchema), (req, res) => ProfessionalController.atualizarPreco(req, res));

// GET /api/professionals/me/disponibilidade - janela de atendimento por dia da semana
router.get('/professionals/me/disponibilidade', authMiddleware, requireRole(TipoUsuario.medico), (req, res) => ProfessionalController.obterDisponibilidade(req, res));

// PUT /api/professionals/me/disponibilidade - substitui a janela de atendimento dos 7 dias
router.put('/professionals/me/disponibilidade', authMiddleware, requireRole(TipoUsuario.medico), validateBody(disponibilidadeSchema), (req, res) => ProfessionalController.atualizarDisponibilidade(req, res));

export default router;

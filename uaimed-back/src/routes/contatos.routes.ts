import { Router, Request, Response } from "express";
import { TipoUsuario } from "@prisma/client";
import authMiddleware from "../middleware/auth";
import requireRole from "../middleware/role";
import ContatosController from "../controllers/contatos.controller";
import { contatoSchema } from "../schemas/contato.schema";
import { validateBody } from "../middleware/validate";

const router = Router();

// POST /api/contatos
router.post("/contatos", authMiddleware, validateBody(contatoSchema), (req: Request, res: Response) => ContatosController.criar(req, res));

// GET /api/contatos
router.get("/contatos", authMiddleware, (req: Request, res: Response) => ContatosController.listar(req, res));

// PATCH /api/contatos/:id/lido - protegido para o médico destinatário do contato
router.patch("/contatos/:id/lido", authMiddleware, requireRole(TipoUsuario.medico), (req: Request, res: Response) => ContatosController.marcarLido(req, res));

export default router;

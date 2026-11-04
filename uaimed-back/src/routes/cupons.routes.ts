import { Router } from "express";
import CuponsController from "../controllers/cupons.controller";
import authMiddleware from "../middleware/auth";
import { requireAdmin } from "../middleware/articleAdmin";
import { validateBody } from "../middleware/validate";
import { cupomAtivoSchema, cupomSchema } from "../schemas/cupom.schema";

const router = Router();

// Administração exclusiva da conta admin@uaimed.com (mesmo padrão de artigos/destaques).
router.get("/admin/cupons", authMiddleware, requireAdmin, (req, res) => CuponsController.listar(req, res));
router.post("/admin/cupons", authMiddleware, requireAdmin, validateBody(cupomSchema), (req, res) => CuponsController.criar(req, res));
router.put("/admin/cupons/:id", authMiddleware, requireAdmin, validateBody(cupomAtivoSchema), (req, res) => CuponsController.atualizarAtivo(req, res));

export default router;

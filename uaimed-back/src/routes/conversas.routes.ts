import { Router, Request, Response } from "express";
import authMiddleware from "../middleware/auth";
import ConversasController from "../controllers/conversas.controller";

const router = Router();

// GET  /api/conversas              – listar conversas do usuário logado
router.get("/conversas", authMiddleware, (req: Request, res: Response) =>
  ConversasController.listar(req, res)
);

// POST /api/conversas              – iniciar ou retomar conversa com profissional
router.post("/conversas", authMiddleware, (req: Request, res: Response) =>
  ConversasController.iniciarOuRetomar(req, res)
);

// GET  /api/conversas/:conversaId/mensagens – listar mensagens
router.get("/conversas/:conversaId/mensagens", authMiddleware, (req: Request, res: Response) =>
  ConversasController.listarMensagens(req, res)
);

// POST /api/conversas/:conversaId/mensagens – enviar mensagem
router.post("/conversas/:conversaId/mensagens", authMiddleware, (req: Request, res: Response) =>
  ConversasController.enviarMensagem(req, res)
);

export default router;

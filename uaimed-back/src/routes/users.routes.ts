import { Router } from "express";
import authMiddleware from "../middleware/auth";
import logger from "../utils/logger";

const router = Router();

// POST /api/users/me/notifications
router.post('/users/me/notifications', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' });

    const { email, push } = req.body as any;
    // Não temos tabela para armazenar preferências; aqui apenas simulamos e retornamos sucesso.
    logger.info(`Salvando preferências de notificação para ${userId}: email=${email}, push=${push}`);

    return res.json({ message: 'Preferências salvas', data: { email, push } });
  } catch (err) {
    logger.error('Erro ao salvar notificações', err);
    return res.status(500).json({ error: 'Erro ao salvar notificações' });
  }
});

export default router;

import { Router } from "express";
import authMiddleware from "../middleware/auth";
import { prisma } from "../config/database";
import logger from "../utils/logger";

const router = Router();

// PUT /api/users/me — atualiza nome e telefone do usuário autenticado
router.put('/users/me', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' });

    const { nome, telefone } = req.body as { nome?: string; telefone?: string };

    const updated = await prisma.usuario.update({
      where: { id: userId },
      data: {
        ...(nome?.trim()     ? { nome: nome.trim() }         : {}),
        ...(telefone?.trim() ? { telefone: telefone.trim() } : {}),
      },
      select: { id: true, nome: true, email: true, cpf: true, telefone: true, tipo: true, avatar: true },
    });

    return res.json({ user: updated });
  } catch (err) {
    logger.error('Erro ao atualizar perfil', err);
    return res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

// PUT /api/users/me/avatar — recebe base64 e salva no campo avatar
router.put('/users/me/avatar', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' });

    const { avatar } = req.body as { avatar?: string };
    if (!avatar || !avatar.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Imagem inválida. Envie no formato base64.' });
    }

    const updated = await prisma.usuario.update({
      where: { id: userId },
      data: { avatar },
      select: { id: true, avatar: true },
    });

    return res.json({ avatar: updated.avatar });
  } catch (err) {
    logger.error('Erro ao atualizar avatar', err);
    return res.status(500).json({ error: 'Erro ao atualizar avatar' });
  }
});

// POST /api/users/me/notifications
router.post('/users/me/notifications', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' });

    const { email, push } = req.body as any;
    logger.info(`Salvando preferências de notificação para ${userId}: email=${email}, push=${push}`);

    return res.json({ message: 'Preferências salvas', data: { email, push } });
  } catch (err) {
    logger.error('Erro ao salvar notificações', err);
    return res.status(500).json({ error: 'Erro ao salvar notificações' });
  }
});

export default router;

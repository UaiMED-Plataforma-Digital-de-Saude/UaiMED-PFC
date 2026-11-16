import { Router } from "express";
import authMiddleware from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { atualizarPerfilSchema, atualizarAvatarSchema, notificationsSchema } from "../schemas/users.schema";
import UsersController from "../controllers/users.controller";

const router = Router();

// PUT /api/users/me — atualiza a conta e, para médicos, o próprio CRM.
router.put('/users/me', authMiddleware, validateBody(atualizarPerfilSchema), (req, res) => UsersController.atualizarPerfil(req, res));

// PUT /api/users/me/avatar — recebe base64 e salva no campo avatar
router.put('/users/me/avatar', authMiddleware, validateBody(atualizarAvatarSchema), (req, res) => UsersController.atualizarAvatar(req, res));

// POST /api/users/me/notifications
router.post('/users/me/notifications', authMiddleware, validateBody(notificationsSchema), (req, res) => UsersController.salvarNotificacoes(req, res));

// POST /api/users/me/consentimento-lgpd — reconsentimento (usuários criados
// antes do fluxo de consentimento, ou que aceitaram uma versão antiga da
// política). Login segue liberado sem isso; o app bloqueia a navegação até
// este endpoint ser chamado quando `precisaConsentimentoLgpd` vem true.
router.post('/users/me/consentimento-lgpd', authMiddleware, (req, res) => UsersController.registrarConsentimentoLgpd(req, res));

// GET /api/users/me/dados — exporta os dados pessoais do usuário autenticado
// (direito de acesso/portabilidade, arts. 18-22 da LGPD).
router.get('/users/me/dados', authMiddleware, (req, res) => UsersController.exportarDados(req, res));

// DELETE /api/users/me — direito de eliminação (arts. 18-22 da LGPD).
router.delete('/users/me', authMiddleware, (req, res) => UsersController.excluirConta(req, res));

export default router;

import { Router } from "express";
import authMiddleware from "../middleware/auth";
import { prisma } from "../config/database";
import logger from "../utils/logger";
import { validateBody } from "../middleware/validate";
import { atualizarPerfilSchema, atualizarAvatarSchema, notificationsSchema } from "../schemas/users.schema";
import { LGPD_POLICY_VERSION } from "../constants/lgpd";
import AuditoriaService from "../services/auditoria.service";
import { hashPassword } from "../utils/hash";
import crypto from "node:crypto";

const router = Router();

// PUT /api/users/me — atualiza nome e telefone do usuário autenticado
router.put('/users/me', authMiddleware, validateBody(atualizarPerfilSchema), async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' });

    const { nome, telefone, endereco, cidade, estado, cep } = req.body as {
      nome?: string;
      telefone?: string;
      endereco?: string;
      cidade?: string;
      estado?: string;
      cep?: string;
    };
    const usuarioAtual = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { tipo: true },
    });
    if (!usuarioAtual) return res.status(404).json({ error: 'Usuário não encontrado' });

    const updated = await prisma.usuario.update({
      where: { id: userId },
      data: {
        ...(nome?.trim()     ? { nome: nome.trim() }         : {}),
        ...(telefone?.trim() ? { telefone: telefone.trim() } : {}),
        ...(usuarioAtual.tipo === 'clinica' ? {
          endereco: endereco?.trim() || null,
          cidade: cidade?.trim() || null,
          estado: estado?.trim().toUpperCase() || null,
          cep: cep?.trim() || null,
        } : {}),
      },
      select: {
        id: true, nome: true, email: true, cpf: true, cnpj: true,
        telefone: true, tipo: true, avatar: true, endereco: true,
        cidade: true, estado: true, cep: true,
      },
    });

    return res.json({ user: updated });
  } catch (err) {
    logger.error('Erro ao atualizar perfil', err);
    return res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

// PUT /api/users/me/avatar — recebe base64 e salva no campo avatar
router.put('/users/me/avatar', authMiddleware, validateBody(atualizarAvatarSchema), async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' });

    const { avatar } = req.body as { avatar: string };

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
router.post('/users/me/notifications', authMiddleware, validateBody(notificationsSchema), async (req, res) => {
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

// POST /api/users/me/consentimento-lgpd — reconsentimento (usuários criados
// antes do fluxo de consentimento, ou que aceitaram uma versão antiga da
// política). Login segue liberado sem isso; o app bloqueia a navegação até
// este endpoint ser chamado quando `precisaConsentimentoLgpd` vem true.
router.post('/users/me/consentimento-lgpd', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' });

    const usuario = await prisma.usuario.update({
      where: { id: userId },
      data: {
        consentimentoLgpd: true,
        consentimentoLgpdVersao: LGPD_POLICY_VERSION,
        consentimentoLgpdEm: new Date(),
      },
      select: { id: true, nome: true, consentimentoLgpd: true, consentimentoLgpdVersao: true, consentimentoLgpdEm: true },
    });

    await AuditoriaService.registrarAcesso({
      ator: { id: userId, tipo: (req as any).user?.tipo },
      acao: 'REGISTRAR_CONSENTIMENTO_LGPD',
      recurso: 'Usuario',
      recursoId: userId,
      pacientes: [{ id: userId, nome: usuario.nome }],
      detalhes: { versao: LGPD_POLICY_VERSION },
      ip: req.ip,
    });

    return res.json({ precisaConsentimentoLgpd: false, consentimentoLgpdVersao: usuario.consentimentoLgpdVersao, consentimentoLgpdEm: usuario.consentimentoLgpdEm });
  } catch (err) {
    logger.error('Erro ao registrar consentimento LGPD', err);
    return res.status(500).json({ error: 'Erro ao registrar consentimento' });
  }
});

// GET /api/users/me/dados — exporta os dados pessoais do usuário autenticado
// (direito de acesso/portabilidade, arts. 18-22 da LGPD).
router.get('/users/me/dados', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' });

    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true, nome: true, email: true, cpf: true, cnpj: true, telefone: true, tipo: true,
        avatar: true, endereco: true, cidade: true, estado: true, cep: true,
        pixKey: true, banco: true, agencia: true, conta: true, tipoConta: true,
        ativo: true, consentimentoLgpd: true, consentimentoLgpdVersao: true, consentimentoLgpdEm: true,
        criado_em: true, atualizado_em: true,
        profissional: {
          select: {
            id: true, especialidade: true, crm: true, dataFormacao: true,
            endereco: true, cidade: true, estado: true, cep: true,
            pixKey: true, banco: true, agencia: true, conta: true, tipoConta: true,
            precoConsulta: true, criado_em: true,
          },
        },
        _count: {
          select: { agendamentos: true, avaliacoes: true, pagamentos: true, contatos: true, mensagens: true, conversas: true },
        },
      },
    });
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });

    await AuditoriaService.registrarAcesso({
      ator: { id: userId, tipo: (req as any).user?.tipo },
      acao: 'EXPORTAR_MEUS_DADOS',
      recurso: 'Usuario',
      recursoId: userId,
      pacientes: [{ id: userId, nome: usuario.nome }],
      ip: req.ip,
    });

    const { _count, ...dadosPessoais } = usuario;
    return res.json({
      exportadoEm: new Date().toISOString(),
      dadosPessoais,
      resumoAtividade: {
        agendamentos: _count.agendamentos,
        avaliacoes: _count.avaliacoes,
        pagamentos: _count.pagamentos,
        contatos: _count.contatos,
        mensagensEnviadas: _count.mensagens,
        conversas: _count.conversas,
      },
    });
  } catch (err) {
    logger.error('Erro ao exportar dados do usuário', err);
    return res.status(500).json({ error: 'Erro ao exportar dados' });
  }
});

// DELETE /api/users/me — direito de eliminação (arts. 18-22 da LGPD).
// Anonimiza a conta em vez de excluir fisicamente: agendamentos, pagamentos
// e avaliações ligados a este usuário são registros legítimos de terceiros
// (médico/clínica têm obrigação de manter histórico financeiro/assistencial)
// e têm onDelete: Cascade no schema — uma exclusão física apagaria esse
// histórico junto. A conta fica inativa e com os dados identificadores
// mascarados; não é mais possível logar nela.
router.delete('/users/me', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' });

    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { nome: true, tipo: true, profissional: { select: { id: true } } },
    });
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });

    const senhaAnonima = await hashPassword(crypto.randomUUID());

    await prisma.usuario.update({
      where: { id: userId },
      data: {
        nome: 'Usuário Removido',
        email: `removido-${userId}@uaimed.invalid`,
        cpf: null,
        cnpj: null,
        telefone: '',
        senha: senhaAnonima,
        avatar: null,
        endereco: null,
        cidade: null,
        estado: null,
        cep: null,
        pixKey: null,
        banco: null,
        agencia: null,
        conta: null,
        tipoConta: null,
        ativo: false,
        destaque: false,
      },
    });

    if (usuario.profissional) {
      await prisma.profissional.update({
        where: { id: usuario.profissional.id },
        data: {
          endereco: '', cidade: '', estado: '', cep: '',
          latitude: null, longitude: null,
          pixKey: null, banco: null, agencia: null, conta: null, tipoConta: null,
          destaque: false,
        },
      });
    }

    logger.info(`Conta anonimizada a pedido do titular: ${userId}`);

    await AuditoriaService.registrarAcesso({
      ator: { id: userId, tipo: (req as any).user?.tipo },
      acao: 'EXCLUIR_CONTA',
      recurso: 'Usuario',
      recursoId: userId,
      pacientes: [{ id: userId, nome: usuario.nome }],
      ip: req.ip,
    });

    return res.json({ message: 'Conta removida. Seus dados identificadores foram anonimizados.' });
  } catch (err) {
    logger.error('Erro ao excluir/anonimizar conta', err);
    return res.status(500).json({ error: 'Erro ao excluir conta' });
  }
});

export default router;

import crypto from "node:crypto";
import { prisma } from "../config/database";
import { hashPassword } from "../utils/hash";
import logger from "../utils/logger";
import AuditoriaService from "./auditoria.service";
import { LGPD_POLICY_VERSION } from "../constants/lgpd";

export interface AtualizarPerfilInput {
  nome?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  crm?: string;
}

class UsersService {
  async atualizarPerfil(userId: string, data: AtualizarPerfilInput) {
    const { nome, telefone, endereco, cidade, estado, cep, crm } = data;

    const usuarioAtual = await prisma.usuario.findUnique({ where: { id: userId }, select: { tipo: true } });
    if (!usuarioAtual) throw new Error("Usuário não encontrado");
    if (crm !== undefined && usuarioAtual.tipo !== "medico") {
      throw new Error("Somente médicos podem alterar o próprio CRM");
    }

    return prisma.$transaction(async (tx) => {
      let profissional: { id: string; crm: string } | null = null;
      if (crm !== undefined) {
        const existente = await tx.profissional.findUnique({ where: { usuarioId: userId }, select: { id: true } });
        if (!existente) throw new Error("Perfil profissional não encontrado");
        const duplicado = await tx.profissional.findFirst({
          where: { crm: { equals: crm, mode: "insensitive" }, NOT: { usuarioId: userId } },
          select: { id: true },
        });
        if (duplicado) throw new Error("CRM já cadastrado para outro profissional");
        profissional = await tx.profissional.update({
          where: { usuarioId: userId }, data: { crm }, select: { id: true, crm: true },
        });
      }
      const conta = await tx.usuario.update({
        where: { id: userId },
        data: {
          ...(nome?.trim() ? { nome: nome.trim() } : {}),
          ...(telefone?.trim() ? { telefone: telefone.trim() } : {}),
          ...(usuarioAtual.tipo === "clinica" ? {
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
      return { ...conta, ...(profissional ? { profissional } : {}) };
    });
  }

  async atualizarAvatar(userId: string, avatar: string) {
    return prisma.usuario.update({
      where: { id: userId },
      data: { avatar },
      select: { id: true, avatar: true },
    });
  }

  registrarNotificacoes(userId: string, preferencias: { email: boolean; push: boolean }) {
    // Preferências de notificação ainda não têm persistência própria —
    // só loga por enquanto (nada a mover além do shape da chamada).
    logger.info(`Salvando preferências de notificação para ${userId}: email=${preferencias.email}, push=${preferencias.push}`);
    return preferencias;
  }

  async registrarConsentimentoLgpd(userId: string, tipoAtor: string | undefined, ip?: string) {
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
      ator: { id: userId, tipo: tipoAtor },
      acao: "REGISTRAR_CONSENTIMENTO_LGPD",
      recurso: "Usuario",
      recursoId: userId,
      pacientes: [{ id: userId, nome: usuario.nome }],
      detalhes: { versao: LGPD_POLICY_VERSION },
      ip,
    });

    return usuario;
  }

  /** Exportação dos próprios dados (direito de acesso/portabilidade, arts. 18-22 da LGPD). */
  async exportarDados(userId: string, tipoAtor: string | undefined, ip?: string) {
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
    if (!usuario) return null;

    await AuditoriaService.registrarAcesso({
      ator: { id: userId, tipo: tipoAtor },
      acao: "EXPORTAR_MEUS_DADOS",
      recurso: "Usuario",
      recursoId: userId,
      pacientes: [{ id: userId, nome: usuario.nome }],
      ip,
    });

    const { _count, ...dadosPessoais } = usuario;
    return {
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
    };
  }

  /**
   * Direito de eliminação (arts. 18-22 da LGPD). Anonimiza em vez de excluir
   * fisicamente: agendamentos, pagamentos e avaliações ligados a este usuário
   * são registros legítimos de terceiros (médico/clínica têm obrigação de
   * manter histórico financeiro/assistencial) e têm onDelete: Cascade no
   * schema — uma exclusão física apagaria esse histórico junto. A conta fica
   * inativa e com os dados identificadores mascarados; não é mais possível
   * logar nela nem renovar uma sessão existente.
   */
  async excluirConta(userId: string, tipoAtor: string | undefined, ip?: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { nome: true, tipo: true, profissional: { select: { id: true } } },
    });
    if (!usuario) return null;

    const senhaAnonima = await hashPassword(crypto.randomUUID());

    await prisma.usuario.update({
      where: { id: userId },
      data: {
        nome: "Usuário Removido",
        email: `removido-${userId}@uaimed.invalid`,
        cpf: null,
        cnpj: null,
        telefone: "",
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
        refreshTokenHash: null,
        refreshTokenExpiresAt: null,
      },
    });

    if (usuario.profissional) {
      await prisma.profissional.update({
        where: { id: usuario.profissional.id },
        data: {
          endereco: "", cidade: "", estado: "", cep: "",
          latitude: null, longitude: null,
          pixKey: null, banco: null, agencia: null, conta: null, tipoConta: null,
          destaque: false,
        },
      });
    }

    logger.info(`Conta anonimizada a pedido do titular: ${userId}`);

    await AuditoriaService.registrarAcesso({
      ator: { id: userId, tipo: tipoAtor },
      acao: "EXCLUIR_CONTA",
      recurso: "Usuario",
      recursoId: userId,
      pacientes: [{ id: userId, nome: usuario.nome }],
      ip,
    });

    return true;
  }
}

export default new UsersService();

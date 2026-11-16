import crypto from "crypto";
import { prisma } from "../config/database";
import { hashPassword, comparePassword } from "../utils/hash";
import { generateToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { geocodeEndereco } from "./geocoding.service";
import { enviarEmailRecuperacaoSenha } from "./email.service";
import AuditoriaService from "./auditoria.service";
import logger from "../utils/logger";
import { TipoUsuario } from "@prisma/client";
import { especialidadeMedicaValida } from "../constants/especialidades";
import { ARTICLE_ADMIN_EMAIL } from '../constants/articleAdmin';
import { LGPD_POLICY_VERSION } from '../constants/lgpd';

const RESET_CODE_EXPIRATION_MINUTES = 15;
const RESET_CODE_MAX_ATTEMPTS = 5;

export interface SignUpData {
  nome: string;
  email: string;
  cpf?: string;
  cnpj?: string;
  telefone: string;
  senha: string;
  tipo?: TipoUsuario;
  consentimentoLgpd: boolean;
  // campos opcionais para profissionais
  especialidade?: string;
  crm?: string;
  dataFormacao?: string; // ISO string esperada
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

export interface SignInData {
  email: string;
  senha: string;
}

// Campos do profissional devolvidos no payload de login/cadastro.
// Não cobre as rotas públicas de listagem (/medicos, /clinicas) — a exclusão
// de dados bancários nessas rotas é feita nos controllers correspondentes.
const PROFISSIONAL_PUBLIC_SELECT = {
  id: true,
  especialidade: true,
  crm: true,
  endereco: true,
  cidade: true,
  estado: true,
  cep: true,
  latitude: true,
  longitude: true,
  precoConsulta: true,
} as const;

class AuthService {
  async signup(data: SignUpData) {
    if (data.email.trim().toLowerCase() === ARTICLE_ADMIN_EMAIL) {
      throw new Error('Este e-mail é reservado à administração');
    }
    const existing = await prisma.usuario.findUnique({ where: { email: data.email } });
    if (existing) throw new Error("Email já cadastrado");

    if (data.consentimentoLgpd !== true) {
      throw new Error('É necessário aceitar a Política de Privacidade (LGPD) para se cadastrar');
    }

    const senhaHash = await hashPassword(data.senha);
    const tipo = data.tipo || TipoUsuario.paciente;

    const tiposPermitidos: TipoUsuario[] = [
      TipoUsuario.paciente,
      TipoUsuario.medico,
      TipoUsuario.clinica,
    ];
    if (!tiposPermitidos.includes(tipo)) {
      throw new Error('Tipo de usuário inválido para cadastro');
    }

    const cpfNormalizado = data.cpf?.replace(/\D/g, '');
    const cnpjNormalizado = data.cnpj?.replace(/\D/g, '');

    if (tipo === TipoUsuario.clinica && !cnpjNormalizado) {
      throw new Error('CNPJ é obrigatório para cadastro de clínica');
    }

    if (tipo === TipoUsuario.clinica && cnpjNormalizado!.length !== 14) {
      throw new Error('CNPJ deve possuir 14 dígitos');
    }

    if (tipo !== TipoUsuario.clinica && !cpfNormalizado) {
      throw new Error('CPF é obrigatório para cadastro de paciente ou médico');
    }

    if (tipo !== TipoUsuario.clinica && cpfNormalizado!.length !== 11) {
      throw new Error('CPF deve possuir 11 dígitos');
    }

    // Se for médico, valida campos obrigatórios antes de criar qualquer registro
    if (tipo === TipoUsuario.medico) {
      if (!data.especialidade || !data.crm) {
        throw new Error('Especialidade e CRM são obrigatórios para cadastro de profissional');
      }
      if (!especialidadeMedicaValida(data.especialidade)) {
        throw new Error('Selecione uma especialidade válida');
      }
    }

    // Geocodifica o endereço fora da transação (chamada externa não deve
    // segurar uma transação de banco aberta)
    const coordenadas = tipo === TipoUsuario.medico
      ? await geocodeEndereco({
          endereco: data.endereco || '',
          cidade: data.cidade || '',
          estado: data.estado || '',
        })
      : null;

    // Usa transação para garantir atomicidade: usuário + profissional criados juntos
    const { usuario, profissional, token, refreshToken } = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          nome: data.nome,
          email: data.email,
          cpf: tipo === TipoUsuario.clinica ? null : cpfNormalizado,
          cnpj: tipo === TipoUsuario.clinica ? cnpjNormalizado : null,
          telefone: data.telefone,
          senha: senhaHash,
          tipo,
          consentimentoLgpd: true,
          consentimentoLgpdVersao: LGPD_POLICY_VERSION,
          consentimentoLgpdEm: new Date(),
          // Para clínicas, salva localização diretamente no usuário
          endereco: tipo === TipoUsuario.clinica ? (data.endereco?.trim() || null) : undefined,
          cidade: tipo === TipoUsuario.clinica ? (data.cidade || null) : undefined,
          estado: tipo === TipoUsuario.clinica ? (data.estado || null) : undefined,
          cep: tipo === TipoUsuario.clinica ? (data.cep?.trim() || null) : undefined,
        },
        select: {
          id: true, nome: true, email: true, cpf: true, cnpj: true,
          telefone: true, tipo: true, endereco: true, cidade: true,
          estado: true, cep: true, avatar: true,
        },
      });

      let profissional = null;
      if (tipo === TipoUsuario.medico) {
        profissional = await tx.profissional.create({
          data: {
            usuarioId: usuario.id,
            especialidade: data.especialidade!,
            crm: data.crm!,
            dataFormacao: data.dataFormacao ? new Date(data.dataFormacao) : new Date(),
            endereco: data.endereco || '',
            cidade: data.cidade || '',
            estado: data.estado || '',
            cep: data.cep || '',
            latitude: coordenadas?.latitude,
            longitude: coordenadas?.longitude,
          },
          select: PROFISSIONAL_PUBLIC_SELECT,
        });
      }

      const token = generateToken({ id: usuario.id, email: usuario.email, tipo: usuario.tipo });
      const refreshToken = generateRefreshToken({ id: usuario.id, email: usuario.email, tipo: usuario.tipo });
      return { usuario, profissional, token, refreshToken };
    });

    logger.success(`Novo usuário: ${usuario.email}`);

    return { usuario, profissional, token, refreshToken };
  }

  async signin(data: SignInData) {
    const usuario = await prisma.usuario.findUnique({ where: { email: data.email } });
    if (!usuario) throw new Error("Email ou senha incorretos");

    const ok = await comparePassword(data.senha, usuario.senha);
    if (!ok) throw new Error("Email ou senha incorretos");

    const token = generateToken({ id: usuario.id, email: usuario.email, tipo: usuario.tipo });
    const refreshToken = generateRefreshToken({ id: usuario.id, email: usuario.email, tipo: usuario.tipo });

    const profissional = usuario.tipo === TipoUsuario.medico
      ? await prisma.profissional.findUnique({
          where: { usuarioId: usuario.id },
          select: PROFISSIONAL_PUBLIC_SELECT,
        })
      : null;

    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cpf: usuario.cpf,
        cnpj: usuario.cnpj,
        telefone: usuario.telefone,
        tipo: usuario.tipo,
        avatar: usuario.avatar,
        endereco: usuario.endereco,
        cidade: usuario.cidade,
        estado: usuario.estado,
        cep: usuario.cep,
        profissional,
        // Usuários criados antes do fluxo de consentimento (ou que aceitaram
        // uma versão antiga da política) precisam reconsentir após o login —
        // o fluxo de cadastro só cobre contas novas.
        precisaConsentimentoLgpd: usuario.consentimentoLgpd !== true || usuario.consentimentoLgpdVersao !== LGPD_POLICY_VERSION,
      },
      token,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) throw new Error("Refresh token inválido ou expirado");

    const usuario = await prisma.usuario.findUnique({ where: { id: decoded.id } });
    if (!usuario) throw new Error("Usuário não encontrado");
    if (!usuario.ativo) throw new Error("Usuário inativo");

    const token = generateToken({ id: usuario.id, email: usuario.email, tipo: usuario.tipo });
    return { token };
  }

  async solicitarRecuperacaoSenha(email: string): Promise<void> {
    const usuario = await prisma.usuario.findUnique({ where: { email: email.trim().toLowerCase() } });
    // Não revela se o e-mail existe: a rota sempre responde sucesso, com ou
    // sem conta encontrada, pra não permitir enumeração de usuários.
    if (!usuario) return;

    const codigo = crypto.randomInt(100000, 1000000).toString();
    const resetCodeHash = await hashPassword(codigo);
    const resetCodeExpiresAt = new Date(Date.now() + RESET_CODE_EXPIRATION_MINUTES * 60 * 1000);

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { resetCodeHash, resetCodeExpiresAt, resetCodeAttempts: 0 },
    });

    await enviarEmailRecuperacaoSenha({ nome: usuario.nome, email: usuario.email, codigo });
  }

  async confirmarRecuperacaoSenha(data: { email: string; codigo: string; novaSenha: string; ip?: string }): Promise<void> {
    const ERRO_GENERICO = "Código inválido ou expirado";
    const usuario = await prisma.usuario.findUnique({ where: { email: data.email.trim().toLowerCase() } });
    if (!usuario || !usuario.resetCodeHash || !usuario.resetCodeExpiresAt) {
      throw new Error(ERRO_GENERICO);
    }
    if (usuario.resetCodeExpiresAt < new Date()) {
      throw new Error(ERRO_GENERICO);
    }
    if (usuario.resetCodeAttempts >= RESET_CODE_MAX_ATTEMPTS) {
      throw new Error("Número máximo de tentativas excedido. Solicite um novo código.");
    }

    const codigoValido = await comparePassword(data.codigo, usuario.resetCodeHash);
    if (!codigoValido) {
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { resetCodeAttempts: usuario.resetCodeAttempts + 1 },
      });
      throw new Error(ERRO_GENERICO);
    }

    const senhaHash = await hashPassword(data.novaSenha);
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { senha: senhaHash, resetCodeHash: null, resetCodeExpiresAt: null, resetCodeAttempts: 0 },
    });

    logger.info(`Senha redefinida via recuperação para usuário: ${usuario.email}`);

    await AuditoriaService.registrarAcesso({
      ator: { id: usuario.id, tipo: usuario.tipo },
      acao: "RECUPERAR_SENHA",
      recurso: "Usuario",
      recursoId: usuario.id,
      pacientes: [{ id: usuario.id, nome: usuario.nome }],
      ip: data.ip,
    });
  }
}

export default new AuthService();

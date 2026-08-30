import { prisma } from "../config/database";
import { hashPassword, comparePassword } from "../utils/hash";
import { generateToken } from "../utils/jwt";
import { geocodeEndereco } from "./geocoding.service";
import logger from "../utils/logger";
import { TipoUsuario } from "@prisma/client";

export interface SignUpData {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  senha: string;
  tipo?: TipoUsuario;
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

// Campos do profissional seguros para expor no payload de autenticação
// (exclui dados bancários: pixKey, banco, agencia, conta, tipoConta)
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
    const existing = await prisma.usuario.findUnique({ where: { email: data.email } });
    if (existing) throw new Error("Email já cadastrado");

    const senhaHash = await hashPassword(data.senha);
    const tipo = data.tipo || TipoUsuario.paciente;

    // Se for médico, valida campos obrigatórios antes de criar qualquer registro
    if (tipo === TipoUsuario.medico) {
      if (!data.especialidade || !data.crm) {
        throw new Error('Especialidade e CRM são obrigatórios para cadastro de profissional');
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
    const { usuario, profissional, token } = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          nome: data.nome,
          email: data.email,
          cpf: data.cpf,
          telefone: data.telefone,
          senha: senhaHash,
          tipo,
          // Para clínicas, salva localização diretamente no usuário
          cidade: tipo === TipoUsuario.clinica ? (data.cidade || null) : undefined,
          estado: tipo === TipoUsuario.clinica ? (data.estado || null) : undefined,
        },
        select: { id: true, nome: true, email: true, tipo: true },
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
      return { usuario, profissional, token };
    });

    logger.success(`Novo usuário: ${usuario.email}`);

    return { usuario, profissional, token };
  }

  async signin(data: SignInData) {
    const usuario = await prisma.usuario.findUnique({ where: { email: data.email } });
    if (!usuario) throw new Error("Email ou senha incorretos");

    const ok = await comparePassword(data.senha, usuario.senha);
    if (!ok) throw new Error("Email ou senha incorretos");

    const token = generateToken({ id: usuario.id, email: usuario.email, tipo: usuario.tipo });

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
        telefone: usuario.telefone,
        tipo: usuario.tipo,
        avatar: usuario.avatar,
        profissional,
      },
      token,
    };
  }
}

export default new AuthService();

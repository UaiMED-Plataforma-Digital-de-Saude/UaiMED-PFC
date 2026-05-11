import { prisma } from "../config/database";
import { hashPassword, comparePassword } from "../utils/hash";
import { generateToken } from "../utils/jwt";
import logger from "../utils/logger";

export interface SignUpData {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  senha: string;
  tipo?: "paciente" | "medico" | "clinica";
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

class AuthService {
  async signup(data: SignUpData) {
    const existing = await prisma.usuario.findUnique({ where: { email: data.email } });
    if (existing) throw new Error("Email já cadastrado");

    const senhaHash = await hashPassword(data.senha);
    const tipo = data.tipo || 'paciente';

    // Se for médico, valida campos obrigatórios antes de criar qualquer registro
    if (tipo === 'medico') {
      if (!data.especialidade || !data.crm) {
        throw new Error('Especialidade e CRM são obrigatórios para cadastro de profissional');
      }
    }

    // Usa transação para garantir atomicidade: usuário + profissional criados juntos
    const { usuario, token } = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          nome: data.nome,
          email: data.email,
          cpf: data.cpf,
          telefone: data.telefone,
          senha: senhaHash,
          tipo,
          // Para clínicas, salva localização diretamente no usuário
          cidade: tipo === 'clinica' ? (data.cidade || null) : undefined,
          estado: tipo === 'clinica' ? (data.estado || null) : undefined,
        },
        select: { id: true, nome: true, email: true, tipo: true },
      });

      if (tipo === 'medico') {
        await tx.profissional.create({
          data: {
            usuarioId: usuario.id,
            especialidade: data.especialidade!,
            crm: data.crm!,
            dataFormacao: data.dataFormacao ? new Date(data.dataFormacao) : new Date(),
            endereco: data.endereco || '',
            cidade: data.cidade || '',
            estado: data.estado || '',
            cep: data.cep || '',
          },
        });
      }

      const token = generateToken({ id: usuario.id, email: usuario.email, tipo: usuario.tipo });
      return { usuario, token };
    });

    logger.success(`Novo usuário: ${usuario.email}`);

    return { usuario, token };
  }

  async signin(data: SignInData) {
    const usuario = await prisma.usuario.findUnique({ where: { email: data.email } });
    if (!usuario) throw new Error("Email ou senha incorretos");

    const ok = await comparePassword(data.senha, usuario.senha);
    if (!ok) throw new Error("Email ou senha incorretos");

    const token = generateToken({ id: usuario.id, email: usuario.email, tipo: usuario.tipo });

    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cpf: usuario.cpf,
        telefone: usuario.telefone,
        tipo: usuario.tipo,
        avatar: usuario.avatar,
      },
      token,
    };
  }
}

export default new AuthService();

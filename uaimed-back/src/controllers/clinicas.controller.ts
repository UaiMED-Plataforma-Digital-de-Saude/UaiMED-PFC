import { Request, Response } from 'express';
import { StatusVinculoClinica, TipoUsuario } from '@prisma/client';
import { prisma } from '../config/database';
import logger from '../utils/logger';

const medicoInclude = {
  usuario: {
    select: { id: true, nome: true, email: true, telefone: true, avatar: true, ativo: true },
  },
  _count: { select: { agendamentos: true, avaliacoes: true } },
} as const;

function medicoPublico(profissional: any) {
  return {
    id: profissional.id,
    usuarioId: profissional.usuario.id,
    nome: profissional.usuario.nome,
    email: profissional.usuario.email,
    telefone: profissional.usuario.telefone,
    avatar: profissional.usuario.avatar,
    especialidade: profissional.especialidade,
    crm: profissional.crm,
    cidade: profissional.cidade,
    estado: profissional.estado,
    totalAgendamentos: profissional._count?.agendamentos ?? 0,
    totalAvaliacoes: profissional._count?.avaliacoes ?? 0,
  };
}

class ClinicasController {
  async recomendadas(req: Request, res: Response) {
    try {
      const { estado, cidade } = req.query;
      const where: any = { tipo: TipoUsuario.clinica, ativo: true };

      if (estado) where.estado = estado;
      if (cidade) where.cidade = cidade;

      const clinicas = await prisma.usuario.findMany({
        where,
        select: {
          id: true,
          nome: true,
          email: true,
          cidade: true,
          estado: true,
          avatar: true,
          pixKey: true,
          banco: true,
          agencia: true,
          conta: true,
          tipoConta: true,
          _count: {
            select: {
              medicosClinica: { where: { status: StatusVinculoClinica.aceito } },
            },
          },
        },
        take: 10,
        orderBy: { criado_em: 'desc' },
      });

      return res.json(clinicas.map((clinica) => ({
        id: clinica.id,
        nome: clinica.nome,
        avatar: clinica.avatar ?? null,
        localizacao: clinica.cidade && clinica.estado
          ? `${clinica.cidade}, ${clinica.estado}`
          : clinica.cidade || clinica.estado || null,
        pixKey: clinica.pixKey ?? null,
        banco: clinica.banco ?? null,
        agencia: clinica.agencia ?? null,
        conta: clinica.conta ?? null,
        tipoConta: clinica.tipoConta ?? null,
        totalMedicos: clinica._count.medicosClinica,
        nota: 5.0,
      })));
    } catch (error) {
      logger.error('Erro ao buscar clínicas recomendadas', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async listar(_req: Request, res: Response) {
    try {
      const clinicas = await prisma.usuario.findMany({
        where: { tipo: TipoUsuario.clinica, ativo: true },
        select: {
          id: true,
          nome: true,
          email: true,
          cidade: true,
          estado: true,
          avatar: true,
          pixKey: true,
          criado_em: true,
          _count: {
            select: {
              medicosClinica: { where: { status: StatusVinculoClinica.aceito } },
            },
          },
        },
        orderBy: { nome: 'asc' },
      });

      return res.json(clinicas.map(({ _count, ...clinica }) => ({
        ...clinica,
        totalMedicos: _count.medicosClinica,
      })));
    } catch (error) {
      logger.error('Erro ao listar clínicas', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async detalhe(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const clinica = await prisma.usuario.findFirst({
        where: { id, tipo: TipoUsuario.clinica, ativo: true },
        include: {
          medicosClinica: {
            where: { status: StatusVinculoClinica.aceito },
            include: { profissional: { include: medicoInclude } },
            orderBy: { criado_em: 'desc' },
          },
        },
      });
      if (!clinica) return res.status(404).json({ error: 'Clínica não encontrada' });

      return res.json({
        id: clinica.id,
        nome: clinica.nome,
        email: clinica.email,
        telefone: clinica.telefone,
        avatar: clinica.avatar ?? null,
        endereco: clinica.endereco,
        cidade: clinica.cidade,
        estado: clinica.estado,
        cep: clinica.cep,
        localizacao: clinica.cidade && clinica.estado
          ? `${clinica.cidade}, ${clinica.estado}`
          : clinica.cidade || clinica.estado || null,
        pixKey: clinica.pixKey ?? null,
        nota: 5.0,
        medicos: clinica.medicosClinica.map((vinculo) => medicoPublico(vinculo.profissional)),
      });
    } catch (error) {
      logger.error('Erro ao buscar detalhe da clínica', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async minhaClinica(req: Request, res: Response) {
    try {
      const clinicaId = req.user?.id;
      if (!clinicaId) return res.status(401).json({ error: 'Usuário não autenticado' });

      const clinica = await prisma.usuario.findFirst({
        where: { id: clinicaId, tipo: TipoUsuario.clinica, ativo: true },
        include: {
          medicosClinica: {
            where: { status: StatusVinculoClinica.aceito },
            include: { profissional: { include: medicoInclude } },
            orderBy: { criado_em: 'desc' },
          },
        },
      });
      if (!clinica) return res.status(404).json({ error: 'Clínica não encontrada' });

      const profissionalIds = clinica.medicosClinica.map((item) => item.profissionalId);
      const inicioHoje = new Date();
      inicioHoje.setHours(0, 0, 0, 0);
      const fimHoje = new Date(inicioHoje);
      fimHoje.setDate(fimHoje.getDate() + 1);

      const [agendamentosHoje, totalAgendamentos] = profissionalIds.length
        ? await Promise.all([
            prisma.agendamento.count({
              where: { profissionalId: { in: profissionalIds }, dataHora: { gte: inicioHoje, lt: fimHoje } },
            }),
            prisma.agendamento.count({ where: { profissionalId: { in: profissionalIds } } }),
          ])
        : [0, 0];

      return res.json({
        clinica: {
          id: clinica.id,
          nome: clinica.nome,
          email: clinica.email,
          telefone: clinica.telefone,
          cnpj: clinica.cnpj,
          avatar: clinica.avatar,
          endereco: clinica.endereco,
          cidade: clinica.cidade,
          estado: clinica.estado,
          cep: clinica.cep,
        },
        resumo: {
          totalMedicos: profissionalIds.length,
          agendamentosHoje,
          totalAgendamentos,
        },
        medicos: clinica.medicosClinica.map((vinculo) => medicoPublico(vinculo.profissional)),
      });
    } catch (error) {
      logger.error('Erro ao carregar área da clínica', error);
      return res.status(500).json({ error: 'Erro ao carregar área da clínica' });
    }
  }

  async medicosParaVinculo(req: Request, res: Response) {
    try {
      const clinicaId = req.user?.id;
      if (!clinicaId) return res.status(401).json({ error: 'Usuário não autenticado' });

      const query = typeof req.query.query === 'string' ? req.query.query.trim() : '';
      if (!query) return res.json([]);

      const documento = query.replace(/\D/g, '');
      const criterios: any[] = [
        { crm: { equals: query, mode: 'insensitive' } },
      ];
      if (documento.length === 11) {
        const cpfFormatado = documento.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        criterios.push({ usuario: { cpf: { in: [documento, cpfFormatado] } } });
      }

      const profissionais = await prisma.profissional.findMany({
        where: {
          usuario: { ativo: true, tipo: TipoUsuario.medico },
          OR: criterios,
        },
        include: {
          ...medicoInclude,
          clinicas: { where: { clinicaId }, select: { status: true } },
        },
        take: 1,
      });

      return res.json(profissionais.map((profissional) => ({
        ...medicoPublico(profissional),
        statusVinculo: profissional.clinicas[0]?.status ?? null,
        vinculado: profissional.clinicas[0]?.status === StatusVinculoClinica.aceito,
      })));
    } catch (error) {
      logger.error('Erro ao listar médicos para vínculo', error);
      return res.status(500).json({ error: 'Erro ao listar médicos' });
    }
  }

  async vincularMedico(req: Request, res: Response) {
    try {
      const clinicaId = req.user?.id;
      if (!clinicaId) return res.status(401).json({ error: 'Usuário não autenticado' });

      const { profissionalId } = req.body;
      if (typeof profissionalId !== 'string' || !profissionalId.trim()) {
        return res.status(400).json({ error: 'profissionalId é obrigatório' });
      }

      const profissional = await prisma.profissional.findFirst({
        where: { id: profissionalId, usuario: { ativo: true, tipo: TipoUsuario.medico } },
        include: medicoInclude,
      });
      if (!profissional) return res.status(404).json({ error: 'Médico não encontrado' });

      const existente = await prisma.clinicaProfissional.findUnique({
        where: { clinicaId_profissionalId: { clinicaId, profissionalId } },
      });

      if (existente?.status === StatusVinculoClinica.aceito) {
        return res.status(409).json({ error: 'Este médico já está vinculado à clínica' });
      }
      if (existente?.status === StatusVinculoClinica.pendente) {
        return res.status(409).json({ error: 'Já existe uma solicitação pendente para este médico' });
      }

      await prisma.clinicaProfissional.upsert({
        where: { clinicaId_profissionalId: { clinicaId, profissionalId } },
        create: { clinicaId, profissionalId, status: StatusVinculoClinica.pendente },
        update: { status: StatusVinculoClinica.pendente, respondido_em: null },
      });

      logger.success(`Solicitação de vínculo enviada ao médico ${profissionalId} pela clínica ${clinicaId}`);
      return res.status(201).json({
        ...medicoPublico(profissional),
        statusVinculo: StatusVinculoClinica.pendente,
        vinculado: false,
      });
    } catch (error) {
      logger.error('Erro ao vincular médico', error);
      return res.status(500).json({ error: 'Erro ao vincular médico' });
    }
  }

  async desvincularMedico(req: Request, res: Response) {
    try {
      const clinicaId = req.user?.id;
      if (!clinicaId) return res.status(401).json({ error: 'Usuário não autenticado' });

      const { profissionalId } = req.params;
      const removido = await prisma.clinicaProfissional.deleteMany({
        where: { clinicaId, profissionalId },
      });
      if (!removido.count) return res.status(404).json({ error: 'Vínculo não encontrado' });

      logger.success(`Médico ${profissionalId} desvinculado da clínica ${clinicaId}`);
      return res.status(204).send();
    } catch (error) {
      logger.error('Erro ao desvincular médico', error);
      return res.status(500).json({ error: 'Erro ao desvincular médico' });
    }
  }

  async solicitacoesDoMedico(req: Request, res: Response) {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) return res.status(401).json({ error: 'Usuário não autenticado' });

      const profissional = await prisma.profissional.findUnique({
        where: { usuarioId },
        select: { id: true },
      });
      if (!profissional) return res.status(404).json({ error: 'Perfil médico não encontrado' });

      const solicitacoes = await prisma.clinicaProfissional.findMany({
        where: {
          profissionalId: profissional.id,
          status: StatusVinculoClinica.pendente,
        },
        include: {
          clinica: {
            select: {
              id: true,
              nome: true,
              cnpj: true,
              avatar: true,
              endereco: true,
              cidade: true,
              estado: true,
            },
          },
        },
        orderBy: { criado_em: 'desc' },
      });

      return res.json(solicitacoes.map((solicitacao) => ({
        clinicaId: solicitacao.clinicaId,
        nome: solicitacao.clinica.nome,
        cnpj: solicitacao.clinica.cnpj,
        avatar: solicitacao.clinica.avatar,
        endereco: solicitacao.clinica.endereco,
        cidade: solicitacao.clinica.cidade,
        estado: solicitacao.clinica.estado,
        solicitadoEm: solicitacao.criado_em,
        status: solicitacao.status,
      })));
    } catch (error) {
      logger.error('Erro ao listar solicitações de vínculo do médico', error);
      return res.status(500).json({ error: 'Erro ao carregar solicitações de vínculo' });
    }
  }

  async responderSolicitacao(req: Request, res: Response) {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) return res.status(401).json({ error: 'Usuário não autenticado' });

      const { clinicaId } = req.params;
      const { acao } = req.body;
      if (acao !== 'aceitar' && acao !== 'recusar') {
        return res.status(400).json({ error: 'A ação deve ser aceitar ou recusar' });
      }

      const profissional = await prisma.profissional.findUnique({
        where: { usuarioId },
        select: { id: true },
      });
      if (!profissional) return res.status(404).json({ error: 'Perfil médico não encontrado' });

      const status = acao === 'aceitar'
        ? StatusVinculoClinica.aceito
        : StatusVinculoClinica.recusado;
      const atualizada = await prisma.clinicaProfissional.updateMany({
        where: {
          clinicaId,
          profissionalId: profissional.id,
          status: StatusVinculoClinica.pendente,
        },
        data: { status, respondido_em: new Date() },
      });
      if (!atualizada.count) {
        return res.status(404).json({ error: 'Solicitação pendente não encontrada' });
      }

      logger.success(`Solicitação da clínica ${clinicaId} ${status} pelo médico ${profissional.id}`);
      return res.json({ clinicaId, status });
    } catch (error) {
      logger.error('Erro ao responder solicitação de vínculo', error);
      return res.status(500).json({ error: 'Erro ao responder solicitação de vínculo' });
    }
  }
}

export default new ClinicasController();

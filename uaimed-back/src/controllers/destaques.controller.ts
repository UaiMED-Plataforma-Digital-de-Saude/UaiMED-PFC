import { Request, Response } from 'express';
import { Prisma, TipoUsuario } from '@prisma/client';
import { prisma } from '../config/database';
import { ARTICLE_ADMIN_EMAIL } from '../constants/articleAdmin';
import { DestaquesInput } from '../schemas/destaques.schema';
import logger from '../utils/logger';

const usuarioElegivel = (tipo: TipoUsuario): Prisma.UsuarioWhereInput => ({
  tipo, ativo: true, email: { not: ARTICLE_ADMIN_EMAIL },
});

class SelecaoInvalida extends Error {}

class DestaquesController {
  async listar(_req: Request, res: Response) {
    try {
      const [profissionais, clinicas] = await prisma.$transaction([
        prisma.profissional.findMany({
          where: { usuario: usuarioElegivel(TipoUsuario.medico) },
          orderBy: { usuario: { nome: 'asc' } },
          select: {
            id: true, especialidade: true, crm: true, cidade: true, estado: true, destaque: true,
            usuario: { select: { nome: true, email: true } },
          },
        }),
        prisma.usuario.findMany({
          where: usuarioElegivel(TipoUsuario.clinica),
          orderBy: { nome: 'asc' },
          select: { id: true, nome: true, email: true, cnpj: true, cidade: true, estado: true, destaque: true },
        }),
      ]);
      return res.json({
        profissionais: profissionais.map(({ usuario, ...profissional }) => ({ ...profissional, ...usuario })),
        clinicas,
      });
    } catch (err) {
      logger.error('Erro ao listar opções de destaque', err);
      return res.status(500).json({ error: 'Erro ao carregar os destaques' });
    }
  }

  async salvar(req: Request, res: Response) {
    const { profissionalIds, clinicaIds } = req.body as DestaquesInput;
    try {
      await prisma.$transaction(async tx => {
        const profissionais = await tx.profissional.count({
          where: { id: { in: profissionalIds }, usuario: usuarioElegivel(TipoUsuario.medico) },
        });
        const clinicas = await tx.usuario.count({
          where: { ...usuarioElegivel(TipoUsuario.clinica), id: { in: clinicaIds } },
        });
        if (profissionais !== profissionalIds.length || clinicas !== clinicaIds.length) {
          throw new SelecaoInvalida('Selecione apenas profissionais e clínicas ativos. Atualize a lista e tente novamente.');
        }

        await tx.profissional.updateMany({ where: { destaque: true, id: { notIn: profissionalIds } }, data: { destaque: false } });
        await tx.usuario.updateMany({ where: { destaque: true, id: { notIn: clinicaIds } }, data: { destaque: false } });
        await tx.profissional.updateMany({ where: { destaque: false, id: { in: profissionalIds } }, data: { destaque: true } });
        await tx.usuario.updateMany({ where: { destaque: false, id: { in: clinicaIds } }, data: { destaque: true } });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      return res.json({ message: 'Destaques atualizados', profissionalIds, clinicaIds });
    } catch (err) {
      if (err instanceof SelecaoInvalida) return res.status(400).json({ error: err.message });
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2034') {
        return res.status(409).json({ error: 'Os destaques foram alterados por outra sessão. Atualize a lista e tente novamente.' });
      }
      logger.error('Erro ao salvar destaques', err);
      return res.status(500).json({ error: 'Erro ao salvar os destaques' });
    }
  }
}

export default new DestaquesController();

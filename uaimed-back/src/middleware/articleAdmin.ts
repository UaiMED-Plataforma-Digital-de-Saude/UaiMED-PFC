import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { ARTICLE_ADMIN_EMAIL } from '../constants/articleAdmin';
import logger from '../utils/logger';

export async function requireArticleAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.id) return res.status(401).json({ error: 'Usuário não autenticado' });

  try {
    // Confere a conta atual no banco, sem confiar no e-mail ou papel do token.
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: { email: true, ativo: true },
    });

    if (!usuario?.ativo || usuario.email !== ARTICLE_ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Acesso restrito à administração UaiMED' });
    }

    return next();
  } catch (err) {
    logger.error('Erro ao verificar acesso administrativo', err);
    return res.status(500).json({ error: 'Erro ao verificar permissão' });
  }
}

// A mesma conta administra artigos e os destaques da home.
export const requireAdmin = requireArticleAdmin;

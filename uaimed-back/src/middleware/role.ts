import { Request, Response, NextFunction } from "express";
import { TipoUsuario } from "@prisma/client";

export function requireRole(...allowed: TipoUsuario[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ error: 'Usuário não autenticado' });
      if (!allowed.includes(user.tipo)) return res.status(403).json({ error: 'Acesso negado' });
      return next();
    } catch (err) {
      console.error('Role middleware error', err);
      return res.status(500).json({ error: 'Erro interno' });
    }
  };
}

export default requireRole;

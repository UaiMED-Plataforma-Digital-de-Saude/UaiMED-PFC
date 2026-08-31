import { Request } from "express";
import { TipoUsuario } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        tipo: TipoUsuario;
        iat?: number;
        exp?: number;
      };
    }
  }
}

export {};

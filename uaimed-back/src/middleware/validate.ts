import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";

export const validateBody = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      return next();
    } catch (err: any) {
      const issues = err?.issues || err?.message || "Invalid payload";
      return res.status(400).json({ error: "Validation failed", details: issues });
    }
  };
};

export default validateBody;

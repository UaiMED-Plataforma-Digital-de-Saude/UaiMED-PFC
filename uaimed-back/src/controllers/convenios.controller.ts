import { Request, Response } from 'express';
import { CONVENIOS_ACEITOS } from '../constants/convenios';

class ConveniosController {
  async listar(req: Request, res: Response) {
    const convenios = CONVENIOS_ACEITOS.map((nome, index) => ({
      id: String(index + 1),
      nome,
    }));
    return res.json(convenios);
  }
}

export default new ConveniosController();

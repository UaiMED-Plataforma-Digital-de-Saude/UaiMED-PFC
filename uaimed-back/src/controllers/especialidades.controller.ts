import { Request, Response } from 'express';
import { ESPECIALIDADES_MEDICAS } from '../constants/especialidades';

class EspecialidadesController {
  async listar(req: Request, res: Response) {
    const especialidades = ESPECIALIDADES_MEDICAS.map((nome, index) => ({
      id: String(index + 1),
      nome,
    }));
    return res.json(especialidades);
  }
}

export default new EspecialidadesController();


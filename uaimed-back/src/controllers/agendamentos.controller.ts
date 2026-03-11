
import { Request, Response } from "express";
import { prisma } from "../config/database";

class AgendamentosController {
  async listar(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      // se não autenticado, retorna lista pública simulada
      if (!userId) {
        const simulated = [
          { id: '1', medico: 'Dr. Lucas Ribeiro', especialidade: 'Cardiologia', data: new Date().toISOString(), status: 'confirmado' }
        ];
        return res.json(simulated);
      }

      const agendamentos = await prisma.agendamento.findMany({
        where: { usuarioId: userId },
        include: { profissional: { include: { usuario: true } } },
        orderBy: { dataHora: 'desc' },
      });

      // Log detalhado para diagnóstico
      console.log('Agendamentos encontrados:', JSON.stringify(agendamentos, null, 2));

      const mapped = agendamentos.map(a => ({
        id: a.id,
        medico: a.profissional?.usuario?.nome || null,
        especialidade: a.profissional?.especialidade || null,
        data: a.dataHora,
        status: a.status,
      }));

      console.log('Agendamentos mapeados:', JSON.stringify(mapped, null, 2));

      return res.json(mapped);
    } catch (err) {
      console.error('Erro ao listar agendamentos', err);
      return res.status(500).json({ 
        error: 'Erro ao listar agendamentos', 
        details: err instanceof Error ? err.message : err,
        stack: err instanceof Error && err.stack ? err.stack : undefined
      });
    }
  }

  async sugerirHorarios(req: Request, res: Response) {
    try {
      const { medicoId } = req.query;
      if (!medicoId) return res.status(400).json({ error: 'medicoId é obrigatório' });

      // Horários sugeridos: próximos 7 dias, 8h-17h, 30min cada, sem conflito
      const horarios: string[] = [];
      const now = new Date();
      for (let dia = 0; dia < 7; dia++) {
        const data = new Date(now);
        data.setDate(now.getDate() + dia);
        for (let hora = 8; hora < 17; hora++) {
          for (let min = 0; min < 60; min += 30) {
            const slot = new Date(data);
            slot.setHours(hora, min, 0, 0);
            // Verifica conflito
            const conflito = await prisma.agendamento.findFirst({
              where: {
                profissionalId: String(medicoId),
                dataHora: slot,
                status: { in: ['agendado', 'confirmado'] },
              },
            });
            if (!conflito && slot > now) {
              horarios.push(slot.toISOString());
            }
            if (horarios.length >= 10) break;
          }
          if (horarios.length >= 10) break;
        }
        if (horarios.length >= 10) break;
      }
      return res.json(horarios);
    } catch (err) {
      console.error('Erro ao sugerir horários', err);
      return res.status(500).json({ error: 'Erro ao sugerir horários' });
    }
  }
}

export default AgendamentosController;


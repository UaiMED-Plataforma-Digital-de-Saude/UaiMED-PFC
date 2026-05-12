import { Request, Response } from 'express';
import { prisma } from '../config/database';
import logger from '../utils/logger';

class ContaBancariaController {
  /** GET /api/conta-bancaria — retorna dados bancários do usuário autenticado */
  async obter(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).user?.id;
      if (!usuarioId) return res.status(401).json({ error: 'Não autenticado' });

      const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: { tipo: true, pixKey: true, banco: true, agencia: true, conta: true, tipoConta: true, profissional: { select: { id: true, pixKey: true, banco: true, agencia: true, conta: true, tipoConta: true } } },
      });

      if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });

      // Médico: dados vêm do Profissional
      if (usuario.tipo === 'medico' && usuario.profissional) {
        return res.json({
          pixKey: usuario.profissional.pixKey,
          banco: usuario.profissional.banco,
          agencia: usuario.profissional.agencia,
          conta: usuario.profissional.conta,
          tipoConta: usuario.profissional.tipoConta,
        });
      }

      // Clínica: dados vêm do Usuario
      return res.json({
        pixKey: usuario.pixKey,
        banco: usuario.banco,
        agencia: usuario.agencia,
        conta: usuario.conta,
        tipoConta: usuario.tipoConta,
      });
    } catch (err) {
      logger.error('Erro ao obter conta bancária', err);
      return res.status(500).json({ error: 'Erro interno' });
    }
  }

  /** PUT /api/conta-bancaria — atualiza dados bancários do usuário autenticado */
  async atualizar(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).user?.id;
      if (!usuarioId) return res.status(401).json({ error: 'Não autenticado' });

      const { pixKey, banco, agencia, conta, tipoConta } = req.body;

      const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: { tipo: true, profissional: { select: { id: true } } },
      });

      if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });

      // Valida tipo de conta
      if (tipoConta && !['corrente', 'poupanca'].includes(tipoConta)) {
        return res.status(400).json({ error: 'Tipo de conta inválido. Use "corrente" ou "poupanca".' });
      }

      // Médico: atualiza Profissional
      if (usuario.tipo === 'medico' && usuario.profissional) {
        await prisma.profissional.update({
          where: { id: usuario.profissional.id },
          data: { pixKey, banco, agencia, conta, tipoConta },
        });
      } else if (usuario.tipo === 'clinica') {
        // Clínica: atualiza Usuario
        await prisma.usuario.update({
          where: { id: usuarioId },
          data: { pixKey, banco, agencia, conta, tipoConta },
        });
      } else {
        return res.status(403).json({ error: 'Apenas médicos e clínicas podem cadastrar dados bancários.' });
      }

      logger.success(`Conta bancária atualizada: usuário ${usuarioId}`);
      return res.json({ message: 'Dados bancários atualizados com sucesso.' });
    } catch (err) {
      logger.error('Erro ao atualizar conta bancária', err);
      return res.status(500).json({ error: 'Erro interno' });
    }
  }
}

export default new ContaBancariaController();


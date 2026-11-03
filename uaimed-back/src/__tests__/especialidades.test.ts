import request from 'supertest';
import app from '../app';
import { describe, it, expect } from 'vitest';
import { ESPECIALIDADES_MEDICAS } from '../constants/especialidades';

describe('Especialidades — listagem pública', () => {
  it('retorna todas as especialidades médicas com id e nome', async () => {
    const res = await request(app).get('/api/especialidades');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(ESPECIALIDADES_MEDICAS.length);
    expect(res.body[0]).toEqual({ id: '1', nome: ESPECIALIDADES_MEDICAS[0] });
    expect(res.body.map((e: { nome: string }) => e.nome)).toEqual([...ESPECIALIDADES_MEDICAS]);
  });

  it('não exige autenticação', async () => {
    const res = await request(app).get('/api/especialidades');
    expect(res.status).not.toBe(401);
  });
});

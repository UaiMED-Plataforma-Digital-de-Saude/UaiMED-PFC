import request from 'supertest';
import app from '../app';
import { describe, it, expect } from 'vitest';
import { CONVENIOS_ACEITOS } from '../constants/convenios';

describe('Convênios — listagem pública', () => {
  it('retorna todos os convênios aceitos com id e nome', async () => {
    const res = await request(app).get('/api/convenios');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(CONVENIOS_ACEITOS.length);
    expect(res.body[0]).toEqual({ id: '1', nome: CONVENIOS_ACEITOS[0] });
    expect(res.body.map((c: { nome: string }) => c.nome)).toEqual([...CONVENIOS_ACEITOS]);
  });

  it('não exige autenticação', async () => {
    const res = await request(app).get('/api/convenios');
    expect(res.status).not.toBe(401);
  });
});

import { describe, it, expect, vi, afterEach } from 'vitest';
import { geocodeEndereco } from '../../services/geocoding.service';

function mockFetchOnce(impl: (url: string, init: RequestInit) => Promise<Response> | Response) {
  vi.stubGlobal('fetch', vi.fn(impl));
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe('geocoding.service — geocodeEndereco', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const input = { endereco: 'Av. Afonso Pena, 1000', cidade: 'Belo Horizonte', estado: 'MG' };

  it('retorna latitude/longitude quando o Nominatim responde com sucesso', async () => {
    mockFetchOnce(() => jsonResponse([{ lat: '-19.9227318', lon: '-43.9450946' }]));

    const resultado = await geocodeEndereco(input);

    expect(resultado).toEqual({ latitude: -19.9227318, longitude: -43.9450946 });
  });

  it('monta a query com endereço, cidade, estado e "Brasil", com User-Agent identificável', async () => {
    const fetchMock = vi.fn(() => jsonResponse([{ lat: '1', lon: '2' }]));
    vi.stubGlobal('fetch', fetchMock);

    await geocodeEndereco(input);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    const params = new URL(url).searchParams;
    expect(params.get('q')).toBe('Av. Afonso Pena, 1000, Belo Horizonte, MG, Brasil');
    expect(params.get('countrycodes')).toBe('br');
    expect(init.headers).toMatchObject({ 'User-Agent': 'UaiMED-App/1.0' });
  });

  it('retorna null quando a resposta não é ok (ex: 503)', async () => {
    mockFetchOnce(() => jsonResponse({}, 503));

    const resultado = await geocodeEndereco(input);

    expect(resultado).toBeNull();
  });

  it('retorna null quando não há resultados para o endereço', async () => {
    mockFetchOnce(() => jsonResponse([]));

    const resultado = await geocodeEndereco(input);

    expect(resultado).toBeNull();
  });

  it('retorna null quando as coordenadas retornadas não são numéricas', async () => {
    mockFetchOnce(() => jsonResponse([{ lat: 'abc', lon: 'def' }]));

    const resultado = await geocodeEndereco(input);

    expect(resultado).toBeNull();
  });

  it('retorna null quando o fetch lança uma exceção (rede/timeout)', async () => {
    mockFetchOnce(() => {
      throw new Error('network error');
    });

    const resultado = await geocodeEndereco(input);

    expect(resultado).toBeNull();
  });
});

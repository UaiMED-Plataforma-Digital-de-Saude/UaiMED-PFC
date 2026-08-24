import logger from "../utils/logger";

interface EnderecoInput {
  endereco: string;
  cidade: string;
  estado: string;
}

interface Coordenadas {
  latitude: number;
  longitude: number;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const GEOCODING_TIMEOUT_MS = 6000;

/**
 * Resolve latitude/longitude a partir de um endereço textual usando o
 * Nominatim (OpenStreetMap), que é gratuito e não exige chave de API.
 * Retorna null em caso de falha (rede, timeout ou resposta malformada)
 * para não bloquear o fluxo que a chamou.
 */
export async function geocodeEndereco(input: EnderecoInput): Promise<Coordenadas | null> {
  const query = [input.endereco, input.cidade, input.estado, "Brasil"]
    .filter(Boolean)
    .join(", ");

  if (!query.trim()) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEOCODING_TIMEOUT_MS);

  try {
    const params = new URLSearchParams({
      q: query,
      format: "json",
      limit: "1",
      countrycodes: "br",
    });

    // Nominatim exige um User-Agent identificável (política de uso da API pública)
    const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      headers: { "User-Agent": "UaiMED-App/1.0" },
      signal: controller.signal,
    });

    if (!response.ok) {
      logger.warn(`Geocoding falhou (status ${response.status}) para: ${query}`);
      return null;
    }

    const results = (await response.json()) as Array<{ lat: string; lon: string }>;
    if (!results.length) {
      logger.warn(`Nenhuma coordenada encontrada para: ${query}`);
      return null;
    }

    const latitude = parseFloat(results[0].lat);
    const longitude = parseFloat(results[0].lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      logger.warn(`Coordenadas inválidas retornadas pelo geocoding para: ${query}`);
      return null;
    }

    return { latitude, longitude };
  } catch (err) {
    logger.error("Erro ao geocodificar endereço", err);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

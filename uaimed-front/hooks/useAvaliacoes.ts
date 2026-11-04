import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import uaiMedApi from '../api/uaiMedApi';

/**
 * Hook para carregar a média de avaliação de um profissional (GET /avaliacoes/medico/:id/media),
 * recarregando ao focar a tela e ignorando respostas de uma conta/tela anterior.
 */
export const useAvaliacoes = (medicoId?: string) => {
  const [notaMedia, setNotaMedia] = useState<number | null>(null);
  const [totalAvaliacoes, setTotalAvaliacoes] = useState<number | null>(null);
  const [loading, setLoading] = useState(Boolean(medicoId));
  const [error, setError] = useState<string | null>(null);
  const requisicaoAtual = useRef(0);

  const carregarMediaAvaliacoes = useCallback(async (id: string) => {
    const requisicao = ++requisicaoAtual.current;
    setLoading(true);
    setError(null);
    try {
      const res = await uaiMedApi.get(`/avaliacoes/medico/${id}/media`);
      const nota: number = Number(res.data?.notaMedia ?? 0);
      const total = Number(res.data?.totalAvaliacoes);
      if (!Number.isInteger(total) || total < 0 || !Number.isFinite(nota) || nota < 0 || nota > 5 || (total > 0 && nota === 0)) {
        throw new Error('Resumo de avaliações inválido');
      }
      if (requisicao !== requisicaoAtual.current) return null;
      setTotalAvaliacoes(total);
      setNotaMedia(total > 0 ? nota : null);
      return total > 0 ? nota : null;
    } catch (err: any) {
      if (requisicao !== requisicaoAtual.current) return null;
      const message = err.response?.data?.error || err.response?.data?.message || 'Erro ao carregar avaliações.';
      setError(message);
      setNotaMedia(null);
      setTotalAvaliacoes(null);
      return null;
    } finally {
      if (requisicao === requisicaoAtual.current) setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    setNotaMedia(null);
    setTotalAvaliacoes(null);
    setError(null);
    if (medicoId) {
      carregarMediaAvaliacoes(medicoId);
    } else {
      setLoading(false);
    }
    return () => { requisicaoAtual.current += 1; };
  }, [medicoId, carregarMediaAvaliacoes]));

  return {
    notaMedia,
    totalAvaliacoes,
    loading,
    error,
    carregarMediaAvaliacoes,
  };
};

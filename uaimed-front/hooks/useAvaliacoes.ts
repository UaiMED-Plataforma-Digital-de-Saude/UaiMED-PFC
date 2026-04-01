import { useState, useCallback, useEffect } from 'react';
import { Avaliacao, EstatisticasAvaliacao } from '../types/avaliacao';
import uaiMedApi from '../api/uaiMedApi';

/**
 * Hook customizado para gerenciar avaliações
 * Fornece funções para carregar, criar e atualizar avaliações
 */
export const useAvaliacoes = (medicoId?: string) => {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [notaMedia, setNotaMedia] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carrega a média de avaliação de um profissional específico da API real
   */
  const carregarMediaAvaliacoes = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await uaiMedApi.get(`/avaliacoes/medico/${id}/media`);
      const nota: number = res.data?.notaMedia ?? 0;
      setNotaMedia(nota);
      return nota;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao carregar avaliações.';
      setError(message);
      console.error('Erro em useAvaliacoes.carregarMediaAvaliacoes:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carrega todas as avaliações do usuário
   */
  const loadAvaliacoes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Integrar com API real
      // const response = await uaiMedApi.get('/avaliacoes');
      // setAvaliacoes(response.data);
      
      // Dados simulados
      setAvaliacoes([]);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar avaliações');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Efeito para carregar média quando o componente é montado (se medicoId for fornecido)
   */
  useEffect(() => {
    if (medicoId) {
      carregarMediaAvaliacoes(medicoId);
    }
  }, [medicoId, carregarMediaAvaliacoes]);

  /**
   * Cria uma nova avaliação via API
   */
  const criarAvaliacao = useCallback(
    async (agendamentoId: string, dados: any) => {
      setLoading(true);
      setError(null);
      try {
        const response = await uaiMedApi.post('/avaliacoes', {
          agendamentoId,
          ...dados,
        });
        setAvaliacoes((prev) => [...prev, response.data]);
        return response.data;
      } catch (err: any) {
        setError(err.message || 'Erro ao criar avaliação');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Calcula estatísticas das avaliações
   */
  const calcularEstatisticas = useCallback((): EstatisticasAvaliacao => {
    const total = avaliacoes.length;

    if (total === 0) {
      return {
        totalAvaliacoes: 0,
        mediaAtendimento: 0,
        mediaPuntualidade: 0,
        mediaClinica: 0,
        mediaComuni: 0,
        percentualVoltaria: 0,
        percentualRecomenda: 0,
        avaliacoes: [],
      };
    }

    const mediaAtendimento =
      avaliacoes.reduce((sum, a) => sum + a.notaAtendimento, 0) / total;
    const mediaPuntualidade =
      avaliacoes.reduce((sum, a) => sum + a.notaPuntualidade, 0) / total;
    const mediaClinica =
      avaliacoes.reduce((sum, a) => sum + a.notaClinica, 0) / total;
    const mediaComuni =
      avaliacoes.reduce((sum, a) => sum + a.notaComuni, 0) / total;

    const voltariaCount = avaliacoes.filter(
      (a) => a.voltariaClinica === 'sim',
    ).length;
    const recomendaCount = avaliacoes.filter(
      (a) => a.recomendaMedico === 'sim',
    ).length;

    return {
      totalAvaliacoes: total,
      mediaAtendimento: parseFloat(mediaAtendimento.toFixed(1)),
      mediaPuntualidade: parseFloat(mediaPuntualidade.toFixed(1)),
      mediaClinica: parseFloat(mediaClinica.toFixed(1)),
      mediaComuni: parseFloat(mediaComuni.toFixed(1)),
      percentualVoltaria: Math.round((voltariaCount / total) * 100),
      percentualRecomenda: Math.round((recomendaCount / total) * 100),
      avaliacoes,
    };
  }, [avaliacoes]);

  /**
   * Obtém avaliações de um médico específico
   */
  const avaliacoesMedico = useCallback(
    (medicoId: string) => {
      return avaliacoes.filter((a) => a.medicoId === medicoId);
    },
    [avaliacoes],
  );

  return {
    avaliacoes,
    notaMedia,
    loading,
    error,
    loadAvaliacoes,
    criarAvaliacao,
    calcularEstatisticas,
    avaliacoesMedico,
    carregarMediaAvaliacoes,
  };
};

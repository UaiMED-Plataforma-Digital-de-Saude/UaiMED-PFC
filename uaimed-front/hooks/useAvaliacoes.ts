import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Avaliacao, EstatisticasAvaliacao } from '../types/avaliacao';
import uaiMedApi from '../api/uaiMedApi';

/**
 * Hook customizado para gerenciar avaliações
 * Fornece funções para carregar, criar e atualizar avaliações
 */
export const useAvaliacoes = (medicoId?: string) => {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [notaMedia, setNotaMedia] = useState<number | null>(null);
  const [totalAvaliacoes, setTotalAvaliacoes] = useState<number | null>(null);
  const [loading, setLoading] = useState(Boolean(medicoId));
  const [error, setError] = useState<string | null>(null);
  const requisicaoAtual = useRef(0);

  /**
   * Carrega a média de avaliação de um profissional específico da API real
   */
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
   * Recarrega ao voltar ao perfil e ignora respostas de uma tela/conta anterior.
   */
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
    totalAvaliacoes,
    loading,
    error,
    loadAvaliacoes,
    criarAvaliacao,
    calcularEstatisticas,
    avaliacoesMedico,
    carregarMediaAvaliacoes,
  };
};

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { AgendamentoStackParamList } from '../../navigation/types';
import uaiMedApi from '../../api/uaiMedApi';

/**
 * Tela de Histórico de Avaliações
 * Mostra todas as avaliações realizadas pelo paciente
 */
type Props = StackScreenProps<AgendamentoStackParamList, 'HistoricoAvaliacoes'>;

type Resposta = 'sim' | 'nao' | 'talvez';

interface AvaliacaoApi {
  id: string;
  nota: number;
  comentario: string | null;
  notaAtendimento: number | null;
  notaPontualidade: number | null;
  notaClinica: number | null;
  notaComunicacao: number | null;
  voltariaClinica: Resposta | null;
  recomendaMedico: Resposta | null;
  melhorias: string | null;
  criado_em: string;
  profissional: {
    id: string;
    especialidade: string | null;
    usuario: { nome: string | null; avatar: string | null } | null;
  };
}

const RESPOSTA_LABEL: Record<Resposta, string> = { sim: '✓ Sim', nao: '✗ Não', talvez: '? Talvez' };
const RESPOSTA_COLOR: Record<Resposta, string> = { sim: '#4CAF50', nao: '#D9534F', talvez: '#FF9800' };

export const HistoricoAvaliacoesScreen: React.FC<Props> = ({ navigation }) => {
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await uaiMedApi.get('/avaliacoes/minhas');
      setAvaliacoes(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.warn('Erro ao carregar avaliações:', error);
      setAvaliacoes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  const onRefresh = () => carregar(true);

  const renderCard = ({ item }: { item: AvaliacaoApi }) => {
    const dataFormatada = new Date(item.criado_em).toLocaleDateString('pt-BR');
    const temDetalhamento = item.notaAtendimento != null && item.notaPontualidade != null
      && item.notaClinica != null && item.notaComunicacao != null;

    return (
      <View style={styles.card}>
        {/* Header do Card */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderText}>
            <Text style={styles.medicoNome} numberOfLines={1}>
              {item.profissional?.usuario?.nome ?? 'Profissional'}
            </Text>
            {item.profissional?.especialidade ? (
              <Text style={styles.especialidade}>{item.profissional.especialidade}</Text>
            ) : null}
          </View>
          <View style={styles.headerRight}>
            <View style={styles.cardDate}>
              <Ionicons name="calendar-outline" size={14} color="#888" />
              <Text style={styles.cardDateText}>{dataFormatada}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#FFB800" />
              <Text style={styles.ratingBadgeText}>{item.nota}</Text>
            </View>
          </View>
        </View>

        {/* Notas detalhadas — só quando o detalhamento completo existe */}
        {temDetalhamento && (
          <View style={styles.notasGrid}>
            <View style={styles.notaItem}>
              <Ionicons name="person" size={16} color="#4CAF50" />
              <Text style={styles.notaLabel}>Atendimento</Text>
              <Text style={styles.notaValue}>{item.notaAtendimento}★</Text>
            </View>
            <View style={styles.notaItem}>
              <Ionicons name="time" size={16} color="#4CAF50" />
              <Text style={styles.notaLabel}>Pontualidade</Text>
              <Text style={styles.notaValue}>{item.notaPontualidade}★</Text>
            </View>
            <View style={styles.notaItem}>
              <Ionicons name="medkit-outline" size={16} color="#4CAF50" />
              <Text style={styles.notaLabel}>Clínica</Text>
              <Text style={styles.notaValue}>{item.notaClinica}★</Text>
            </View>
            <View style={styles.notaItem}>
              <Ionicons name="chatbubbles" size={16} color="#4CAF50" />
              <Text style={styles.notaLabel}>Comunicação</Text>
              <Text style={styles.notaValue}>{item.notaComunicacao}★</Text>
            </View>
          </View>
        )}

        {/* Respostas — só quando existem */}
        {(item.voltariaClinica || item.recomendaMedico) && (
          <View style={styles.respostasContainer}>
            {item.voltariaClinica && (
              <View style={styles.respostaItem}>
                <Text style={styles.respostaLabel}>Voltaria?</Text>
                <Text style={[styles.respostaValue, { color: RESPOSTA_COLOR[item.voltariaClinica] }]}>
                  {RESPOSTA_LABEL[item.voltariaClinica]}
                </Text>
              </View>
            )}
            {item.voltariaClinica && item.recomendaMedico && <View style={styles.divider} />}
            {item.recomendaMedico && (
              <View style={styles.respostaItem}>
                <Text style={styles.respostaLabel}>Recomenda?</Text>
                <Text style={[styles.respostaValue, { color: RESPOSTA_COLOR[item.recomendaMedico] }]}>
                  {RESPOSTA_LABEL[item.recomendaMedico]}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Comentário */}
        {item.comentario && (
          <View style={styles.comentarioContainer}>
            <Text style={styles.comentarioLabel}>Sua Avaliação:</Text>
            <Text style={styles.comentarioText} numberOfLines={3}>"{item.comentario}"</Text>
          </View>
        )}

        {/* Melhorias */}
        {item.melhorias && (
          <View style={styles.melhoriasContainer}>
            <Text style={styles.melhoriasLabel}>
              <Ionicons name="bulb-outline" size={14} color="#FFB800" /> Sugestões:
            </Text>
            <Text style={styles.melhoriasText}>{item.melhorias}</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Carregando avaliações...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {avaliacoes.length > 0 ? (
        <FlatList
          data={avaliacoes}
          renderItem={renderCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={48} color="#DDD" />
          <Text style={styles.emptyTitle}>Nenhuma avaliação realizada</Text>
          <Text style={styles.emptySubtitle}>
            Você verá suas avaliações aqui após completar consultas
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cardHeaderText: { flex: 1, marginRight: 8 },
  medicoNome: { fontSize: 15, fontWeight: '700', color: '#222' },
  especialidade: { fontSize: 12, color: '#888', marginTop: 1 },
  headerRight: { alignItems: 'flex-end' },
  cardDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  cardDateText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBF0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  ratingBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFB800',
  },
  notasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  notaItem: {
    width: '48%',
    backgroundColor: '#F9F9F9',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  notaLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  notaValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 2,
  },
  respostasContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  respostaItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: '#DDD',
  },
  respostaLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  respostaValue: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  comentarioContainer: {
    backgroundColor: '#F0F7F0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  comentarioLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  comentarioText: {
    fontSize: 13,
    color: '#333',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  melhoriasContainer: {
    backgroundColor: '#FFFBF0',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB800',
  },
  melhoriasLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  melhoriasText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 8,
    textAlign: 'center',
  },
});

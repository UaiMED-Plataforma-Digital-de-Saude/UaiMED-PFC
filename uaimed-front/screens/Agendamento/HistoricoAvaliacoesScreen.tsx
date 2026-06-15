import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { AgendamentoStackParamList } from '../../navigation/types';
import { Avaliacao } from '../../types/avaliacao';

/**
 * Tela de Histórico de Avaliações
 * Mostra todas as avaliações realizadas pelo paciente
 */
type Props = StackScreenProps<AgendamentoStackParamList, 'HistoricoAvaliacoes'>;

export const HistoricoAvaliacoesScreen: React.FC<Props> = ({ navigation }) => {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Carrega dados simulados na primeira renderização
  useEffect(() => {
    loadAvaliacoes();
  }, []);

  const loadAvaliacoes = async () => {
    try {
      setLoading(true);
      // Simula chamada à API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Dados simulados
      const avaliacoesSimuladas: Avaliacao[] = [
        {
          id: '1',
          agendamentoId: 'agd-001',
          medicoId: 'med-001',
          pacienteId: 'pac-001',
          dataAvaliacao: new Date(2025, 10, 5).toISOString(),
          notaAtendimento: 5,
          notaPuntualidade: 4,
          notaClinica: 5,
          notaComuni: 5,
          voltariaClinica: 'sim',
          recomendaMedico: 'sim',
          comentario: 'Atendimento excelente, médico muito atenciosos e prestativo!',
          melhorias: 'Tudo perfeito',
          criadoEm: new Date(2025, 10, 5).toISOString(),
          atualizadoEm: new Date(2025, 10, 5).toISOString(),
        },
        {
          id: '2',
          agendamentoId: 'agd-002',
          medicoId: 'med-002',
          pacienteId: 'pac-001',
          dataAvaliacao: new Date(2025, 9, 20).toISOString(),
          notaAtendimento: 4,
          notaPuntualidade: 5,
          notaClinica: 4,
          notaComuni: 4,
          voltariaClinica: 'sim',
          recomendaMedico: 'sim',
          comentario: 'Bom atendimento, clínica bem organizada.',
          melhorias: 'Poderia ter mais conforto na sala de espera',
          criadoEm: new Date(2025, 9, 20).toISOString(),
          atualizadoEm: new Date(2025, 9, 20).toISOString(),
        },
        {
          id: '3',
          agendamentoId: 'agd-003',
          medicoId: 'med-003',
          pacienteId: 'pac-001',
          dataAvaliacao: new Date(2025, 8, 15).toISOString(),
          notaAtendimento: 3,
          notaPuntualidade: 2,
          notaClinica: 3,
          notaComuni: 3,
          voltariaClinica: 'talvez',
          recomendaMedico: 'talvez',
          comentario: 'Atendimento ok, mas demora na sala de espera foi longa.',
          melhorias: 'Melhorar pontualidade do médico',
          criadoEm: new Date(2025, 8, 15).toISOString(),
          atualizadoEm: new Date(2025, 8, 15).toISOString(),
        },
      ];

      setAvaliacoes(avaliacoesSimuladas);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAvaliacoes();
  };

  // Renderiza card de avaliação
  const renderCard = ({ item }: { item: Avaliacao }) => {
    const mediaNotas =
      (item.notaAtendimento +
        item.notaPuntualidade +
        item.notaClinica +
        item.notaComuni) /
      4;

    const data = new Date(item.dataAvaliacao);
    const dataFormatada = data.toLocaleDateString('pt-BR');

    return (
      <TouchableOpacity style={styles.card}>
        {/* Header do Card */}
        <View style={styles.cardHeader}>
          <View style={styles.cardDate}>
            <Ionicons name="calendar-outline" size={16} color="#4CAF50" />
            <Text style={styles.cardDateText}>{dataFormatada}</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#FFB800" />
            <Text style={styles.ratingBadgeText}>{mediaNotas.toFixed(1)}</Text>
          </View>
        </View>

        {/* Notas */}
        <View style={styles.notasGrid}>
          <View style={styles.notaItem}>
            <Ionicons name="person" size={16} color="#4CAF50" />
            <Text style={styles.notaLabel}>Atendimento</Text>
            <Text style={styles.notaValue}>{item.notaAtendimento}★</Text>
          </View>
          <View style={styles.notaItem}>
            <Ionicons name="time" size={16} color="#4CAF50" />
            <Text style={styles.notaLabel}>Pontualidade</Text>
            <Text style={styles.notaValue}>{item.notaPuntualidade}★</Text>
          </View>
          <View style={styles.notaItem}>
            <Ionicons name="medkit-outline" size={16} color="#4CAF50" />
            <Text style={styles.notaLabel}>Clínica</Text>
            <Text style={styles.notaValue}>{item.notaClinica}★</Text>
          </View>
          <View style={styles.notaItem}>
            <Ionicons name="chatbubbles" size={16} color="#4CAF50" />
            <Text style={styles.notaLabel}>Comunicação</Text>
            <Text style={styles.notaValue}>{item.notaComuni}★</Text>
          </View>
        </View>

        {/* Respostas */}
        <View style={styles.respostasContainer}>
          <View style={styles.respostaItem}>
            <Text style={styles.respostaLabel}>Voltaria?</Text>
            <Text
              style={[
                styles.respostaValue,
                {
                  color:
                    item.voltariaClinica === 'sim'
                      ? '#4CAF50'
                      : item.voltariaClinica === 'nao'
                        ? '#D9534F'
                        : '#FF9800',
                },
              ]}
            >
              {item.voltariaClinica === 'sim'
                ? '✓ Sim'
                : item.voltariaClinica === 'nao'
                  ? '✗ Não'
                  : '? Talvez'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.respostaItem}>
            <Text style={styles.respostaLabel}>Recomenda?</Text>
            <Text
              style={[
                styles.respostaValue,
                {
                  color:
                    item.recomendaMedico === 'sim'
                      ? '#4CAF50'
                      : item.recomendaMedico === 'nao'
                        ? '#D9534F'
                        : '#FF9800',
                },
              ]}
            >
              {item.recomendaMedico === 'sim'
                ? '✓ Sim'
                : item.recomendaMedico === 'nao'
                  ? '✗ Não'
                  : '? Talvez'}
            </Text>
          </View>
        </View>

        {/* Comentário */}
        {item.comentario && (
          <View style={styles.comentarioContainer}>
            <Text style={styles.comentarioLabel}>Sua Avaliação:</Text>
            <Text style={styles.comentarioText} numberOfLines={2}>
              "{item.comentario}"
            </Text>
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
      </TouchableOpacity>
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
      {/* Lista de Avaliações */}
      {avaliacoes.length > 0 ? (
        <FlatList
          data={avaliacoes}
          renderItem={renderCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          scrollEnabled
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

      {/* Botão Flutuante para Nova Avaliação */}
      {avaliacoes.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('Avaliacao')}
        >
          <Ionicons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cardDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardDateText: {
    fontSize: 13,
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
});

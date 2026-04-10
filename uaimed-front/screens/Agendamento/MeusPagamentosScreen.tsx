import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { AgendamentoStackParamList } from '../../navigation/types';
import uaiMedApi from '../../api/uaiMedApi';

type Props = StackScreenProps<AgendamentoStackParamList, 'MeusPagamentos'>;

interface Pagamento {
  id: string;
  valor: number;
  desconto: number;
  valorFinal: number;
  metodo: string;
  status: string;
  cupom?: string | null;
  criado_em: string;
  agendamento?: {
    dataHora: string;
    profissional?: {
      especialidade?: string;
      usuario?: { nome: string };
    } | null;
  } | null;
}

const METODO_LABEL: Record<string, string> = {
  pix: 'Pix',
  cartao_credito: 'Cartão de Crédito',
  cartao_debito: 'Cartão de Débito',
  card: 'Cartão',
  boleto: 'Boleto Bancário',
  cash: 'Dinheiro', // legacy
};

const STATUS_COLOR: Record<string, string> = {
  concluido: '#4CAF50',
  pendente: '#FF9800',
  cancelado: '#E53935',
};

const MeusPagamentosScreen: React.FC<Props> = ({ navigation }) => {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPagamentos = useCallback(async () => {
    try {
      const res = await uaiMedApi.get('/pagamentos');
      setPagamentos(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.warn('[MeusPagamentos] Erro ao buscar pagamentos:', e);
      setPagamentos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPagamentos();
  }, [fetchPagamentos]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPagamentos();
  };

  const renderItem = ({ item }: { item: Pagamento }) => {
    const dataConsulta = item.agendamento?.dataHora
      ? new Date(item.agendamento.dataHora).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '—';
    const horario = item.agendamento?.dataHora
      ? new Date(item.agendamento.dataHora).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';
    const medicoNome = item.agendamento?.profissional?.usuario?.nome ?? 'Profissional';
    const especialidade = item.agendamento?.profissional?.especialidade ?? '';
    const statusColor = STATUS_COLOR[item.status] ?? '#888';
    const metodoLabel = METODO_LABEL[item.metodo] ?? item.metodo;
    const temDesconto = item.desconto > 0;

    return (
      <View style={styles.card}>
        {/* Cabeçalho do card */}
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <Ionicons name="receipt-outline" size={22} color="#4CAF50" />
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.medicoNome} numberOfLines={1}>{medicoNome}</Text>
            {especialidade ? (
              <Text style={styles.especialidade}>{especialidade}</Text>
            ) : null}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Detalhes */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={14} color="#888" />
            <Text style={styles.detailText}>{dataConsulta}{horario ? ` · ${horario}` : ''}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="card-outline" size={14} color="#888" />
            <Text style={styles.detailText}>{metodoLabel}</Text>
          </View>
        </View>

        {/* Valores */}
        <View style={styles.valoresRow}>
          {temDesconto && (
            <Text style={styles.valorOriginal}>R$ {item.valor.toFixed(2)}</Text>
          )}
          {item.cupom ? (
            <View style={styles.cupomBadge}>
              <Ionicons name="pricetag-outline" size={11} color="#4B73B2" />
              <Text style={styles.cupomText}>{item.cupom}</Text>
            </View>
          ) : null}
          <Text style={styles.valorFinal}>R$ {item.valorFinal.toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-back" size={26} color="#4CAF50" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meus Pagamentos</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Carregando pagamentos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={26} color="#4CAF50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Pagamentos</Text>
      </View>

      {pagamentos.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="receipt-outline" size={56} color="#DDD" />
          <Text style={styles.emptyTitle}>Nenhum pagamento</Text>
          <Text style={styles.emptySubtitle}>Seus pagamentos realizados aparecerão aqui.</Text>
        </View>
      ) : (
        <>
          {/* Resumo total */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total investido em saúde</Text>
            <Text style={styles.summaryValue}>
              R$ {pagamentos
                .filter(p => p.status === 'concluido')
                .reduce((acc, p) => acc + p.valorFinal, 0)
                .toFixed(2)}
            </Text>
            <Text style={styles.summaryCount}>{pagamentos.length} pagamento{pagamentos.length !== 1 ? 's' : ''}</Text>
          </View>

          <FlatList
            data={pagamentos}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
            }
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  backBtn: { marginRight: 10 },
  headerTitle: { fontSize: 19, fontWeight: '700', color: '#222' },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  loadingText: { fontSize: 14, color: '#999', marginTop: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#AAAAAA', marginTop: 16 },
  emptySubtitle: {
    fontSize: 13,
    color: '#BBBBBB',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 32,
  },

  summaryCard: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  summaryLabel: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  summaryValue: { fontSize: 28, fontWeight: '800', color: '#FFF', marginTop: 4 },
  summaryCount: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4 },

  list: { padding: 16, paddingTop: 8, paddingBottom: 40 },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardHeaderText: { flex: 1 },
  medicoNome: { fontSize: 15, fontWeight: '700', color: '#222' },
  especialidade: { fontSize: 12, color: '#888', marginTop: 1 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: { fontSize: 11, fontWeight: '700' },

  detailsRow: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: 12, color: '#777' },

  valoresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 10,
  },
  valorOriginal: {
    fontSize: 12,
    color: '#BBB',
    textDecorationLine: 'line-through',
  },
  cupomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cupomText: { fontSize: 10, color: '#4B73B2', fontWeight: '700' },
  valorFinal: { fontSize: 17, fontWeight: '800', color: '#4CAF50' },
});

export default MeusPagamentosScreen;

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

type Props = StackScreenProps<AgendamentoStackParamList, 'MinhasConsultas'>;

// Interface alinhada com o retorno real do backend (GET /api/agendamentos)
interface Consulta {
  id: string;
  data: string;          // backend retorna 'data', não 'dataHora'
  medico: string | null; // flat — não aninhado em profissional.usuario.nome
  especialidade: string | null;
  status: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  agendado:   { label: 'Agendado',   color: '#4B73B2', icon: 'calendar-outline' },
  confirmado: { label: 'Confirmado', color: '#4CAF50', icon: 'checkmark-circle-outline' },
  concluido:  { label: 'Concluído',  color: '#777',    icon: 'checkmark-done-outline' },
  cancelado:  { label: 'Cancelado',  color: '#E53935', icon: 'close-circle-outline' },
};

const MinhasConsultasScreen: React.FC<Props> = ({ navigation }) => {
  const [consultas, setConsultas]     = useState<Consulta[]>([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [activeTab, setActiveTab]     = useState<'proximas' | 'anteriores'>('proximas');

  const fetchConsultas = useCallback(async () => {
    try {
      const res = await uaiMedApi.get('/agendamentos');
      setConsultas(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.warn('[MinhasConsultas] Erro ao buscar consultas:', e);
      setConsultas([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchConsultas();
  }, [fetchConsultas]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConsultas();
  };

  const agora = new Date();

  const filtradas = consultas.filter((c) => {
    const dataConsulta = new Date(c.data);   // usa 'c.data', não 'c.dataHora'
    if (activeTab === 'proximas')   return dataConsulta >= agora && c.status !== 'cancelado';
    if (activeTab === 'anteriores') return dataConsulta < agora  || c.status === 'cancelado' || c.status === 'concluido';
    return true;
  });

  const renderItem = ({ item }: { item: Consulta }) => {
    const dataObj = new Date(item.data);     // usa 'item.data'
    const dateStr = dataObj.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeStr = dataObj.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const medicoNome    = item.medico ?? 'Profissional';         // flat
    const especialidade = item.especialidade ?? '';              // flat
    const cfg           = STATUS_CONFIG[item.status] ?? { label: item.status, color: '#888', icon: 'ellipse-outline' };

    return (
      <View style={styles.card}>
        {/* Header do card */}
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <Ionicons name="medical-outline" size={20} color="#4B73B2" />
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.medicoNome} numberOfLines={1}>{medicoNome}</Text>
            {especialidade ? <Text style={styles.especialidade}>{especialidade}</Text> : null}
          </View>
          {/* Badge de status */}
          <View style={[styles.statusBadge, { backgroundColor: cfg.color + '1A' }]}>
            <Ionicons name={cfg.icon as any} size={12} color={cfg.color} style={{ marginRight: 4 }} />
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        {/* Data e hora */}
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={14} color="#888" />
          <Text style={styles.dateText}>{dateStr}</Text>
          <Ionicons name="time-outline" size={14} color="#888" style={{ marginLeft: 10 }} />
          <Text style={styles.dateText}>{timeStr}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-back" size={26} color="#4CAF50" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Minhas Consultas</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Carregando consultas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={26} color="#4CAF50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minhas Consultas</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'proximas' && styles.tabActive]}
          onPress={() => setActiveTab('proximas')}
        >
          <Text style={[styles.tabText, activeTab === 'proximas' && styles.tabTextActive]}>
            Próximas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'anteriores' && styles.tabActive]}
          onPress={() => setActiveTab('anteriores')}
        >
          <Text style={[styles.tabText, activeTab === 'anteriores' && styles.tabTextActive]}>
            Anteriores
          </Text>
        </TouchableOpacity>
      </View>

      {filtradas.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="calendar-outline" size={56} color="#DDD" />
          <Text style={styles.emptyTitle}>
            {activeTab === 'proximas' ? 'Nenhuma consulta futura' : 'Nenhuma consulta anterior'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'proximas'
              ? 'Agende uma nova consulta pelo menu principal.'
              : 'Suas consultas realizadas aparecerão aqui.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtradas}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
          }
        />
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

  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  tabTextActive: {
    color: '#4CAF50',
  },

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

  list: { padding: 16, paddingBottom: 40 },

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
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardHeaderText: { flex: 1 },
  medicoNome: { fontSize: 15, fontWeight: '700', color: '#222' },
  especialidade: { fontSize: 12, color: '#888', marginTop: 1 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: { fontSize: 11, fontWeight: '700' },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  dateText: { fontSize: 12, color: '#666', textTransform: 'capitalize' },

  obs: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});

export default MinhasConsultasScreen;

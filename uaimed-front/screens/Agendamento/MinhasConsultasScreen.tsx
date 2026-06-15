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
import AppModal from '../../components/AppModal';
import { useModal } from '../../hooks/useModal';

type Props = StackScreenProps<AgendamentoStackParamList, 'MinhasConsultas'>;

// Antecedência mínima em horas para cancelar ou remarcar
const HORAS_MINIMAS_CANCELAMENTO = 24;

interface Consulta {
  id: string;
  data: string;
  medico: string | null;
  medicoId?: string;
  especialidade: string | null;
  status: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  agendado:   { label: 'Agendado',   color: '#4B73B2', icon: 'calendar-outline' },
  confirmado: { label: 'Confirmado', color: '#4CAF50', icon: 'checkmark-circle-outline' },
  concluido:  { label: 'Concluído',  color: '#777',    icon: 'checkmark-done-outline' },
  cancelado:  { label: 'Cancelado',  color: '#E53935', icon: 'close-circle-outline' },
};

// Retorna true se a consulta pode ser cancelada/remarcada (>= 24h de antecedência)
function podeCancelarOuRemarcar(dataConsulta: Date): boolean {
  const diffMs = dataConsulta.getTime() - Date.now();
  const diffHoras = diffMs / (1000 * 60 * 60);
  return diffHoras >= HORAS_MINIMAS_CANCELAMENTO;
}

const MinhasConsultasScreen: React.FC<Props> = ({ navigation }) => {
  const [consultas, setConsultas]     = useState<Consulta[]>([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [activeTab, setActiveTab]     = useState<'proximas' | 'anteriores'>('proximas');
  const [cancelando, setCancelando]   = useState<string | null>(null);
  const { modal, showModal, hideModal } = useModal();

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

  // ── Cancelar consulta ──────────────────────────────────────────────────────
  const handleCancelar = (item: Consulta) => {
    const dataConsulta = new Date(item.data);

    if (!podeCancelarOuRemarcar(dataConsulta)) {
      showModal(
        'Cancelamento não permitido',
        `Não é possível cancelar consultas com menos de ${HORAS_MINIMAS_CANCELAMENTO} horas de antecedência.\n\nEntre em contato direto com o profissional se necessário.`,
        { type: 'warning' },
      );
      return;
    }

    showModal(
      'Cancelar consulta',
      `Tem certeza que deseja cancelar a consulta com ${item.medico ?? 'o profissional'}?\n\nEsta ação não poderá ser desfeita.`,
      {
        type: 'warning',
        buttons: [
          { text: 'Não, manter', onPress: hideModal },
          {
            text: 'Sim, cancelar',
            onPress: async () => {
              hideModal();
              setCancelando(item.id);
              try {
                await uaiMedApi.patch(`/agendamentos/${item.id}/cancelar`);
                setConsultas((prev) =>
                  prev.map((c) => (c.id === item.id ? { ...c, status: 'cancelado' } : c)),
                );
                showModal('Consulta cancelada', 'Sua consulta foi cancelada com sucesso.', { type: 'success' });
              } catch (e: any) {
                const msg = e?.response?.data?.error || 'Não foi possível cancelar a consulta.';
                showModal('Erro', msg, { type: 'error' });
              } finally {
                setCancelando(null);
              }
            },
          },
        ],
      },
    );
  };

  // ── Remarcar consulta ──────────────────────────────────────────────────────
  const handleRemarcar = (item: Consulta) => {
    const dataConsulta = new Date(item.data);

    if (!podeCancelarOuRemarcar(dataConsulta)) {
      showModal(
        'Remarcação não permitida',
        `Não é possível remarcar consultas com menos de ${HORAS_MINIMAS_CANCELAMENTO} horas de antecedência.\n\nEntre em contato direto com o profissional se necessário.`,
        { type: 'warning' },
      );
      return;
    }

    if (!item.medicoId) {
      showModal('Erro', 'Não foi possível identificar o profissional para remarcação.', { type: 'error' });
      return;
    }

    navigation.navigate('SelecaoHorario', {
      medicoId: item.medicoId,
      nomeProfissional: item.medico ?? undefined,
    });
  };

  const agora = new Date();

  const filtradas = consultas.filter((c) => {
    const dataConsulta = new Date(c.data);
    if (activeTab === 'proximas')   return dataConsulta >= agora && c.status !== 'cancelado';
    if (activeTab === 'anteriores') return dataConsulta < agora  || c.status === 'cancelado' || c.status === 'concluido';
    return true;
  });

  const renderItem = ({ item }: { item: Consulta }) => {
    const dataObj  = new Date(item.data);
    const dateStr  = dataObj.toLocaleDateString('pt-BR', {
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
    });
    const timeStr = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const medicoNome    = item.medico ?? 'Profissional';
    const especialidade = item.especialidade ?? '';
    const cfg           = STATUS_CONFIG[item.status] ?? { label: item.status, color: '#888', icon: 'ellipse-outline' };

    const isFutura  = activeTab === 'proximas';
    const podeAgir  = isFutura && (item.status === 'agendado' || item.status === 'confirmado');
    const isCancelando = cancelando === item.id;

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

        {/* Ações (apenas para consultas futuras agendadas/confirmadas) */}
        {podeAgir && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.btnAcao, styles.btnRemarcar]}
              onPress={() => handleRemarcar(item)}
              disabled={isCancelando}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={15} color="#4B73B2" />
              <Text style={[styles.btnAcaoText, { color: '#4B73B2' }]}>Remarcar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnAcao, styles.btnCancelar]}
              onPress={() => handleCancelar(item)}
              disabled={isCancelando}
              activeOpacity={0.8}
            >
              {isCancelando ? (
                <ActivityIndicator size="small" color="#E53935" />
              ) : (
                <>
                  <Ionicons name="close-circle-outline" size={15} color="#E53935" />
                  <Text style={[styles.btnAcaoText, { color: '#E53935' }]}>Cancelar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Carregando consultas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
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

      {/* Aviso de regra de cancelamento */}
      {activeTab === 'proximas' && filtradas.length > 0 && (
        <View style={styles.regraAviso}>
          <Ionicons name="information-circle-outline" size={14} color="#4B73B2" />
          <Text style={styles.regraAvisoText}>
            Cancelamentos e remarcações devem ser feitos com {HORAS_MINIMAS_CANCELAMENTO}h de antecedência.
          </Text>
        </View>
      )}

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

      <AppModal {...modal} onClose={hideModal} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },

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
  tabText: { fontSize: 14, fontWeight: '600', color: '#999' },
  tabTextActive: { color: '#4CAF50' },

  regraAviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4B73B2',
  },
  regraAvisoText: { flex: 1, fontSize: 12, color: '#4B73B2', lineHeight: 17 },

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

  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  btnAcao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  btnRemarcar: {
    borderColor: '#4B73B2',
    backgroundColor: '#F0F4FF',
  },
  btnCancelar: {
    borderColor: '#E53935',
    backgroundColor: '#FFF5F5',
  },
  btnAcaoText: { fontSize: 13, fontWeight: '700' },
});

export default MinhasConsultasScreen;

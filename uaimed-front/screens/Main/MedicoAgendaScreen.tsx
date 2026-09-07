import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator, FlatList, RefreshControl, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import uaiMedApi from '../../api/uaiMedApi';

interface ConsultaMedico {
  id: string;
  dataHora: string;
  duracao: number;
  status: string;
  observacoes: string | null;
  usuario: { id: string; nome: string; telefone: string | null };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  agendado: { label: 'Agendada', color: '#4B73B2', icon: 'calendar-outline' },
  confirmado: { label: 'Confirmada', color: '#2E7D32', icon: 'checkmark-circle-outline' },
  concluido: { label: 'Concluída', color: '#686868', icon: 'checkmark-done-outline' },
  cancelado: { label: 'Cancelada', color: '#D32F2F', icon: 'close-circle-outline' },
};

const MedicoAgendaScreen: React.FC = () => {
  const { user } = useAuth();
  const [consultas, setConsultas] = useState<ConsultaMedico[]>([]);
  const [activeTab, setActiveTab] = useState<'proximas' | 'historico'>('proximas');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const fetchConsultas = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await uaiMedApi.get('/professionals/me/agendamentos');
      setConsultas(Array.isArray(res.data) ? res.data : []);
      setErro(null);
    } catch (e: any) {
      setConsultas([]);
      setErro(e?.response?.data?.error || 'Não foi possível carregar suas consultas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    fetchConsultas();
  }, [fetchConsultas]));

  const proximas = useMemo(() => {
    const agora = Date.now();
    return consultas
      .filter((item) => new Date(item.dataHora).getTime() >= agora
        && ['agendado', 'confirmado'].includes(item.status))
      .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());
  }, [consultas]);

  const filtradas = useMemo(() => {
    if (activeTab === 'proximas') return proximas;
    const agora = Date.now();
    return consultas
      .filter((item) => new Date(item.dataHora).getTime() < agora
        || ['cancelado', 'concluido'].includes(item.status))
      .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());
  }, [activeTab, consultas, proximas]);

  const renderConsulta = ({ item }: { item: ConsultaMedico }) => {
    const data = new Date(item.dataHora);
    const cfg = STATUS_CONFIG[item.status] ?? { label: item.status, color: '#777', icon: 'ellipse-outline' };
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.patientIcon}>
            <Ionicons name="person-outline" size={21} color="#2E7D32" />
          </View>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName} numberOfLines={1}>{item.usuario.nome}</Text>
            <Text style={styles.patientPhone}>{item.usuario.telefone || 'Telefone não informado'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${cfg.color}1A` }]}>
            <Ionicons name={cfg.icon as any} size={12} color={cfg.color} />
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#777" />
          <Text style={styles.detailText}>{data.toLocaleDateString('pt-BR', {
            weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
          })}</Text>
          <Ionicons name="time-outline" size={16} color="#777" />
          <Text style={styles.detailText}>{data.toLocaleTimeString('pt-BR', {
            hour: '2-digit', minute: '2-digit',
          })}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="hourglass-outline" size={16} color="#777" />
          <Text style={styles.detailText}>{item.duracao} minutos</Text>
        </View>

        {item.observacoes ? (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>Observações do paciente</Text>
            <Text style={styles.notesText}>{item.observacoes}</Text>
          </View>
        ) : null}
      </View>
    );
  };

  if (!user) return <View style={styles.centered}><Text>Usuário não autenticado.</Text></View>;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Carregando consultas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.summaryNumber}>{proximas.length}</Text>
        <View>
          <Text style={styles.summaryTitle}>consultas próximas</Text>
          <Text style={styles.summarySubtitle}>Agendadas pelos seus pacientes</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, activeTab === 'proximas' && styles.tabActive]}
          onPress={() => setActiveTab('proximas')}>
          <Text style={[styles.tabText, activeTab === 'proximas' && styles.tabTextActive]}>Próximas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'historico' && styles.tabActive]}
          onPress={() => setActiveTab('historico')}>
          <Text style={[styles.tabText, activeTab === 'historico' && styles.tabTextActive]}>Histórico</Text>
        </TouchableOpacity>
      </View>

      {erro ? <Text style={styles.errorText}>{erro}</Text> : null}

      <FlatList
        data={filtradas}
        keyExtractor={(item) => item.id}
        renderItem={renderConsulta}
        contentContainerStyle={filtradas.length ? styles.list : styles.emptyList}
        refreshControl={<RefreshControl refreshing={refreshing}
          onRefresh={() => fetchConsultas(true)} colors={['#2E7D32']} />}
        ListEmptyComponent={(
          <View style={styles.empty}>
            <Ionicons name="calendar-clear-outline" size={52} color="#C9CFC9" />
            <Text style={styles.emptyTitle}>
              {activeTab === 'proximas' ? 'Nenhuma consulta próxima' : 'Nenhuma consulta no histórico'}
            </Text>
            <Text style={styles.emptySubtitle}>Puxe a tela para baixo para atualizar.</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8F6' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { color: '#777', fontSize: 14, marginTop: 10 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 13, margin: 16, marginBottom: 12,
    padding: 17, backgroundColor: '#E8F5E9', borderRadius: 14, borderWidth: 1, borderColor: '#C8E6C9' },
  summaryNumber: { color: '#2E7D32', fontSize: 34, lineHeight: 38, fontWeight: '800' },
  summaryTitle: { color: '#245A28', fontSize: 15, fontWeight: '700' },
  summarySubtitle: { color: '#638066', fontSize: 12, marginTop: 2 },
  tabs: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 10, padding: 4,
    borderRadius: 11, backgroundColor: '#E8ECE8' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 8 },
  tabActive: { backgroundColor: '#FFF' },
  tabText: { color: '#777', fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#2E7D32', fontWeight: '800' },
  errorText: { color: '#C62828', fontSize: 13, marginHorizontal: 18, marginBottom: 8 },
  list: { paddingHorizontal: 16, paddingBottom: 30 },
  emptyList: { flexGrow: 1, paddingHorizontal: 16 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  emptyTitle: { color: '#777', fontSize: 16, fontWeight: '700', marginTop: 12 },
  emptySubtitle: { color: '#A0A0A0', fontSize: 12, marginTop: 5 },
  card: { backgroundColor: '#FFF', borderRadius: 14, padding: 15, marginBottom: 12,
    borderWidth: 1, borderColor: '#E8EAE8' },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  patientIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center',
    justifyContent: 'center', backgroundColor: '#E8F5E9' },
  patientInfo: { flex: 1, marginHorizontal: 11 },
  patientName: { color: '#252525', fontSize: 15, fontWeight: '800' },
  patientPhone: { color: '#858585', fontSize: 12, marginTop: 3 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 5 },
  statusText: { fontSize: 10, fontWeight: '800' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  detailText: { color: '#626262', fontSize: 13, marginRight: 7, textTransform: 'capitalize' },
  notes: { backgroundColor: '#F7F8F7', borderRadius: 9, padding: 11, marginTop: 12 },
  notesLabel: { color: '#666', fontSize: 11, fontWeight: '700', marginBottom: 4 },
  notesText: { color: '#555', fontSize: 13, lineHeight: 18 },
});

export default MedicoAgendaScreen;

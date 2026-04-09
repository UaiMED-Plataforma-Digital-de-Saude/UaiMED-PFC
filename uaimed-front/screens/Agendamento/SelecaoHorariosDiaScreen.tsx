import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import uaiMedApi from '../../api/uaiMedApi';
import { AgendamentoStackParamList } from '../../navigation/types';

type Props = StackScreenProps<AgendamentoStackParamList, 'SelecaoHorariosDia'>;

const SelecaoHorariosDiaScreen: React.FC<Props> = ({ route, navigation }) => {
  const { medicoId, dateKey, displayDate, amount } = route.params ?? {};

  const [horarios, setHorarios] = useState<string[]>([]);
  const [loading, setLoading]   = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null); // horário em processamento

  // ── Busca horários disponíveis para o dia ──────────────────────────────────
  const fetchHorarios = useCallback(async () => {
    setLoading(true);
    setHorarios([]);
    try {
      const res = await uaiMedApi.get('/agendamentos/sugestoes-horario', {
        params: { medicoId, data: dateKey },
      });
      setHorarios(Array.isArray(res.data) ? res.data : []);
    } catch {
      setHorarios([]);
      Alert.alert('Atenção', 'Não foi possível carregar os horários. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [medicoId, dateKey]);

  useEffect(() => {
    fetchHorarios();
  }, [fetchHorarios]);

  // ── Cria o agendamento ao selecionar um horário ────────────────────────────
  const handleSelecionarHorario = async (horario: string) => {
    if (confirming) return;
    setConfirming(horario);
    try {
      const res = await uaiMedApi.post('/agendamentos', {
        medicoId,
        dataHora: horario,
      });
      const agendamentoId: string = res.data?.id ?? res.data?.agendamentoId;
      navigation.navigate('Confirmacao', {
        horario,
        medicoId: medicoId ?? '',
        agendamentoId,
        amount: amount ?? res.data?.valor ?? 0,
      });
    } catch (e: any) {
      const status = e?.response?.status;
      const serverError: string = e?.response?.data?.error || '';
      const serverDetail: string = e?.response?.data?.detail || '';

      if (status === 401 || status === 422) {
        // Sessão inválida (userId sumiu do DB após reset/seed)
        Alert.alert(
          'Sessão expirada',
          serverError || 'Sua sessão expirou. Faça login novamente.',
          [{ text: 'OK' }],
        );
        return;
      }
      if (status === 409) {
        Alert.alert('Horário ocupado', 'Este horário já foi reservado. Escolha outro.');
        return;
      }
      if (status === 404) {
        Alert.alert('Profissional não encontrado', 'O profissional selecionado não está mais disponível.');
        return;
      }

      const msg = serverError || 'Não foi possível criar o agendamento.';
      Alert.alert('Erro', serverDetail ? `${msg}\n\n${serverDetail}` : msg);
    } finally {
      setConfirming(null);
    }
  };

  // ── Formata exibição de horário ────────────────────────────────────────────
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={26} color="#4CAF50" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Horários Disponíveis</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {displayDate ?? dateKey}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          /* Carregando */
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Buscando horários...</Text>
          </View>
        ) : horarios.length === 0 ? (
          /* Sem horários */
          <View style={styles.centered}>
            <Ionicons name="calendar-outline" size={56} color="#DDD" />
            <Text style={styles.emptyTitle}>Sem horários disponíveis</Text>
            <Text style={styles.emptySubtitle}>
              Todos os horários desta data estão ocupados.{'\n'}Volte e selecione outro dia.
            </Text>
            <TouchableOpacity style={styles.backDateBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={16} color="#4CAF50" />
              <Text style={styles.backDateText}>Escolher outra data</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>
              {horarios.length} horário{horarios.length !== 1 ? 's' : ''} disponível{horarios.length !== 1 ? 'is' : ''}
            </Text>

            <View style={styles.slotsGrid}>
              {horarios.map(horario => {
                const isProcessing = confirming === horario;
                return (
                  <TouchableOpacity
                    key={horario}
                    style={[styles.slotBtn, isProcessing && styles.slotBtnProcessing]}
                    onPress={() => handleSelecionarHorario(horario)}
                    disabled={!!confirming}
                    activeOpacity={0.75}
                  >
                    {isProcessing ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Ionicons name="time-outline" size={16} color="#FFF" />
                    )}
                    <Text style={styles.slotBtnText}>{formatTime(horario)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.hint}>
              Toque em um horário para confirmar o agendamento
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  backBtn: { marginRight: 8 },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#222' },
  headerSubtitle: { fontSize: 13, color: '#888', marginTop: 1, textTransform: 'capitalize' },

  scroll: { padding: 16, paddingBottom: 40, flexGrow: 1 },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: { fontSize: 14, color: '#999', marginTop: 12 },

  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#AAAAAA', marginTop: 16 },
  emptySubtitle: {
    fontSize: 13,
    color: '#BBBBBB',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  backDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#4CAF50',
    gap: 4,
  },
  backDateText: { fontSize: 14, color: '#4CAF50', fontWeight: '600' },

  sectionLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 14,
    fontWeight: '500',
  },

  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  slotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    minWidth: 90,
    justifyContent: 'center',
  },
  slotBtnProcessing: {
    backgroundColor: '#81C784',
  },
  slotBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },

  hint: {
    fontSize: 12,
    color: '#BBBBBB',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
});

export default SelecaoHorariosDiaScreen;


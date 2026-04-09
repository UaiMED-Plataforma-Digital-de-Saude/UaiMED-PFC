import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import uaiMedApi from '../../api/uaiMedApi';
import { AgendamentoStackParamList } from '../../navigation/types';
import AppModal from '../../components/AppModal';
import { useModal } from '../../hooks/useModal';

type Props = StackScreenProps<AgendamentoStackParamList, 'SelecaoHorariosDia'>;

const SelecaoHorariosDiaScreen: React.FC<Props> = ({ route, navigation }) => {
  const { medicoId, dateKey, displayDate, amount } = route.params ?? {};

  const [horarios, setHorarios] = useState<string[]>([]);
  const [loading, setLoading]   = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [modalHorario, setModalHorario] = useState<string | null>(null);
  const { modal, showModal, hideModal } = useModal();

  // ── Busca horários disponíveis para o dia ──────────────────────────────────
  const fetchHorarios = useCallback(async () => {
    // Guarda: medicoId obrigatório
    if (!medicoId) {
      console.warn('[SelecaoHorariosDia] medicoId ausente — params:', JSON.stringify({ medicoId, dateKey, displayDate }));
      setLoading(false);
      showModal(
        'Profissional não identificado',
        'Não foi possível identificar o profissional. Volte e selecione novamente.',
        { type: 'error', buttons: [{ text: 'Voltar', onPress: () => navigation.goBack() }] },
      );
      return;
    }
    setLoading(true);
    setHorarios([]);
    try {
      const res = await uaiMedApi.get('/agendamentos/sugestoes-horario', {
        params: { medicoId, data: dateKey },
      });
      setHorarios(Array.isArray(res.data) ? res.data : []);
    } catch {
      setHorarios([]);
      showModal('Atenção', 'Não foi possível carregar os horários. Tente novamente.', { type: 'warning' });
    } finally {
      setLoading(false);
    }
  }, [medicoId, dateKey]);

  useEffect(() => {
    fetchHorarios();
  }, [fetchHorarios]);

  // ── Formata exibição de horário ────────────────────────────────────────────
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // ── Abre modal de confirmação ──────────────────────────────────────────────
  const confirmarHorario = (horario: string) => {
    if (confirming) return;
    setModalHorario(horario);
  };

  // ── Cria o agendamento após confirmação ────────────────────────────────────
  const criarAgendamento = async (horario: string) => {
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
        showModal('Sessão expirada', serverError || 'Sua sessão expirou. Faça login novamente.', { type: 'warning' });
        return;
      }
      if (status === 409) {
        showModal('Horário ocupado', 'Este horário já foi reservado. Escolha outro.', { type: 'warning' });
        return;
      }
      if (status === 404) {
        showModal('Profissional indisponível', 'O profissional selecionado não está mais disponível.', { type: 'error' });
        return;
      }

      const msg = serverError || 'Não foi possível criar o agendamento.';
      showModal('Erro', serverDetail ? `${msg}\n\n${serverDetail}` : msg, { type: 'error' });
    } finally {
      setConfirming(null);
    }
  };


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
                    onPress={() => confirmarHorario(horario)}
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

      {/* ── Modal de Confirmação de Horário ── */}
      <Modal
        visible={!!modalHorario}
        transparent
        animationType="fade"
        onRequestClose={() => setModalHorario(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalHorario(null)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            {/* Ícone */}
            <View style={styles.modalIconWrapper}>
              <Ionicons name="calendar-outline" size={36} color="#4CAF50" />
            </View>

            <Text style={styles.modalTitle}>Confirmar Agendamento</Text>

            {/* Data */}
            <View style={styles.modalInfoRow}>
              <Ionicons name="calendar" size={18} color="#4CAF50" />
              <Text style={styles.modalInfoLabel}>Data</Text>
              <Text style={styles.modalInfoValue} numberOfLines={1}>
                {displayDate ?? dateKey}
              </Text>
            </View>

            {/* Horário */}
            <View style={styles.modalInfoRow}>
              <Ionicons name="time" size={18} color="#4CAF50" />
              <Text style={styles.modalInfoLabel}>Horário</Text>
              <Text style={styles.modalInfoValue}>
                {modalHorario ? formatTime(modalHorario) : ''}
              </Text>
            </View>

            {/* Duração padrão */}
            <View style={styles.modalInfoRow}>
              <Ionicons name="hourglass-outline" size={18} color="#4CAF50" />
              <Text style={styles.modalInfoLabel}>Duração</Text>
              <Text style={styles.modalInfoValue}>30 minutos</Text>
            </View>

            <Text style={styles.modalHint}>
              Deseja reservar este horário?
            </Text>

            {/* Botões */}
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => setModalHorario(null)}
                activeOpacity={0.75}
              >
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtnConfirm, !!confirming && { opacity: 0.7 }]}
                onPress={() => {
                  const h = modalHorario!;
                  setModalHorario(null);
                  criarAgendamento(h);
                }}
                disabled={!!confirming}
                activeOpacity={0.8}
              >
                {confirming ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
                    <Text style={styles.modalBtnConfirmText}>Confirmar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      <AppModal {...modal} onClose={hideModal} />
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
    paddingHorizontal: 28,
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

  // ── Modal de confirmação ──────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  modalIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  modalInfoLabel: {
    fontSize: 13,
    color: '#888',
    width: 60,
  },
  modalInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    flex: 1,
    textTransform: 'capitalize',
  },
  modalHint: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#DDD',
    alignItems: 'center',
  },
  modalBtnCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#888',
  },
  modalBtnConfirm: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  modalBtnConfirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default SelecaoHorariosDiaScreen;


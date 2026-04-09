import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import uaiMedApi from '../../api/uaiMedApi';
import { AgendamentoStackParamList } from '../../navigation/types';

type Props = StackScreenProps<AgendamentoStackParamList, 'SelecaoHorario'>;

// ─── Constantes ───────────────────────────────────────────────────────────────

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const { width: SCREEN_WIDTH } = Dimensions.get('window');
// 16 de padding da tela + 16 de padding do card = 32 de cada lado, dividido por 7 dias
const DAY_SIZE = Math.floor((SCREEN_WIDTH - 64) / 7);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Retorna "YYYY-MM-DD" usando tempo local (sem deslocamento UTC) */
function toDateKey(d: Date): string {
  return (
    `${d.getFullYear()}-` +
    `${String(d.getMonth() + 1).padStart(2, '0')}-` +
    `${String(d.getDate()).padStart(2, '0')}`
  );
}

/** Gera o grid de células do calendário para o mês/ano fornecido */
function buildCalendarGrid(year: number, month: number): (Date | null)[] {
  const firstWeekday = new Date(year, month, 1).getDay(); // 0 = Dom
  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];

  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null); // completa última linha

  return cells;
}

// ─── Componente ───────────────────────────────────────────────────────────────

const SelecaoHorarioScreen: React.FC<Props> = ({ route, navigation }) => {
  const { medicoId, amount } = route.params ?? {};

  const todayMidnight = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();
  const maxDate = new Date(todayMidnight);
  maxDate.setDate(todayMidnight.getDate() + 30);

  const [displayMonth, setDisplayMonth] = useState(
    new Date(todayMidnight.getFullYear(), todayMidnight.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [horarios, setHorarios]         = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [confirming, setConfirming]     = useState(false);

  // ── Navegação de mês ────────────────────────────────────────────────────────
  const goToPrevMonth = () => {
    setDisplayMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1));
    setSelectedDate(null);
    setHorarios([]);
  };
  const goToNextMonth = () => {
    setDisplayMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1));
    setSelectedDate(null);
    setHorarios([]);
  };

  // ── Estado de cada célula ───────────────────────────────────────────────────
  const isSelectable = (date: Date | null): boolean => {
    if (!date) return false;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d >= todayMidnight && d <= maxDate;
  };
  const isToday    = (date: Date | null) =>
    !!date && toDateKey(date) === toDateKey(todayMidnight);
  const isSelected = (date: Date | null) =>
    !!date && !!selectedDate && toDateKey(date) === toDateKey(selectedDate);

  // ── Busca de horários por data ──────────────────────────────────────────────
  const fetchHorarios = useCallback(
    async (date: Date) => {
      setLoadingSlots(true);
      setHorarios([]);
      try {
        const res = await uaiMedApi.get('/agendamentos/sugestoes-horario', {
          params: { medicoId, data: toDateKey(date) },
        });
        setHorarios(Array.isArray(res.data) ? res.data : []);
      } catch {
        setHorarios([]);
      } finally {
        setLoadingSlots(false);
      }
    },
    [medicoId],
  );

  const handleSelectDate = (date: Date) => {
    if (!isSelectable(date)) return;
    setSelectedDate(date);
    fetchHorarios(date);
  };

  // ── Criação do agendamento ──────────────────────────────────────────────────
  const handleSelecionarHorario = async (horario: string) => {
    setConfirming(true);
    try {
      const res = await uaiMedApi.post('/agendamentos', { medicoId, dataHora: horario });
      const agendamentoId: string = res.data?.id ?? res.data?.agendamentoId;
      navigation.navigate('Confirmacao', {
        horario,
        medicoId: medicoId ?? '',
        agendamentoId,
        amount: amount ?? res.data?.valor ?? 0,
      });
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'Não foi possível criar o agendamento.';
      Alert.alert('Erro', msg);
    } finally {
      setConfirming(false);
    }
  };

  const calendarDays = buildCalendarGrid(
    displayMonth.getFullYear(),
    displayMonth.getMonth(),
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.screenTitle}>Selecionar Data e Horário</Text>
        <Text style={styles.screenSubtitle}>
          Escolha uma data disponível e toque no horário desejado
        </Text>

        {/* ── Calendário ───────────────────────────────────────────────────── */}
        <View style={styles.calendarCard}>
          {/* Cabeçalho com navegação de mês */}
          <View style={styles.monthHeader}>
            <TouchableOpacity
              onPress={goToPrevMonth}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="chevron-back" size={24} color="#4CAF50" />
            </TouchableOpacity>

            <Text style={styles.monthTitle}>
              {MONTHS[displayMonth.getMonth()]} {displayMonth.getFullYear()}
            </Text>

            <TouchableOpacity
              onPress={goToNextMonth}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="chevron-forward" size={24} color="#4CAF50" />
            </TouchableOpacity>
          </View>

          {/* Rótulos dos dias da semana */}
          <View style={styles.weekRow}>
            {WEEK_DAYS.map(wd => (
              <View key={wd} style={styles.weekLabelCell}>
                <Text style={styles.weekLabelText}>{wd}</Text>
              </View>
            ))}
          </View>

          {/* Grid de dias */}
          <View style={styles.daysGrid}>
            {calendarDays.map((date, idx) => {
              const selectable   = isSelectable(date);
              const todayFlag    = isToday(date);
              const selectedFlag = isSelected(date);
              const isPast       = date !== null && !selectable;

              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.dayCell,
                    selectedFlag && styles.dayCellSelected,
                    todayFlag && !selectedFlag && styles.dayCellToday,
                    isPast && styles.dayCellDisabled,
                  ]}
                  onPress={() => date && handleSelectDate(date)}
                  disabled={!selectable}
                  activeOpacity={selectable ? 0.7 : 1}
                >
                  {date ? (
                    <Text
                      style={[
                        styles.dayText,
                        selectedFlag && styles.dayTextSelected,
                        todayFlag && !selectedFlag && styles.dayTextToday,
                        isPast && styles.dayTextDisabled,
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Legenda */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendText}>Selecionado</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendDotToday]} />
              <Text style={styles.legendText}>Hoje</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#E0E0E0' }]} />
              <Text style={styles.legendText}>Indisponível</Text>
            </View>
          </View>
        </View>

        {/* ── Seção de Horários ────────────────────────────────────────────── */}
        {selectedDate ? (
          <View style={styles.slotsCard}>
            <View style={styles.slotsHeader}>
              <Ionicons name="time-outline" size={20} color="#4B73B2" />
              <Text style={styles.slotsTitle} numberOfLines={2}>
                {'Horários para '}
                {selectedDate.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                })}
              </Text>
            </View>

            {loadingSlots || confirming ? (
              <ActivityIndicator
                size="large"
                color="#4CAF50"
                style={{ marginVertical: 32 }}
              />
            ) : horarios.length > 0 ? (
              <View style={styles.slotsGrid}>
                {horarios.map(horario => {
                  const time = new Date(horario).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <TouchableOpacity
                      key={horario}
                      style={styles.slotBtn}
                      onPress={() => handleSelecionarHorario(horario)}
                      activeOpacity={0.75}
                    >
                      <Ionicons name="time-outline" size={14} color="#FFF" />
                      <Text style={styles.slotBtnText}>{time}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptySlots}>
                <Ionicons name="calendar-outline" size={44} color="#DDD" />
                <Text style={styles.emptySlotsTitle}>Sem horários disponíveis</Text>
                <Text style={styles.emptySlotsSubtitle}>
                  {'Todos os horários desta data estão ocupados.\nTente selecionar outro dia.'}
                </Text>
              </View>
            )}
          </View>
        ) : (
          /* Prompt inicial — orienta o usuário */
          <View style={styles.promptCard}>
            <Ionicons name="calendar-outline" size={52} color="#D0E8D0" />
            <Text style={styles.promptTitle}>Selecione uma data</Text>
            <Text style={styles.promptSubtitle}>
              Toque em qualquer dia disponível no calendário acima para ver os horários
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F5F7FA' },
  scroll: { padding: 16, paddingBottom: 48 },

  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginTop: 4,
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 16,
    lineHeight: 18,
  },

  // ── Calendário ──────────────────────────────────────────────────────────────
  calendarCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 6,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthTitle: { fontSize: 17, fontWeight: '700', color: '#222' },

  weekRow: { flexDirection: 'row', marginBottom: 6 },
  weekLabelCell: {
    width: DAY_SIZE,
    alignItems: 'center',
  },
  weekLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#AAA',
    textTransform: 'uppercase',
  },

  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    borderRadius: DAY_SIZE / 2,
  },
  dayCellSelected: { backgroundColor: '#4CAF50' },
  dayCellToday:    {
    backgroundColor: '#E8F5E9',
    borderWidth: 1.5,
    borderColor: '#4CAF50',
  },
  dayCellDisabled: { opacity: 0.3 },

  dayText:         { fontSize: 13, fontWeight: '500', color: '#333' },
  dayTextSelected: { color: '#FFF', fontWeight: '800' },
  dayTextToday:    { color: '#4CAF50', fontWeight: '700' },
  dayTextDisabled: { color: '#BBB' },

  // Legenda
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
    gap: 18,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot:  { width: 11, height: 11, borderRadius: 6 },
  legendDotToday: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1.5,
    borderColor: '#4CAF50',
  },
  legendText: { fontSize: 11, color: '#888' },

  // ── Horários ────────────────────────────────────────────────────────────────
  slotsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  slotsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  slotsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B73B2',
    flex: 1,
  },

  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 1,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  slotBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  // ── Estados vazios / prompt ─────────────────────────────────────────────────
  emptySlots:         { alignItems: 'center', paddingVertical: 36 },
  emptySlotsTitle:    {
    fontSize: 15,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  emptySlotsSubtitle: {
    fontSize: 12,
    color: '#BBB',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },

  promptCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#BBB',
    marginTop: 16,
  },
  promptSubtitle: {
    fontSize: 13,
    color: '#CCC',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
  },
});

export default SelecaoHorarioScreen;

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { AgendamentoStackParamList } from '../../navigation/types';

type Props = StackScreenProps<AgendamentoStackParamList, 'SelecaoHorario'>;

// ─── Constantes ───────────────────────────────────────────────────────────────

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const { width: SCREEN_WIDTH } = Dimensions.get('window');
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

  // ── Navegação de mês ────────────────────────────────────────────────────────
  const goToPrevMonth = () => {
    setDisplayMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1));
    setSelectedDate(null);
  };
  const goToNextMonth = () => {
    setDisplayMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1));
    setSelectedDate(null);
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

  const handleSelectDate = (date: Date) => {
    if (!isSelectable(date)) return;
    setSelectedDate(date);
    const displayDate = date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    });
    navigation.navigate('SelecaoHorariosDia', {
      medicoId: medicoId ?? '',
      dateKey: toDateKey(date),
      displayDate,
      amount,
    });
  };

  const calendarDays = buildCalendarGrid(
    displayMonth.getFullYear(),
    displayMonth.getMonth(),
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.screenTitle}>Selecionar Data</Text>
        <Text style={styles.screenSubtitle}>
          Toque em um dia disponível para ver os horários
        </Text>

        {/* ── Calendário ── */}
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

        {/* Prompt orientativo */}
        <View style={styles.promptCard}>
          <Ionicons name="time-outline" size={44} color="#D0E8D0" />
          <Text style={styles.promptTitle}>Escolha uma data</Text>
          <Text style={styles.promptSubtitle}>
            Os horários disponíveis serão exibidos na próxima tela
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F5F7FA' },
  // paddingTop reduzido para subir o calendário
  scroll: { padding: 12, paddingTop: 4, paddingBottom: 32 },

  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginTop: 2,
    marginBottom: 2,
  },
  screenSubtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 12,
    lineHeight: 18,
  },

  // ── Calendário ──────────────────────────────────────────────────────────────
  calendarCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
  weekLabelCell: { width: DAY_SIZE, alignItems: 'center' },
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
  dayCellToday: {
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
    padding: 24,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  promptTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#AAAAAA',
    marginTop: 12,
  },
  promptSubtitle: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});

export default SelecaoHorarioScreen;

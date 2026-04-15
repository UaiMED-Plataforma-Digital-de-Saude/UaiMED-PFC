import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  medico: string;
  especialidade?: string;
  data: string;
  onPress?: () => void;
}

const NextAppointmentCard: React.FC<Props> = ({ medico, especialidade, data, onPress }) => {
  const date = new Date(data);
  const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.avatarPlaceholder}>
        <Ionicons name="calendar" size={24} color="#4CAF50" />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.nameRow}>
          <Text style={styles.medico} numberOfLines={1}>{medico}</Text>
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>{dateStr}</Text>
          </View>
        </View>

        <Text style={styles.especialidade} numberOfLines={1}>
          {especialidade || 'Consulta Agendada'}
        </Text>

        <View style={styles.footerRow}>
          <Ionicons name="time-outline" size={12} color="#666" />
          <Text style={styles.timeText}>{timeStr}</Text>
          <Text style={styles.infoText}> • Confirmado</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 8,
    marginRight: 12,
    width: 280, // Padronizado com os outros carrosséis
    height: 80, // Padronizado com os outros carrosséis
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardBody: { flex: 1, justifyContent: 'center' },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  medico: { fontSize: 14, fontWeight: '700', color: '#333', flex: 1 },
  dateBadge: { backgroundColor: '#F0F0F0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  dateText: { fontSize: 10, fontWeight: '700', color: '#666' },
  especialidade: { fontSize: 12, color: '#666', marginTop: 2 },
  footerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  timeText: { fontSize: 11, color: '#666', marginLeft: 4, fontWeight: '500' },
  infoText: { fontSize: 11, color: '#4CAF50', fontWeight: '600' },
});

export default NextAppointmentCard;

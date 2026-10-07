import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const InfoRow: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  last?: boolean;
  onPress?: () => void;
}> = ({ icon, label, value, last, onPress }) => {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      style={[s.row, last && { borderBottomWidth: 0, paddingBottom: 0 }]}
      {...(onPress ? { onPress, activeOpacity: 0.7 } : {})}
    >
      <View style={s.iconBox}>
        <Ionicons name={icon} size={16} color="#4CAF50" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.label}>{label}</Text>
        <Text style={s.value}>{value}</Text>
      </View>
      {onPress && <Ionicons name="chevron-forward" size={16} color="#CCC" />}
    </Wrapper>
  );
};

const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={s.card}>
    <Text style={s.cardTitle}>{title}</Text>
    {children}
  </View>
);

export const infoCardStyles = {
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  } as const,
};

const s = StyleSheet.create({
  card: infoCardStyles.card,
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 12, letterSpacing: 0.1 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#F3F3F3',
  },
  iconBox: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  label: { fontSize: 10, color: '#BBB', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  value: { fontSize: 13, color: '#2A2A2A', fontWeight: '500', marginTop: 1 },
});

export default InfoCard;

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface StatItem {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
  onPress?: () => void;
}

const StatsRow: React.FC<{ stats: StatItem[] }> = ({ stats }) => (
  <View style={s.row}>
    {stats.map((stat, i) => {
      const Wrapper = stat.onPress ? TouchableOpacity : View;
      return (
        <Wrapper
          key={stat.label}
          style={[s.card, i < stats.length - 1 && { borderRightWidth: 1, borderRightColor: '#F0F0F0' }]}
          {...(stat.onPress ? { onPress: stat.onPress, activeOpacity: 0.7 } : {})}
        >
          <View style={[s.icon, { backgroundColor: stat.iconBg }]}>
            <Ionicons name={stat.icon} size={18} color={stat.iconColor} />
          </View>
          <Text style={s.val}>{stat.value}</Text>
          <Text style={s.lbl}>{stat.label}</Text>
        </Wrapper>
      );
    })}
  </View>
);

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  card: { flex: 1, alignItems: 'center', paddingVertical: 14, gap: 6 },
  icon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  val: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  lbl: { fontSize: 11, color: '#999', fontWeight: '500' },
});

export default StatsRow;

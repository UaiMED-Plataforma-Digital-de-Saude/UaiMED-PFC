import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileFooterProps {
  secondaryIcon: keyof typeof Ionicons.glyphMap;
  secondaryLabel: string;
  secondaryLoading?: boolean;
  onSecondaryPress: () => void;
  primaryIcon: keyof typeof Ionicons.glyphMap;
  primaryLabel: string;
  onPrimaryPress: () => void;
  primaryColor: string;
}

const ProfileFooter: React.FC<ProfileFooterProps> = ({
  secondaryIcon, secondaryLabel, secondaryLoading, onSecondaryPress,
  primaryIcon, primaryLabel, onPrimaryPress, primaryColor,
}) => (
  <View style={s.footer}>
    <TouchableOpacity
      style={[s.btnSecundario, secondaryLoading && { opacity: 0.65 }]}
      onPress={onSecondaryPress}
      disabled={secondaryLoading}
      activeOpacity={0.85}
    >
      {secondaryLoading
        ? <ActivityIndicator size="small" color="#4CAF50" />
        : <Ionicons name={secondaryIcon} size={18} color="#4CAF50" />}
      <Text style={s.btnSecundarioTxt}>{secondaryLabel}</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[s.btnPrimario, { backgroundColor: primaryColor, shadowColor: primaryColor }]}
      onPress={onPrimaryPress}
      activeOpacity={0.85}
    >
      <Ionicons name={primaryIcon} size={18} color="#FFF" />
      <Text style={s.btnPrimarioTxt}>{primaryLabel}</Text>
    </TouchableOpacity>
  </View>
);

const s = StyleSheet.create({
  footer: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 26 : 10,
    backgroundColor: '#FFF',
    borderTopWidth: 1, borderTopColor: '#EBEBEB',
    elevation: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.07, shadowRadius: 6,
  },
  btnSecundario: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1.5, borderColor: '#4CAF50', borderRadius: 12, paddingVertical: 13,
    backgroundColor: '#F1FBF1',
  },
  btnSecundarioTxt: { fontSize: 14, fontWeight: '700', color: '#4CAF50' },
  btnPrimario: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderRadius: 12, paddingVertical: 13,
    elevation: 2, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 5,
  },
  btnPrimarioTxt: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});

export default ProfileFooter;

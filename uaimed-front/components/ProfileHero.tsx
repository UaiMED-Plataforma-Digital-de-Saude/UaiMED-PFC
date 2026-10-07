import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileHeroProps {
  color: string;
  shadowColor: string;
  onBack: () => void;
  avatarUri?: string | null;
  iniciais: string;
  avatarBorderRadius?: number;
  nome: string;
  children?: React.ReactNode;
}

const ProfileHero: React.FC<ProfileHeroProps> = ({
  color, shadowColor, onBack, avatarUri, iniciais, avatarBorderRadius = 25, nome, children,
}) => (
  <View style={[s.hero, { backgroundColor: color, shadowColor }]}>
    <View style={s.heroRow}>
      <TouchableOpacity style={s.backBtn} onPress={onBack} activeOpacity={0.8}>
        <Ionicons name="arrow-back" size={20} color="#FFF" />
      </TouchableOpacity>
      <View style={[s.avatarRing, { borderRadius: avatarBorderRadius }]}>
        {avatarUri
          ? <Image source={{ uri: avatarUri }} style={[s.avatarImg, { borderRadius: avatarBorderRadius }]} />
          : <Text style={s.avatarTxt}>{iniciais}</Text>}
      </View>
      <View style={s.heroInfo}>
        <Text style={s.heroNome} numberOfLines={1}>{nome}</Text>
        {children}
      </View>
    </View>
  </View>
);

// Estilos da linha de "badge" (especialidade/localização + rating), compostos
// pelas telas que usam o Hero — o conteúdo varia, o visual não.
export const heroBadgeStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3, flexWrap: 'wrap' },
  text: { fontSize: 12, color: '#C8E6C9', fontWeight: '500' },
  dot: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  extraText: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
});

const s = StyleSheet.create({
  hero: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? 4 : 0,
    paddingBottom: 12,
    gap: 10,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarRing: {
    width: 50, height: 50,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarImg: { width: 50, height: 50 },
  avatarTxt: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  heroInfo: { flex: 1 },
  heroNome: { fontSize: 15, fontWeight: '800', color: '#FFF', letterSpacing: 0.1 },
});

export default ProfileHero;

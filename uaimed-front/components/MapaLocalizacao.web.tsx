import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// react-native-maps não roda na web; aqui só indicamos que o mapa
// está disponível e o usuário pode abrir no Google Maps (botão do card pai).
const MapaLocalizacao: React.FC<{ latitude: number; longitude: number }> = () => (
  <View style={s.placeholder}>
    <Ionicons name="map-outline" size={28} color="#AAA" />
    <Text style={s.txt}>Mapa disponível no app mobile</Text>
  </View>
);

const s = StyleSheet.create({
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  txt: { fontSize: 12, color: '#AAA' },
});

export default MapaLocalizacao;

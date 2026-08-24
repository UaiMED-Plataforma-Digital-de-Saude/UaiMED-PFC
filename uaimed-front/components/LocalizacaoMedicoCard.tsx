import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapaLocalizacao from './MapaLocalizacao';

interface LocalizacaoMedicoCardProps {
  latitude: number;
  longitude: number;
  distanciaKm: number | null;
  onAbrirMapa: () => void;
  titulo?: string;
}

const LocalizacaoMedicoCard: React.FC<LocalizacaoMedicoCardProps> = ({
  latitude, longitude, distanciaKm, onAbrirMapa, titulo = 'Localização da Consulta',
}) => (
  <View style={s.card}>
    <Text style={s.cardTitle}>{titulo}</Text>

    <View style={s.mapWrap}>
      <MapaLocalizacao latitude={latitude} longitude={longitude} />
    </View>

    <View style={s.footerRow}>
      {distanciaKm != null && (
        <View style={s.distanciaBox}>
          <Ionicons name="navigate-outline" size={14} color="#4CAF50" />
          <Text style={s.distanciaTxt}>~{distanciaKm.toFixed(1)} km de você</Text>
        </View>
      )}
      <TouchableOpacity style={s.mapBtn} onPress={onAbrirMapa} activeOpacity={0.85}>
        <Ionicons name="map-outline" size={15} color="#4CAF50" />
        <Text style={s.mapBtnTxt}>Abrir no mapa</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const s = StyleSheet.create({
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
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 12, letterSpacing: 0.1 },
  mapWrap: {
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: '#EEE',
  },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  distanciaBox: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  distanciaTxt: { fontSize: 12, color: '#555', fontWeight: '600' },
  mapBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1.5, borderColor: '#4CAF50', borderRadius: 10,
    paddingVertical: 7, paddingHorizontal: 12, marginLeft: 'auto',
  },
  mapBtnTxt: { fontSize: 12, fontWeight: '700', color: '#4CAF50' },
});

export default LocalizacaoMedicoCard;

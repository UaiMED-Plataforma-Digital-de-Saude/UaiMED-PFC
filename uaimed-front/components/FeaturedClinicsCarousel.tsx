import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CARD_WIDTH = 280;

const MOCK_CLINICS = [
  { id: 'c1', nome: 'Hospital Santa Casa', endereco: 'Belo Horizonte, MG', nota: 4.8 },
  { id: 'c2', nome: 'Clínica Life Care', endereco: 'São Paulo, SP', nota: 4.9 },
  { id: 'c3', nome: 'Centro Médico Uai', endereco: 'Rio de Janeiro, RJ', nota: 4.7 },
  { id: 'c4', nome: 'Cura & Saúde', endereco: 'Curitiba, PR', nota: 4.6 },
];

const ClinicCard: React.FC<{ item: any }> = ({ item }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {}}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="business" size={28} color="#4CAF50" />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{item.nome}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#FFB800" />
            <Text style={styles.ratingText}>{item.nota.toFixed(1)}</Text>
          </View>
        </View>
        <Text style={styles.address} numberOfLines={1}>{item.endereco}</Text>

        <View style={styles.footerRow}>
          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle-outline" size={12} color="#4CAF50" />
            <Text style={styles.statusText}>Aberta agora</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const FeaturedClinicsCarousel: React.FC = () => {
  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_CLINICS}
        keyExtractor={(i) => i.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <ClinicCard item={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 0, marginBottom: 8 },
  list: { paddingLeft: 6, paddingRight: 12 },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    flexDirection: 'row',
    alignItems: 'center',
    height: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F1F8E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardBody: { flex: 1, justifyContent: 'center' },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 14, fontWeight: '700', color: '#333', flex: 1 },
  address: { fontSize: 12, color: '#666', marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { marginLeft: 4, fontWeight: '600', color: '#333', fontSize: 12 },
  footerRow: { marginTop: 4, flexDirection: 'row', alignItems: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusText: { color: '#4CAF50', fontWeight: '600', fontSize: 11 },
});

export default FeaturedClinicsCarousel;

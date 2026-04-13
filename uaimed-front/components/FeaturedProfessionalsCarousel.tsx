import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAvaliacoes } from '../hooks/useAvaliacoes';
import uaiMedApi from '../api/uaiMedApi';

const CARD_WIDTH = 280;

const ProfessionalCard: React.FC<{ item: any; onContact: (id: string) => void }> = ({ item, onContact }) => {
  // Usa o hook para carregar a nota média do profissional
  const { notaMedia, loading } = useAvaliacoes(item.id);

  const displayNota = notaMedia || 0;
  
  // Suporta tanto 'imagem' (dados de exemplo) quanto 'avatar' (dados do backend via /medicos)
  const imageUrl = item.imagem || item.avatar;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onContact(item.id)}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={28} color="#FFF" />
        </View>
      )}

      <View style={styles.cardBody}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{item.nome}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#FFB800" />
            <Text style={styles.ratingText}>{displayNota.toFixed(1)}</Text>
          </View>
        </View>
        <Text style={styles.specialty} numberOfLines={1}>{item.especialidade}</Text>

        <View style={styles.footerRow}>
          <View style={styles.contactBadge}>
            <Ionicons name="chatbubble-ellipses-outline" size={12} color="#4CAF50" />
            <Text style={styles.contactText}>Ver Perfil</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};



interface FeaturedProps {
  /** Filtrar carrossel por estado (UF, ex: 'MG') */
  estado?: string;
  /** Filtrar carrossel por cidade */
  cidade?: string;
}

const FeaturedProfessionalsCarousel: React.FC<FeaturedProps> = ({ estado, cidade }) => {
  const navigation = useNavigation<any>();
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (estado) params.estado = estado;
        if (cidade) params.cidade = cidade;

        const res = await uaiMedApi.get('/medicos/recomendados', { params });
        if (mounted) setProfissionais(res.data);
      } catch (e) {
        setProfissionais([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, [estado, cidade]);

  const handleContact = (medicoId: string) => {
    navigation.navigate('Agendamentos', { screen: 'ContatoProfissional', params: { medicoId } });
  };

  const renderItem = ({ item }: any) => (
    <ProfessionalCard item={item} onContact={handleContact} />
  );

  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator /> : (
        <FlatList
          data={profissionais}
          keyExtractor={(i) => i.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 0, marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 8, marginLeft: 4 },
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
    height: 80, // Altura reduzida conforme solicitado
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: { flex: 1, justifyContent: 'center' },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 14, fontWeight: '700', color: '#333', flex: 1 },
  specialty: { fontSize: 12, color: '#666', marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { marginLeft: 4, fontWeight: '600', color: '#333', fontSize: 12 },
  footerRow: { marginTop: 4, flexDirection: 'row', alignItems: 'center' },
  contactBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  contactText: { color: '#4CAF50', fontWeight: '600', fontSize: 11 },
});

export default FeaturedProfessionalsCarousel;

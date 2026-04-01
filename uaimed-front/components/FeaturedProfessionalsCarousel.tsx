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

const { width } = Dimensions.get('window');

const CARD_WIDTH = Math.min(320, width * 0.78);


const ProfessionalCard: React.FC<{ item: any; onContact: (id: string) => void }> = ({ item, onContact }) => {
  // Usa o hook para carregar a nota média do profissional
  const { notaMedia, loading } = useAvaliacoes(item.id);

  const displayNota = notaMedia || 0;
  
  // Suporta tanto 'imagem' (dados de exemplo) quanto 'avatar' (dados do backend via /medicos)
  const imageUrl = item.imagem || item.avatar;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => Alert.alert(item.nome, `${item.especialidade} — Avaliação ${displayNota.toFixed(1)}`)}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={36} color="#FFF" />
        </View>
      )}

      <View style={styles.cardBody}>
        <Text style={styles.name}>{item.nome}</Text>
        <Text style={styles.specialty}>{item.especialidade}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#FFB800" />
          {loading ? (
            <ActivityIndicator size="small" color="#FFB800" style={{ marginLeft: 6 }} />
          ) : (
            <Text style={styles.ratingText}>{displayNota.toFixed(1)}</Text>
          )}
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => onContact(item.id)}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={16} color="#4CAF50" />
            <Text style={styles.contactText}>Contato</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};



const FeaturedProfessionalsCarousel: React.FC = () => {
  const navigation = useNavigation<any>();
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await uaiMedApi.get('/medicos/recomendados');
        if (mounted) setProfissionais(res.data);
      } catch (e) {
        setProfissionais([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, []);

  const handleContact = (medicoId: string) => {
    navigation.navigate('Agendamentos', { screen: 'ContatoProfissional', params: { medicoId } });
  };

  const renderItem = ({ item }: any) => (
    <ProfessionalCard item={item} onContact={handleContact} />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profissionais em destaque</Text>
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
  container: { marginVertical: 12 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 8, marginLeft: 4 },
  list: { paddingLeft: 6, paddingRight: 12 },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: { width: 64, height: 64, borderRadius: 32, marginRight: 12 },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: '#333' },
  specialty: { fontSize: 13, color: '#666', marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  ratingText: { marginLeft: 6, fontWeight: '600', color: '#333' },
  actionsRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center' },
  contactButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E8F5E9', backgroundColor: '#F6FFF6' },
  contactText: { marginLeft: 6, color: '#4CAF50', fontWeight: '600' },
});

export default FeaturedProfessionalsCarousel;

import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import uaiMedApi from '../../api/uaiMedApi';

interface AvaliacaoRecebida {
  id: string;
  nota: number;
  comentario: string | null;
  criado_em: string;
  usuario: { id: string; nome: string; avatar: string | null };
}

interface AvaliacoesResponse {
  notaMedia: number;
  totalAvaliacoes: number;
  avaliacoes: AvaliacaoRecebida[];
}

const Estrelas: React.FC<{ nota: number; size?: number }> = ({ nota, size = 17 }) => (
  <View style={styles.stars}>
    {[1, 2, 3, 4, 5].map((estrela) => (
      <Ionicons key={estrela} name={estrela <= nota ? 'star' : 'star-outline'}
        size={size} color="#F5A623" />
    ))}
  </View>
);

const MedicoAvaliacoesScreen: React.FC = () => {
  const [dados, setDados] = useState<AvaliacoesResponse>({
    notaMedia: 0, totalAvaliacoes: 0, avaliacoes: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await uaiMedApi.get<AvaliacoesResponse>('/professionals/me/avaliacoes');
      setDados(res.data);
      setErro(null);
    } catch (e: any) {
      setErro(e?.response?.data?.error || 'Não foi possível carregar suas avaliações.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    carregar();
  }, [carregar]));

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Carregando avaliações...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={dados.avaliacoes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={dados.avaliacoes.length ? styles.list : styles.emptyList}
        refreshControl={<RefreshControl refreshing={refreshing}
          onRefresh={() => carregar(true)} colors={['#2E7D32']} />}
        ListHeaderComponent={(
          <View>
            <View style={styles.summary}>
              <View style={styles.scoreCircle}>
                <Text style={styles.score}>{dados.notaMedia.toFixed(1)}</Text>
              </View>
              <View style={styles.summaryContent}>
                <Text style={styles.summaryTitle}>Sua avaliação média</Text>
                <Estrelas nota={Math.round(dados.notaMedia)} size={19} />
                <Text style={styles.summaryCount}>
                  {dados.totalAvaliacoes} {dados.totalAvaliacoes === 1 ? 'avaliação recebida' : 'avaliações recebidas'}
                </Text>
              </View>
            </View>
            {erro ? <Text style={styles.errorText}>{erro}</Text> : null}
            {dados.avaliacoes.length ? <Text style={styles.sectionTitle}>Feedback dos pacientes</Text> : null}
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.usuario.nome.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{item.usuario.nome}</Text>
                <Text style={styles.date}>
                  {new Date(item.criado_em).toLocaleDateString('pt-BR', {
                    day: '2-digit', month: 'long', year: 'numeric',
                  })}
                </Text>
              </View>
              <View style={styles.noteBadge}>
                <Ionicons name="star" size={14} color="#F5A623" />
                <Text style={styles.noteText}>{item.nota.toFixed(1)}</Text>
              </View>
            </View>
            <Estrelas nota={item.nota} />
            {item.comentario ? (
              <Text style={styles.comment}>“{item.comentario}”</Text>
            ) : (
              <Text style={styles.noComment}>Paciente não deixou comentário.</Text>
            )}
          </View>
        )}
        ListEmptyComponent={(
          <View style={styles.empty}>
            <Ionicons name="star-outline" size={56} color="#D3D7D3" />
            <Text style={styles.emptyTitle}>Nenhuma avaliação recebida</Text>
            <Text style={styles.emptySubtitle}>Os feedbacks dos pacientes aparecerão aqui.</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8F6' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#777', fontSize: 14, marginTop: 10 },
  list: { padding: 16, paddingBottom: 36 },
  emptyList: { flexGrow: 1, padding: 16 },
  summary: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#E7EAE7' },
  scoreCircle: { width: 70, height: 70, borderRadius: 35, alignItems: 'center',
    justifyContent: 'center', backgroundColor: '#FFF8E7' },
  score: { color: '#D88900', fontSize: 27, fontWeight: '900' },
  summaryContent: { flex: 1, marginLeft: 15 },
  summaryTitle: { color: '#292929', fontSize: 16, fontWeight: '800', marginBottom: 6 },
  summaryCount: { color: '#858585', fontSize: 12, marginTop: 6 },
  stars: { flexDirection: 'row', gap: 3 },
  errorText: { color: '#C62828', fontSize: 13, marginTop: 12 },
  sectionTitle: { color: '#292929', fontSize: 17, fontWeight: '800', marginTop: 22, marginBottom: 11 },
  card: { backgroundColor: '#FFF', borderRadius: 14, padding: 15, marginBottom: 12,
    borderWidth: 1, borderColor: '#E7EAE7' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center',
    justifyContent: 'center', backgroundColor: '#E8F5E9' },
  avatarText: { color: '#2E7D32', fontSize: 17, fontWeight: '800' },
  patientInfo: { flex: 1, marginHorizontal: 11 },
  patientName: { color: '#292929', fontSize: 14, fontWeight: '700' },
  date: { color: '#929292', fontSize: 11, marginTop: 3 },
  noteBadge: { flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FFF8E7', borderRadius: 8, paddingHorizontal: 9, paddingVertical: 6 },
  noteText: { color: '#C77D00', fontSize: 13, fontWeight: '800' },
  comment: { color: '#505050', fontSize: 14, lineHeight: 21, marginTop: 12 },
  noComment: { color: '#A0A0A0', fontSize: 12, fontStyle: 'italic', marginTop: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  emptyTitle: { color: '#777', fontSize: 17, fontWeight: '700', marginTop: 13 },
  emptySubtitle: { color: '#A0A0A0', fontSize: 13, marginTop: 6, textAlign: 'center' },
});

export default MedicoAvaliacoesScreen;

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AgendamentoStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import uaiMedApi from '../../api/uaiMedApi';

type Props = StackScreenProps<AgendamentoStackParamList, 'Resultados'>;

const ResultadosScreen: React.FC<Props> = ({ route, navigation }) => {
  const { query, especialidade, cidade, estado } = route.params ?? {};
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);

  /** Label da localização ativa */
  const locationLabel = cidade && estado
    ? `${cidade}, ${estado}`
    : cidade || estado || null;

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (query) params.query = query;
        if (especialidade) params.especialidade = especialidade;
        if (estado) params.estado = estado;
        if (cidade) params.cidade = cidade;

        const res = await uaiMedApi.get('/medicos', { params });
        setResults(res.data);
      } catch (e) {
        console.warn('Falha ao buscar resultados no backend, usando dados simulados', e);
        setResults([
          { id: 'med-001', nome: 'Dr. João Silva', especialidade: especialidade || 'Cardiologia', cidade: cidade || '', estado: estado || '' },
          { id: 'med-002', nome: 'Dra. Ana Costa', especialidade: especialidade || 'Dermatologia', cidade: cidade || '', estado: estado || '' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, especialidade, cidade, estado]);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('DetalhesMedico', { medicoId: item.id })}
    >
      <View style={styles.cardBody}>
        <Text style={styles.name}>{item.nome}</Text>
        <Text style={styles.specialty}>{item.especialidade}</Text>
        {(item.cidade || item.estado) && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={13} color="#888" />
            <Text style={styles.locationText}>
              {[item.cidade, item.estado].filter(Boolean).join(', ')}
            </Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resultados</Text>

      {/* Badge de localização ativa */}
      {locationLabel && (
        <View style={styles.locationBadge}>
          <Ionicons name="location" size={14} color="#2E7D32" />
          <Text style={styles.locationBadgeText}>{locationLabel}</Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 30 }} />
      ) : results.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={48} color="#CCC" />
          <Text style={styles.emptyText}>Nenhum profissional encontrado</Text>
          <Text style={styles.emptySubText}>Tente remover ou alterar os filtros de localização</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginTop: 8, marginBottom: 10 },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 14,
  },
  locationBadgeText: { marginLeft: 5, fontSize: 13, color: '#2E7D32', fontWeight: '600' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardBody: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: '#222' },
  specialty: { fontSize: 14, color: '#666', marginTop: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locationText: { fontSize: 12, color: '#888', marginLeft: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#999', marginTop: 12 },
  emptySubText: { fontSize: 13, color: '#BBB', marginTop: 6, textAlign: 'center' },
});

export default ResultadosScreen;

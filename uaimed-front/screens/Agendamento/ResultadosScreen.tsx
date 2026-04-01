import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AgendamentoStackParamList } from '../../navigation/types';
import uaiMedApi from '../../api/uaiMedApi';

type Props = StackScreenProps<AgendamentoStackParamList, 'Resultados'>;

const ResultadosScreen: React.FC<Props> = ({ route, navigation }) => {
  const { query, especialidade } = route.params ?? {};
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        // Tenta buscar do backend, se falhar usa dados simulados
        const params: any = {};
        if (query) params.query = query;
        if (especialidade) params.especialidade = especialidade;

        const res = await uaiMedApi.get('/medicos', { params });
        setResults(res.data);
      } catch (e) {
        console.warn('Falha ao buscar resultados no backend, usando dados simulados', e);
        // Simulação simples
        setResults([
          { id: 'med-001', nome: 'Dr. João Silva', especialidade: especialidade || 'Cardiologia' },
          { id: 'med-002', nome: 'Dra. Ana Costa', especialidade: especialidade || 'Dermatologia' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, especialidade]);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('DetalhesMedico', { medicoId: item.id })}>
      <Text style={styles.name}>{item.nome}</Text>
      <Text style={styles.specialty}>{item.especialidade}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resultados</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 30 }} />
      ) : (
        <FlatList data={results} keyExtractor={(i) => i.id} renderItem={renderItem} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginTop: 8, marginBottom: 12 },
  card: { padding: 12, borderBottomWidth: 1, borderColor: '#EEE' },
  name: { fontSize: 16, fontWeight: '700' },
  specialty: { fontSize: 14, color: 'gray' },
});

export default ResultadosScreen;

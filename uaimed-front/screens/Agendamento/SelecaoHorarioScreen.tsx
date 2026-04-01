import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import uaiMedApi from '../../api/uaiMedApi';
import { StackScreenProps } from '@react-navigation/stack';
import { AgendamentoStackParamList } from '../../navigation/types';

type Props = StackScreenProps<AgendamentoStackParamList, 'SelecaoHorario'>;

const SelecaoHorarioScreen: React.FC<Props> = ({ route, navigation }) => {

  const { medicoId } = route.params ?? { medicoId: undefined };
  const [horarios, setHorarios] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await uaiMedApi.get('/agendamentos/sugestoes-horario', { params: { medicoId } });
        if (mounted) setHorarios(res.data);
      } catch (e) {
        setHorarios([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, [medicoId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecionar Horário</Text>
      {loading ? <ActivityIndicator /> : (
        horarios.length > 0 ? (
          <FlatList
            data={horarios}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Confirmacao', { horario: item })}>
                <Text style={styles.buttonText}>{new Date(item).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</Text>
              </TouchableOpacity>
            )}
          />
        ) : (
          <Text style={styles.paragraph}>Nenhum horário sugerido disponível.</Text>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFF' },
  title: { fontSize: 20, fontWeight: '700', marginTop: 8, marginBottom: 8 },
  paragraph: { fontSize: 14, color: '#333', marginBottom: 20 },
  button: { backgroundColor: '#4CAF50', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: '700' },
});

export default SelecaoHorarioScreen;

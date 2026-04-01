import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Alert } from 'react-native';
import uaiMedApi from '../../api/uaiMedApi';
import { StackScreenProps } from '@react-navigation/stack';
import { AgendamentoStackParamList } from '../../navigation/types';

type Props = StackScreenProps<AgendamentoStackParamList, 'SelecaoHorario'>;

const SelecaoHorarioScreen: React.FC<Props> = ({ route, navigation }) => {
  const { medicoId, amount } = route.params ?? {};
  const [horarios, setHorarios] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await uaiMedApi.get('/agendamentos/sugestoes-horario', { params: { medicoId } });
        if (mounted) setHorarios(res.data);
      } catch (e) {
        if (mounted) setHorarios([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, [medicoId]);

  const handleSelecionarHorario = async (horario: string) => {
    setConfirming(true);
    try {
      // Cria o agendamento na API e recebe o agendamentoId real
      const res = await uaiMedApi.post('/agendamentos', {
        medicoId,
        dataHora: horario,
      });
      const agendamentoId: string = res.data?.id ?? res.data?.agendamentoId;
      navigation.navigate('Confirmacao', {
        horario,
        medicoId: medicoId ?? '',
        agendamentoId,
        amount: amount ?? res.data?.valor ?? 0,
      });
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'Não foi possível criar o agendamento.';
      Alert.alert('Erro', msg);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecionar Horário</Text>
      {loading || confirming ? (
        <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 40 }} />
      ) : horarios.length > 0 ? (
        <FlatList
          data={horarios}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.button} onPress={() => handleSelecionarHorario(item)}>
              <Text style={styles.buttonText}>
                {new Date(item).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
              </Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.paragraph}>Nenhum horário disponível para esse médico.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFF' },
  title: { fontSize: 20, fontWeight: '700', marginTop: 8, marginBottom: 8 },
  paragraph: { fontSize: 14, color: '#333', marginBottom: 20 },
  button: { backgroundColor: '#4CAF50', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#FFF', fontWeight: '700' },
});

export default SelecaoHorarioScreen;

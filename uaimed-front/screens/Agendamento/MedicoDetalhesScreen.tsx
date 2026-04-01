import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AgendamentoStackParamList } from '../../navigation/types';

type Props = StackScreenProps<AgendamentoStackParamList, 'DetalhesMedico'>;

const MedicoDetalhesScreen: React.FC<Props> = ({ route, navigation }) => {
  const { medicoId } = route.params ?? { medicoId: undefined };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalhes do Médico</Text>
      <Text style={styles.label}>ID: {medicoId}</Text>
      <Text style={styles.paragraph}>Dados do médico serão exibidos aqui (nome, especialidade, local de atendimento, horários disponíveis, avaliações).</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SelecaoHorario', { medicoId: medicoId ?? '' })}>
        <Text style={styles.buttonText}>Escolher Horário</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFF' },
  title: { fontSize: 20, fontWeight: '700', marginTop: 8, marginBottom: 8 },
  label: { fontSize: 14, color: '#666', marginBottom: 6 },
  paragraph: { fontSize: 14, color: '#333', marginBottom: 20 },
  button: { backgroundColor: '#4CAF50', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: '700' },
});

export default MedicoDetalhesScreen;

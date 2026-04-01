import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AgendamentoStackParamList } from '../../navigation/types';

type Props = StackScreenProps<AgendamentoStackParamList, 'Confirmacao'>;

const ConfirmacaoScreen: React.FC<Props> = ({ route, navigation }) => {
  const { horario, medicoId, agendamentoId } = route.params ?? {};
  const dataFormatada = horario
    ? new Date(horario).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agendamento Confirmado ✅</Text>
      <Text style={styles.paragraph}>
        Seu agendamento foi confirmado com sucesso.
        {dataFormatada ? `\n\nData/hora: ${dataFormatada}` : ''}
        {'\n\nVocê receberá uma notificação com os detalhes.'}
      </Text>

      {agendamentoId && medicoId ? (
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Avaliacao', { agendamentoId, medicoId })}>
          <Text style={styles.buttonText}>Avaliar Consulta</Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity style={[styles.button, { backgroundColor: '#4B73B2', marginTop: 10 }]} onPress={() => navigation.navigate('Busca')}>
        <Text style={styles.buttonText}>Voltar ao Início</Text>
      </TouchableOpacity>
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

export default ConfirmacaoScreen;

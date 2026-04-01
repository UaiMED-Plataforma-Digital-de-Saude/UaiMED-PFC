import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { AgendamentoStackParamList } from '../../navigation/types';

type Props = StackScreenProps<AgendamentoStackParamList, 'Confirmacao'>;

const ConfirmacaoScreen: React.FC<Props> = ({ route, navigation }) => {
  const { horario, medicoId, agendamentoId, amount } = route.params ?? {};

  const dataFormatada = horario
    ? new Date(horario).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })
    : null;

  const valorConsulta = amount ?? 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Ícone de sucesso */}
      <View style={styles.iconWrapper}>
        <Ionicons name="checkmark-circle" size={72} color="#4CAF50" />
      </View>

      <Text style={styles.title}>Agendamento Confirmado!</Text>
      <Text style={styles.subtitle}>Seu horário foi reservado com sucesso.</Text>

      {/* Card com detalhes */}
      <View style={styles.card}>
        {dataFormatada && (
          <View style={styles.row}>
            <Ionicons name="calendar-outline" size={20} color="#4B73B2" />
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Data e Hora</Text>
              <Text style={styles.rowValue}>{dataFormatada}</Text>
            </View>
          </View>
        )}

        {agendamentoId && (
          <View style={styles.row}>
            <Ionicons name="receipt-outline" size={20} color="#4B73B2" />
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Nº do Agendamento</Text>
              <Text style={styles.rowValue}>{agendamentoId}</Text>
            </View>
          </View>
        )}

        <View style={styles.row}>
          <Ionicons name="cash-outline" size={20} color="#4B73B2" />
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Valor da Consulta</Text>
            <Text style={styles.rowValue}>R$ {valorConsulta.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Ionicons name="notifications-outline" size={20} color="#4B73B2" />
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Notificação</Text>
            <Text style={styles.rowValue}>Você receberá um aviso antes da consulta</Text>
          </View>
        </View>
      </View>

      {/* Botão principal: Ir para Pagamento */}
      {agendamentoId && medicoId ? (
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={() =>
            navigation.navigate('Pagamento', {
              amount: valorConsulta,
              agendamentoId,
              medicoId,
            })
          }
        >
          <Ionicons name="card-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.buttonPrimaryText}>Ir para Pagamento</Text>
        </TouchableOpacity>
      ) : null}

      {/* Botão secundário: Voltar ao Início */}
      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() => navigation.navigate('Busca')}
      >
        <Text style={styles.buttonSecondaryText}>Voltar ao Início</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#FFF', alignItems: 'center' },
  iconWrapper: { marginTop: 24, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#222', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#777', marginTop: 6, marginBottom: 24, textAlign: 'center' },
  card: {
    width: '100%',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    padding: 16,
    marginBottom: 24,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  rowText: { marginLeft: 12, flex: 1 },
  rowLabel: { fontSize: 12, color: '#999', fontWeight: '500' },
  rowValue: { fontSize: 15, fontWeight: '600', color: '#222', marginTop: 2 },
  buttonPrimary: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonPrimaryText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  buttonSecondary: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  buttonSecondaryText: { color: '#666', fontWeight: '600', fontSize: 15 },
});

export default ConfirmacaoScreen;

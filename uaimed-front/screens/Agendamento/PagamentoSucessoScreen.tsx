import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { AgendamentoStackParamList } from '../../navigation/types';

type Props = StackScreenProps<AgendamentoStackParamList, 'PagamentoSucesso'>;

const METODO_LABEL: Record<string, string> = {
  pix: 'Pix',
  card: 'Cartão de crédito',
  boleto: 'Boleto bancário',
};

const formatarMoeda = (valor: number) => `R$ ${valor.toFixed(2)}`;

const PagamentoSucessoScreen: React.FC<Props> = ({ route, navigation }) => {
  const { pagamentoId, valor, desconto, descontoPlano, valorFinal, metodo, agendamentoId, medicoId, nomeProfissional } = route.params ?? {
    pagamentoId: '', valor: 0, desconto: 0, descontoPlano: 0, valorFinal: 0, metodo: 'pix' as const,
  };

  const metodoLabel = METODO_LABEL[metodo] ?? metodo;

  const handleCompartilhar = async () => {
    const linhas = [
      'Comprovante de pagamento — UaiMED',
      nomeProfissional ? `Profissional: ${nomeProfissional}` : null,
      `Valor cobrado: ${formatarMoeda(valor)}`,
      desconto > 0 ? `Desconto de cupom: ${formatarMoeda(desconto)}` : null,
      descontoPlano > 0 ? `Desconto de plano de saúde: ${formatarMoeda(descontoPlano)}` : null,
      `Valor pago: ${formatarMoeda(valorFinal)}`,
      `Método: ${metodoLabel}`,
      `ID do pagamento: ${pagamentoId}`,
    ].filter(Boolean);

    await Share.share({ message: linhas.join('\n'), title: 'Comprovante de pagamento' });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.iconWrapper}>
        <Ionicons name="checkmark-circle" size={72} color="#4CAF50" />
      </View>

      <Text style={styles.title}>Pagamento Confirmado!</Text>
      <Text style={styles.subtitle}>Seu comprovante também foi enviado por e-mail.</Text>

      <View style={styles.card}>
        {nomeProfissional && (
          <View style={styles.row}>
            <Ionicons name="person-outline" size={20} color="#4B73B2" />
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Profissional</Text>
              <Text style={styles.rowValue}>{nomeProfissional}</Text>
            </View>
          </View>
        )}

        <View style={styles.row}>
          <Ionicons name="pricetag-outline" size={20} color="#4B73B2" />
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Valor cobrado</Text>
            <Text style={styles.rowValue}>{formatarMoeda(valor)}</Text>
          </View>
        </View>

        {desconto > 0 && (
          <View style={styles.row}>
            <Ionicons name="pricetags-outline" size={20} color="#4B73B2" />
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Desconto de cupom</Text>
              <Text style={styles.rowValue}>- {formatarMoeda(desconto)}</Text>
            </View>
          </View>
        )}

        {descontoPlano > 0 && (
          <View style={styles.row}>
            <Ionicons name="medkit-outline" size={20} color="#4B73B2" />
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Desconto de plano de saúde</Text>
              <Text style={styles.rowValue}>- {formatarMoeda(descontoPlano)}</Text>
            </View>
          </View>
        )}

        <View style={styles.row}>
          <Ionicons name="cash-outline" size={20} color="#4B73B2" />
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Valor pago</Text>
            <Text style={styles.rowValue}>{formatarMoeda(valorFinal)}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Ionicons name="card-outline" size={20} color="#4B73B2" />
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Método</Text>
            <Text style={styles.rowValue}>{metodoLabel}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Ionicons name="receipt-outline" size={20} color="#4B73B2" />
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Nº do Pagamento</Text>
            <Text style={styles.rowValue}>{pagamentoId}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.buttonPrimary} onPress={handleCompartilhar}>
        <Ionicons name="share-social-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
        <Text style={styles.buttonPrimaryText}>Compartilhar Comprovante</Text>
      </TouchableOpacity>

      {agendamentoId && medicoId ? (
        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => navigation.navigate('Avaliacao', { agendamentoId, medicoId })}
        >
          <Text style={styles.buttonSecondaryText}>Avaliar Consulta</Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() => navigation.getParent<any>()?.navigate('Home')}
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
    marginBottom: 12,
  },
  buttonSecondaryText: { color: '#666', fontWeight: '600', fontSize: 15 },
});

export default PagamentoSucessoScreen;

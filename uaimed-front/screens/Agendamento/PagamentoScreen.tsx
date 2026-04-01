import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AgendamentoStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { usePayments } from '../../hooks/usePayments';

type Props = StackScreenProps<AgendamentoStackParamList, 'Pagamento'>;

const PagamentoScreen: React.FC<Props> = ({ route, navigation }) => {
  const amount = route.params?.amount ?? 0;
  const { processarPagamento, loading, validarCupom, calcularValorFinal } = usePayments();
  
  const [method, setMethod] = useState<'pix' | 'card' | 'cash'>('pix');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [usingPlan, setUsingPlan] = useState(false);
  const [promo, setPromo] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);

  const baseAmount = amount || 100;
  const finalAmount = calcularValorFinal(baseAmount, usingPlan, promoDiscount);

  const handleValidarCupom = async () => {
    if (!promo.trim()) {
      Alert.alert('Cupom vazio', 'Insira um código promocional.');
      return;
    }

    const desconto = await validarCupom(promo);
    if (desconto > 0) {
      setPromoDiscount(desconto);
      Alert.alert('Cupom válido', `Desconto de ${desconto}% aplicado!`);
    } else {
      setPromoDiscount(0);
      Alert.alert('Cupom inválido', 'Este código não é válido.');
    }
  };

  const handlePay = async () => {
    if (method === 'card') {
      if (!cardNumber || !cardName || !expiry || !cvv) {
        Alert.alert('Dados incompletos', 'Preencha todos os dados do cartão.');
        return;
      }
    }

    const resultado = await processarPagamento({
      method,
      amount: finalAmount,
      cardNumber,
      cardName,
      expiry,
      cvv,
      usingPlan,
      promoCode: promo,
      agendamentoId: (route.params as any)?.agendamentoId,
    });

    if (resultado) {
      Alert.alert('Pagamento realizado', `Valor cobrado: R$ ${resultado.amount.toFixed(2)}\nID: ${resultado.id}`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Erro', 'Falha no processamento do pagamento.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Pagamento</Text>
        <Text style={styles.subtitle}>Escolha a forma de pagamento e confirme.</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Valor</Text>
          <Text style={styles.amount}>R$ {baseAmount.toFixed(2)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Forma de Pagamento</Text>
          <View style={styles.methodsRow}>
            <TouchableOpacity style={[styles.method, method === 'pix' && styles.methodActive]} onPress={() => setMethod('pix')}>
              <Ionicons name="scan" size={22} color={method === 'pix' ? '#FFF' : '#4CAF50'} />
              <Text style={[styles.methodText, method === 'pix' && styles.methodTextActive]}>Pix</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.method, method === 'card' && styles.methodActive]} onPress={() => setMethod('card')}>
              <Ionicons name="card" size={22} color={method === 'card' ? '#FFF' : '#4CAF50'} />
              <Text style={[styles.methodText, method === 'card' && styles.methodTextActive]}>Cartão</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.method, method === 'cash' && styles.methodActive]} onPress={() => setMethod('cash')}>
              <Ionicons name="cash" size={22} color={method === 'cash' ? '#FFF' : '#4CAF50'} />
              <Text style={[styles.methodText, method === 'cash' && styles.methodTextActive]}>Dinheiro</Text>
            </TouchableOpacity>
          </View>
        </View>

        {method === 'card' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados do Cartão</Text>
            <TextInput style={styles.input} placeholder="Número do cartão" keyboardType="numeric" value={cardNumber} onChangeText={setCardNumber} />
            <TextInput style={styles.input} placeholder="Nome no cartão" value={cardName} onChangeText={setCardName} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="MM/AA" value={expiry} onChangeText={setExpiry} />
              <TextInput style={[styles.input, { width: 100 }]} placeholder="CVV" keyboardType="numeric" value={cvv} onChangeText={setCvv} />
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descontos</Text>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.small}>Plano de saúde</Text>
              <Text style={styles.muted}>Aplicar desconto automático do convênio (15%)</Text>
            </View>
            <TouchableOpacity style={[styles.toggle, usingPlan && styles.toggleOn]} onPress={() => setUsingPlan(!usingPlan)}>
              <Text style={{ color: usingPlan ? '#FFF' : '#4CAF50' }}>{usingPlan ? 'Ativado' : 'Ativar'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.small, { marginTop: 12 }]}>Cupom / Código Promocional</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Ex: UAIMED10" value={promo} onChangeText={setPromo} />
            <TouchableOpacity style={styles.applyButton} onPress={handleValidarCupom}>
              <Text style={{ color: '#FFF' }}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Total</Text>
          <Text style={styles.amount}>R$ {finalAmount.toFixed(2)}</Text>
        </View>

        <TouchableOpacity style={[styles.payButton, loading && { opacity: 0.6 }]} onPress={handlePay} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.payText}>Pagar R$ {finalAmount.toFixed(2)}</Text>}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginTop: 8, marginBottom: 6 },
  subtitle: { color: '#666', marginBottom: 12 },
  section: { marginBottom: 14 },
  sectionTitle: { fontWeight: '700', marginBottom: 8 },
  amount: { fontSize: 20, fontWeight: '700', color: '#4CAF50' },
  methodsRow: { flexDirection: 'row', gap: 8 },
  method: { flex: 1, borderWidth: 1, borderColor: '#EEE', padding: 12, borderRadius: 8, alignItems: 'center', backgroundColor: '#FFF' },
  methodActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  methodText: { marginTop: 6, color: '#4CAF50', fontWeight: '600' },
  methodTextActive: { color: '#FFF' },
  input: { borderWidth: 1, borderColor: '#EEE', borderRadius: 8, padding: 10, backgroundColor: '#FAFAFA', marginBottom: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  small: { fontSize: 13, fontWeight: '600' },
  muted: { color: '#777', fontSize: 12 },
  toggle: { borderWidth: 1, borderColor: '#4CAF50', padding: 8, borderRadius: 6 },
  toggleOn: { backgroundColor: '#4CAF50' },
  applyButton: { backgroundColor: '#4CAF50', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  payButton: { backgroundColor: '#4CAF50', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 18 },
  payText: { color: '#FFF', fontWeight: '700' },
});

export default PagamentoScreen;

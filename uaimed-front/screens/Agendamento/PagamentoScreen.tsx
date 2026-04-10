import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { AgendamentoStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { usePayments } from '../../hooks/usePayments';
import AppModal from '../../components/AppModal';
import { useModal } from '../../hooks/useModal';

type Props = StackScreenProps<AgendamentoStackParamList, 'Pagamento'>;

const PagamentoScreen: React.FC<Props> = ({ route, navigation }) => {
  const amount = route.params?.amount ?? 0;
  const agendamentoId = route.params?.agendamentoId;
  const medicoId = route.params?.medicoId;
  const { processarPagamento, loading, validarCupom, calcularValorFinal } = usePayments();
  
  const [method, setMethod] = useState<'pix' | 'card' | 'boleto'>('pix');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [usingPlan, setUsingPlan] = useState(false);
  const [promo, setPromo] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { modal, showModal, hideModal } = useModal();

  const baseAmount = amount || 100;
  const finalAmount = calcularValorFinal(baseAmount, usingPlan, promoDiscount);

  const handleValidarCupom = async () => {
    if (!promo.trim()) {
      showModal('Cupom vazio', 'Insira um código promocional.', { type: 'warning' });
      return;
    }
    const desconto = await validarCupom(promo);
    if (desconto > 0) {
      setPromoDiscount(desconto);
      showModal('Cupom válido!', `Desconto de ${desconto}% aplicado com sucesso.`, { type: 'success' });
    } else {
      setPromoDiscount(0);
      showModal('Cupom inválido', 'Este código promocional não é válido ou expirou.', { type: 'error' });
    }
  };

  const handlePay = () => {
    if (method === 'card') {
      if (!cardNumber || !cardName || !expiry || !cvv) {
        showModal('Dados incompletos', 'Preencha todos os dados do cartão antes de continuar.', { type: 'warning' });
        return;
      }
    }
    setShowConfirmModal(true);
  };

  const methodLabel: Record<string, string> = {
    pix: 'Pix',
    card: 'Cartão de crédito/débito',
    boleto: 'Boleto Bancário',
  };

  const methodIcon: Record<string, string> = {
    pix: 'scan',
    card: 'card',
    boleto: 'document-text-outline',
  };

  const processarPagamentoConfirmado = async () => {
    const resultado = await processarPagamento({
      method,
      amount: finalAmount,
      cardNumber,
      cardName,
      expiry,
      cvv,
      usingPlan,
      promoCode: promo,
      agendamentoId,
    });

    if (resultado) {
      showModal(
        'Pagamento realizado!',
        `Valor cobrado: R$ ${resultado.amount.toFixed(2)}\nID: ${resultado.id}`,
        {
          type: 'success',
            buttons: [
            {
              text: 'Avaliar Consulta',
              onPress: () => {
                if (agendamentoId && medicoId) {
                  navigation.navigate('Avaliacao', { agendamentoId, medicoId });
                } else {
                  navigation.getParent<any>()?.navigate('Home');
                }
              },
            },
            { text: 'Início', style: 'cancel', onPress: () => navigation.getParent<any>()?.navigate('Home') },
          ],
        },
      );
    } else {
      showModal('Falha no pagamento', 'Não foi possível processar o pagamento. Tente novamente.', { type: 'error' });
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
            <TouchableOpacity style={[styles.method, method === 'boleto' && styles.methodActive]} onPress={() => setMethod('boleto')}>
              <Ionicons name="document-text-outline" size={22} color={method === 'boleto' ? '#FFF' : '#4CAF50'} />
              <Text style={[styles.methodText, method === 'boleto' && styles.methodTextActive]}>Boleto</Text>
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

      {/* ── Modal de Confirmação de Pagamento ── */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowConfirmModal(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            {/* Ícone do método */}
            <View style={styles.modalIconWrapper}>
              <Ionicons name={methodIcon[method] as any} size={36} color="#4CAF50" />
            </View>

            <Text style={styles.modalTitle}>Confirmar Pagamento</Text>

            {/* Método */}
            <View style={styles.modalInfoRow}>
              <Ionicons name="card-outline" size={18} color="#4CAF50" />
              <Text style={styles.modalInfoLabel}>Método</Text>
              <Text style={styles.modalInfoValue}>{methodLabel[method]}</Text>
            </View>

            {/* Valor base */}
            <View style={styles.modalInfoRow}>
              <Ionicons name="cash-outline" size={18} color="#4CAF50" />
              <Text style={styles.modalInfoLabel}>Valor</Text>
              <Text style={styles.modalInfoValue}>R$ {baseAmount.toFixed(2)}</Text>
            </View>

            {/* Desconto se houver */}
            {finalAmount < baseAmount && (
              <View style={styles.modalInfoRow}>
                <Ionicons name="pricetag-outline" size={18} color="#4CAF50" />
                <Text style={styles.modalInfoLabel}>Desconto</Text>
                <Text style={[styles.modalInfoValue, { color: '#2E7D32' }]}>
                  - R$ {(baseAmount - finalAmount).toFixed(2)}
                </Text>
              </View>
            )}

            {/* Total */}
            <View style={[styles.modalInfoRow, styles.modalInfoRowTotal]}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
              <Text style={[styles.modalInfoLabel, { color: '#FFF' }]}>Total</Text>
              <Text style={[styles.modalInfoValue, styles.modalTotalValue]}>
                R$ {finalAmount.toFixed(2)}
              </Text>
            </View>

            <Text style={styles.modalHint}>
              Deseja confirmar este pagamento?
            </Text>

            {/* Botões */}
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => setShowConfirmModal(false)}
                activeOpacity={0.75}
              >
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtnConfirm, loading && { opacity: 0.7 }]}
                onPress={() => {
                  setShowConfirmModal(false);
                  processarPagamentoConfirmado();
                }}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="lock-closed-outline" size={16} color="#FFF" />
                    <Text style={styles.modalBtnConfirmText}>Pagar agora</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      <AppModal {...modal} onClose={hideModal} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginTop: 20, marginBottom: 6 },
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

  // ── Modal de confirmação ────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  modalIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  modalInfoRowTotal: {
    backgroundColor: '#4CAF50',
    marginTop: 4,
  },
  modalInfoLabel: {
    fontSize: 13,
    color: '#888',
    width: 64,
  },
  modalInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    flex: 1,
  },
  modalTotalValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  modalHint: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#DDD',
    alignItems: 'center',
  },
  modalBtnCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#888',
  },
  modalBtnConfirm: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  modalBtnConfirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default PagamentoScreen;

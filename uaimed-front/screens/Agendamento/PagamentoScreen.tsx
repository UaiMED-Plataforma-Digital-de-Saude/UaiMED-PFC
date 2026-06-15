import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Share,
  Platform,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { AgendamentoStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { usePayments } from '../../hooks/usePayments';
import AppModal from '../../components/AppModal';
import { useModal } from '../../hooks/useModal';
import QRCode from 'react-native-qrcode-svg';

type Props = StackScreenProps<AgendamentoStackParamList, 'Pagamento'>;

// ── Geração do payload PIX (formato EMV simplificado) ─────────────────────────
function gerarPayloadPix(pixKey: string, valor: number, nome: string): string {
  const valorStr = valor.toFixed(2);
  const nomeFormatado = nome.substring(0, 25).toUpperCase().padEnd(25, ' ').trim();
  const merchantKey = `0014br.gov.bcb.pix01${String(pixKey.length).padStart(2, '0')}${pixKey}`;
  const merchantInfo = `26${String(merchantKey.length).padStart(2, '0')}${merchantKey}`;
  const payload =
    `000201` +
    merchantInfo +
    `52040000` +
    `5303986` +
    `54${String(valorStr.length).padStart(2, '0')}${valorStr}` +
    `5802BR` +
    `59${String(nomeFormatado.length).padStart(2, '0')}${nomeFormatado}` +
    `6009BRASILIA` +
    `62070503***` +
    `6304`;
  return payload + 'ABCD'; // CRC simulado para demo
}

// ── Componente PIX ────────────────────────────────────────────────────────────
interface PixViewProps {
  valor: number;
  pixKey: string;
  nomeProfissional: string;
  onCopiado: () => void;
}

const PixView: React.FC<PixViewProps> = ({ valor, pixKey, nomeProfissional, onCopiado }) => {
  const [copiado, setCopiado] = useState(false);
  const [segundos, setSegundos] = useState(600); // 10 minutos
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const payload = useMemo(
    () => gerarPayloadPix(pixKey, valor, nomeProfissional),
    [pixKey, valor, nomeProfissional]
  );

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSegundos((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, []);

  const minutos = Math.floor(segundos / 60);
  const secs = segundos % 60;
  const timerStr = `${String(minutos).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const expirado = segundos === 0;

  const handleCopiar = () => {
    Clipboard.setString(pixKey);
    setCopiado(true);
    onCopiado();
    setTimeout(() => setCopiado(false), 3000);
  };

  const handleCompartilhar = async () => {
    await Share.share({
      message: `Chave PIX UaiMED:\n${pixKey}\n\nValor: R$ ${valor.toFixed(2)}\nBeneficiário: ${nomeProfissional}`,
      title: 'Pagamento via PIX',
    });
  };

  return (
    <View style={pixStyles.container}>
      {/* Cabeçalho */}
      <View style={pixStyles.header}>
        <View style={pixStyles.pixLogo}>
          <Ionicons name="scan-outline" size={20} color="#FFF" />
          <Text style={pixStyles.pixLogoText}>PIX</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={pixStyles.headerTitle}>Pagamento Instantâneo</Text>
          <Text style={pixStyles.headerSub}>Escaneie o QR Code ou copie a chave</Text>
        </View>
      </View>

      {/* Timer */}
      <View style={[pixStyles.timerRow, expirado && pixStyles.timerExpired]}>
        <Ionicons
          name={expirado ? 'close-circle-outline' : 'time-outline'}
          size={16}
          color={expirado ? '#D32F2F' : '#F57F17'}
        />
        <Text style={[pixStyles.timerText, expirado && pixStyles.timerTextExpired]}>
          {expirado ? 'QR Code expirado. Gere um novo.' : `Válido por ${timerStr}`}
        </Text>
      </View>

      {/* QR Code */}
      <View style={pixStyles.qrWrapper}>
        {expirado ? (
          <View style={pixStyles.qrExpired}>
            <Ionicons name="refresh-outline" size={40} color="#9E9E9E" />
            <Text style={pixStyles.qrExpiredText}>Expirado</Text>
          </View>
        ) : (
          <QRCode
            value={payload}
            size={200}
            color="#1B5E20"
            backgroundColor="#FFFFFF"
            logo={undefined}
          />
        )}
      </View>

      <Text style={pixStyles.qrNote}>
        Aponte a câmera do seu app bancário para o QR Code acima
      </Text>

      {/* Divisor */}
      <View style={pixStyles.divider}>
        <View style={pixStyles.dividerLine} />
        <Text style={pixStyles.dividerText}>ou use a chave PIX</Text>
        <View style={pixStyles.dividerLine} />
      </View>

      {/* Dados do beneficiário */}
      <View style={pixStyles.beneficiaryCard}>
        <View style={pixStyles.beneficiaryRow}>
          <Ionicons name="person-circle-outline" size={20} color="#4CAF50" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={pixStyles.beneficiaryLabel}>Beneficiário</Text>
            <Text style={pixStyles.beneficiaryValue}>{nomeProfissional}</Text>
          </View>
        </View>
        <View style={pixStyles.beneficiaryRow}>
          <Ionicons name="key-outline" size={20} color="#4CAF50" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={pixStyles.beneficiaryLabel}>Chave PIX</Text>
            <Text style={pixStyles.beneficiaryValue} selectable>{pixKey}</Text>
          </View>
        </View>
        <View style={pixStyles.beneficiaryRow}>
          <Ionicons name="cash-outline" size={20} color="#4CAF50" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={pixStyles.beneficiaryLabel}>Valor</Text>
            <Text style={[pixStyles.beneficiaryValue, { color: '#1B5E20', fontWeight: '800' }]}>
              R$ {valor.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Botões */}
      <TouchableOpacity
        style={[pixStyles.copyBtn, copiado && pixStyles.copyBtnSuccess]}
        onPress={handleCopiar}
        activeOpacity={0.8}
      >
        <Ionicons name={copiado ? 'checkmark-outline' : 'copy-outline'} size={18} color="#FFF" />
        <Text style={pixStyles.copyBtnText}>
          {copiado ? 'Chave copiada!' : 'Copiar Chave PIX'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={pixStyles.shareBtn} onPress={handleCompartilhar} activeOpacity={0.8}>
        <Ionicons name="share-social-outline" size={18} color="#4CAF50" />
        <Text style={pixStyles.shareBtnText}>Compartilhar dados PIX</Text>
      </TouchableOpacity>

      {/* Instruções */}
      <View style={pixStyles.instructions}>
        <Text style={pixStyles.instructionsTitle}>Como pagar via PIX</Text>
        <Text style={pixStyles.instructionsItem}>1. Abra o app do seu banco</Text>
        <Text style={pixStyles.instructionsItem}>2. Acesse a área PIX → Pagar</Text>
        <Text style={pixStyles.instructionsItem}>3. Escaneie o QR Code ou cole a chave PIX</Text>
        <Text style={pixStyles.instructionsItem}>4. Confirme o valor e pague</Text>
        <Text style={pixStyles.instructionsItem}>5. O pagamento é confirmado em instantes</Text>
      </View>
    </View>
  );
};
function gerarCodigoBoleto(valor: number): string {
  const rand = (n: number) => Math.floor(Math.random() * n).toString().padStart(n.toString().length, '0');
  const v = valor.toFixed(2).replace('.', '').padStart(10, '0');
  return `34191.${rand(99999)} ${rand(99999)}.${rand(999999)} ${rand(99999)}.${rand(999999)} ${rand(1)} 0001${v}`;
}

function gerarVencimento(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toLocaleDateString('pt-BR');
}

function gerarNossoNumero(): string {
  return Math.floor(Math.random() * 9000000000 + 1000000000).toString();
}

// ── Barras visuais do código de barras ────────────────────────────────────────
const BarcodeVisual: React.FC = () => {
  const bars = useMemo(() => {
    const arr: { width: number; isWhite: boolean }[] = [];
    for (let i = 0; i < 80; i++) {
      arr.push({ width: Math.random() > 0.5 ? 3 : 2, isWhite: i % 2 === 0 });
    }
    return arr;
  }, []);

  return (
    <View style={boletoStyles.barcodeContainer}>
      {bars.map((bar, i) => (
        <View
          key={i}
          style={[
            boletoStyles.bar,
            {
              width: bar.width,
              backgroundColor: bar.isWhite ? '#FFFFFF' : '#000000',
            },
          ]}
        />
      ))}
    </View>
  );
};

// ── Componente principal do Boleto ────────────────────────────────────────────
interface BoletoViewProps {
  valor: number;
  onCopiado: () => void;
}

const BoletoView: React.FC<BoletoViewProps> = ({ valor, onCopiado }) => {
  const codigo = useMemo(() => gerarCodigoBoleto(valor), [valor]);
  const vencimento = useMemo(() => gerarVencimento(), []);
  const nossoNumero = useMemo(() => gerarNossoNumero(), []);
  const dataEmissao = new Date().toLocaleDateString('pt-BR');

  const handleCopiar = async () => {
    try {
      await Share.share({
        message: `Linha Digitável do Boleto UaiMED:\n\n${codigo}`,
        title: 'Boleto UaiMED',
      });
      onCopiado();
    } catch (_) {
      onCopiado();
    }
  };

  return (
    <View style={boletoStyles.boletoCard}>
      {/* ── Cabeçalho do banco ── */}
      <View style={boletoStyles.boletoHeader}>
        <View style={boletoStyles.bankLogoBox}>
          <Text style={boletoStyles.bankLogoText}>UAI</Text>
          <Text style={boletoStyles.bankLogoSub}>BANK</Text>
        </View>
        <View style={boletoStyles.bankCodeBox}>
          <Text style={boletoStyles.bankCode}>341-7</Text>
        </View>
        <Text style={boletoStyles.boletoTitleText}>BOLETO BANCÁRIO</Text>
      </View>

      {/* ── Linha digitável ── */}
      <View style={boletoStyles.linhaDigitavelBox}>
        <Text style={boletoStyles.linhaDigitavelLabel}>Linha Digitável</Text>
        <Text style={boletoStyles.linhaDigitavel} selectable>{codigo}</Text>
      </View>

      {/* ── Código de barras visual ── */}
      <BarcodeVisual />
      <Text style={boletoStyles.barcodeNote}>Código de Barras — Não escaneável (simulado)</Text>

      {/* ── Linha tracejada ── */}
      <View style={boletoStyles.dashedLine} />

      {/* ── Informações do boleto ── */}
      <View style={boletoStyles.infoGrid}>
        <View style={boletoStyles.infoBlock}>
          <Text style={boletoStyles.infoLabel}>Beneficiário</Text>
          <Text style={boletoStyles.infoValue}>UaiMED Serviços de Saúde Ltda</Text>
          <Text style={boletoStyles.infoSubValue}>CNPJ: 00.000.000/0001-00</Text>
        </View>
        <View style={boletoStyles.infoRowDivider} />

        <View style={boletoStyles.infoRow}>
          <View style={boletoStyles.infoCell}>
            <Text style={boletoStyles.infoLabel}>Agência / Código</Text>
            <Text style={boletoStyles.infoValue}>0001 / 12345-6</Text>
          </View>
          <View style={boletoStyles.infoCellBorderLeft}>
            <Text style={boletoStyles.infoLabel}>Nosso Número</Text>
            <Text style={boletoStyles.infoValue}>{nossoNumero}</Text>
          </View>
        </View>
        <View style={boletoStyles.infoRowDivider} />

        <View style={boletoStyles.infoRow}>
          <View style={boletoStyles.infoCell}>
            <Text style={boletoStyles.infoLabel}>Data de Emissão</Text>
            <Text style={boletoStyles.infoValue}>{dataEmissao}</Text>
          </View>
          <View style={boletoStyles.infoCellBorderLeft}>
            <Text style={boletoStyles.infoLabel}>Vencimento</Text>
            <Text style={[boletoStyles.infoValue, { color: '#E53935' }]}>{vencimento}</Text>
          </View>
          <View style={boletoStyles.infoCellBorderLeft}>
            <Text style={boletoStyles.infoLabel}>Valor (R$)</Text>
            <Text style={[boletoStyles.infoValue, { color: '#1B5E20', fontWeight: '800' }]}>
              {valor.toFixed(2)}
            </Text>
          </View>
        </View>
        <View style={boletoStyles.infoRowDivider} />

        <View style={boletoStyles.infoBlock}>
          <Text style={boletoStyles.infoLabel}>Pagador</Text>
          <Text style={boletoStyles.infoValue}>Paciente UaiMED</Text>
        </View>
      </View>

      {/* ── Instruções ── */}
      <View style={boletoStyles.instrucoes}>
        <Text style={boletoStyles.instrucoesTitle}>Instruções de Pagamento</Text>
        <Text style={boletoStyles.instrucoesItem}>• Pague em qualquer banco, lotérica ou internet banking.</Text>
        <Text style={boletoStyles.instrucoesItem}>• Após o vencimento, sujeito a juros e multa de 2%.</Text>
        <Text style={boletoStyles.instrucoesItem}>• Não receber após 30 dias do vencimento.</Text>
        <Text style={boletoStyles.instrucoesItem}>• Confirme o valor antes de efetuar o pagamento.</Text>
      </View>

      {/* ── Botão copiar código ── */}
      <TouchableOpacity style={boletoStyles.copyBtn} onPress={handleCopiar} activeOpacity={0.8}>
        <Ionicons name="share-social-outline" size={18} color="#FFF" />
        <Text style={boletoStyles.copyBtnText}>Compartilhar / Copiar Código</Text>
      </TouchableOpacity>

      <Text style={boletoStyles.boletoFooter}>
        UaiMED · Serviços de Saúde Digital · SAC 0800 000 0000
      </Text>
    </View>
  );
};

const PagamentoScreen: React.FC<Props> = ({ route, navigation }) => {
  const amount = route.params?.amount ?? 0;
  const agendamentoId = route.params?.agendamentoId;
  const medicoId = route.params?.medicoId;
  const pixKey = route.params?.pixKey ?? `${medicoId ?? 'uaimed'}@uaimed.com.br`;
  const nomeProfissional = route.params?.nomeProfissional ?? 'Profissional UaiMED';
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
  const [showPixModal, setShowPixModal] = useState(false);
  const [showBoletoModal, setShowBoletoModal] = useState(false);
  const [valorTravado, setValorTravado] = useState(0);
  const { modal, showModal, hideModal } = useModal();

  const baseAmount = amount || 100;
  const finalAmount = calcularValorFinal(baseAmount, usingPlan, promoDiscount);

  const handleMethodChange = (m: 'pix' | 'card' | 'boleto') => setMethod(m);

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

  // Trava o valor e abre o modal do instrumento correspondente
  const handleGerarPix = () => {
    setValorTravado(finalAmount);
    setShowPixModal(true);
  };

  const handleGerarBoleto = () => {
    setValorTravado(finalAmount);
    setShowBoletoModal(true);
  };

  // Cartão: abre modal de confirmação padrão
  const handlePayCard = () => {
    if (!cardNumber || !cardName || !expiry || !cvv) {
      showModal('Dados incompletos', 'Preencha todos os dados do cartão antes de continuar.', { type: 'warning' });
      return;
    }
    setShowConfirmModal(true);
  };

  const processarPagamentoConfirmado = async () => {
    const resultado = await processarPagamento({
      method,
      amount: baseAmount,   // valor bruto; o backend aplica os descontos uma única vez
      cardNumber,
      cardName,
      expiry,
      cvv,
      usingPlan,
      promoCode: promo,
      agendamentoId,
    });

    if (resultado) {
      setShowPixModal(false);
      setShowBoletoModal(false);
      setShowConfirmModal(false);
      showModal(
        'Pagamento realizado!',
        `Valor: R$ ${resultado.amount.toFixed(2)}\nID: ${resultado.id}`,
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

  // ── Seção de descontos ────────────────────────────────────────────────────────
  const renderDescontos = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Descontos</Text>
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.small}>Plano de saúde</Text>
          <Text style={styles.muted}>Desconto automático do convênio (15%)</Text>
        </View>
        <TouchableOpacity
          style={[styles.toggle, usingPlan && styles.toggleOn]}
          onPress={() => setUsingPlan(p => !p)}
        >
          <Text style={{ color: usingPlan ? '#FFF' : '#4CAF50' }}>{usingPlan ? 'Ativado' : 'Ativar'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.small, { marginTop: 12 }]}>Cupom / Código Promocional</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Ex: UAIMED10"
          value={promo}
          onChangeText={setPromo}
        />
        <TouchableOpacity style={styles.applyButton} onPress={handleValidarCupom}>
          <Text style={{ color: '#FFF' }}>Aplicar</Text>
        </TouchableOpacity>
      </View>

      {promoDiscount > 0 && (
        <View style={styles.discountBadge}>
          <Ionicons name="pricetag-outline" size={14} color="#2E7D32" />
          <Text style={styles.discountBadgeText}>Cupom aplicado: {promoDiscount}% de desconto</Text>
        </View>
      )}
    </View>
  );

  // ── Total com linha de economia ───────────────────────────────────────────────
  const renderTotal = (valor: number, label = 'Total a Pagar') => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{label}</Text>
      <Text style={styles.amount}>R$ {valor.toFixed(2)}</Text>
      {valor < baseAmount && (
        <Text style={styles.savingText}>Você economiza R$ {(baseAmount - valor).toFixed(2)}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>Escolha a forma de pagamento e confirme.</Text>

        {/* Valor base */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Valor da Consulta</Text>
          <Text style={styles.amount}>R$ {baseAmount.toFixed(2)}</Text>
        </View>

        {/* Seleção de método */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Forma de Pagamento</Text>
          <View style={styles.methodsRow}>
            {(['pix', 'card', 'boleto'] as const).map(m => {
              const icons = { pix: 'scan', card: 'card', boleto: 'document-text-outline' } as const;
              const labels = { pix: 'Pix', card: 'Cartão', boleto: 'Boleto' };
              const active = method === m;
              return (
                <TouchableOpacity
                  key={m}
                  style={[styles.method, active && styles.methodActive]}
                  onPress={() => handleMethodChange(m)}
                >
                  <Ionicons name={icons[m]} size={22} color={active ? '#FFF' : '#4CAF50'} />
                  <Text style={[styles.methodText, active && styles.methodTextActive]}>{labels[m]}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ══ CARTÃO ═══════════════════════════════════════════════════════════ */}
        {method === 'card' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dados do Cartão</Text>
              <TextInput style={styles.input} placeholder="Número do cartão" keyboardType="numeric" value={cardNumber} onChangeText={setCardNumber} />
              <TextInput style={styles.input} placeholder="Nome no cartão" value={cardName} onChangeText={setCardName} />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="MM/AA" value={expiry} onChangeText={setExpiry} />
                <TextInput style={[styles.input, { width: 100 }]} placeholder="CVV" keyboardType="numeric" value={cvv} onChangeText={setCvv} />
              </View>
            </View>
            {renderDescontos()}
            {renderTotal(finalAmount)}
            <TouchableOpacity style={[styles.payButton, loading && { opacity: 0.6 }]} onPress={handlePayCard} disabled={loading}>
              {loading
                ? <ActivityIndicator color="#FFF" />
                : <><Ionicons name="lock-closed-outline" size={18} color="#FFF" /><Text style={styles.payText}>Pagar R$ {finalAmount.toFixed(2)}</Text></>
              }
            </TouchableOpacity>
          </>
        )}

        {/* ══ PIX ══════════════════════════════════════════════════════════════ */}
        {method === 'pix' && (
          <>
            {renderDescontos()}
            {renderTotal(finalAmount)}
            <TouchableOpacity style={styles.payButton} onPress={handleGerarPix}>
              <Ionicons name="scan-outline" size={18} color="#FFF" />
              <Text style={styles.payText}>Gerar QR Code PIX</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ══ BOLETO ═══════════════════════════════════════════════════════════ */}
        {method === 'boleto' && (
          <>
            {renderDescontos()}
            {renderTotal(finalAmount)}
            <TouchableOpacity style={styles.payButton} onPress={handleGerarBoleto}>
              <Ionicons name="document-text-outline" size={18} color="#FFF" />
              <Text style={styles.payText}>Gerar Boleto Bancário</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* ══ MODAL PIX ════════════════════════════════════════════════════════════ */}
      <Modal visible={showPixModal} animationType="slide" onRequestClose={() => setShowPixModal(false)}>
        <SafeAreaView style={instrStyles.screen}>
          {/* Cabeçalho */}
          <View style={instrStyles.header}>
            <TouchableOpacity style={instrStyles.closeBtn} onPress={() => setShowPixModal(false)}>
              <Ionicons name="close" size={22} color="#333" />
            </TouchableOpacity>
            <Text style={instrStyles.headerTitle}>Pagar com PIX</Text>
            <View style={instrStyles.headerRight}>
              <View style={instrStyles.pixBadge}>
                <Text style={instrStyles.pixBadgeText}>PIX</Text>
              </View>
            </View>
          </View>

          {/* Resumo do valor */}
          <View style={instrStyles.valueSummary}>
            <Text style={instrStyles.valueSummaryLabel}>Valor a pagar</Text>
            <Text style={instrStyles.valueSummaryAmount}>R$ {valorTravado.toFixed(2)}</Text>
            {valorTravado < baseAmount && (
              <Text style={instrStyles.valueSummaryDiscount}>
                Desconto de R$ {(baseAmount - valorTravado).toFixed(2)} aplicado
              </Text>
            )}
          </View>

          <ScrollView contentContainerStyle={instrStyles.scroll} showsVerticalScrollIndicator={false}>
            <PixView
              valor={valorTravado}
              pixKey={pixKey}
              nomeProfissional={nomeProfissional}
              onCopiado={() =>
                showModal('Chave copiada!', 'Cole no seu app bancário para pagar via PIX.', { type: 'success' })
              }
            />
          </ScrollView>

          {/* Rodapé de ação */}
          <View style={instrStyles.footer}>
            <TouchableOpacity
              style={[instrStyles.confirmBtn, loading && { opacity: 0.6 }]}
              onPress={() => processarPagamentoConfirmado()}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#FFF" />
                : <><Ionicons name="checkmark-circle-outline" size={20} color="#FFF" /><Text style={instrStyles.confirmBtnText}>Já realizei o pagamento</Text></>
              }
            </TouchableOpacity>
            <TouchableOpacity style={instrStyles.cancelLink} onPress={() => setShowPixModal(false)}>
              <Text style={instrStyles.cancelLinkText}>Fechar e alterar descontos</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ══ MODAL BOLETO ═════════════════════════════════════════════════════════ */}
      <Modal visible={showBoletoModal} animationType="slide" onRequestClose={() => setShowBoletoModal(false)}>
        <SafeAreaView style={instrStyles.screen}>
          {/* Cabeçalho */}
          <View style={instrStyles.header}>
            <TouchableOpacity style={instrStyles.closeBtn} onPress={() => setShowBoletoModal(false)}>
              <Ionicons name="close" size={22} color="#333" />
            </TouchableOpacity>
            <Text style={instrStyles.headerTitle}>Boleto Bancário</Text>
            <View style={instrStyles.headerRight} />
          </View>

          {/* Resumo do valor */}
          <View style={instrStyles.valueSummary}>
            <Text style={instrStyles.valueSummaryLabel}>Valor a pagar</Text>
            <Text style={instrStyles.valueSummaryAmount}>R$ {valorTravado.toFixed(2)}</Text>
            {valorTravado < baseAmount && (
              <Text style={instrStyles.valueSummaryDiscount}>
                Desconto de R$ {(baseAmount - valorTravado).toFixed(2)} aplicado
              </Text>
            )}
          </View>

          {/* Aviso boleto */}
          <View style={instrStyles.boletoBanner}>
            <Ionicons name="information-circle-outline" size={18} color="#F57F17" />
            <Text style={instrStyles.boletoBannerText}>
              O pagamento é confirmado em até 3 dias úteis após o pagamento do boleto.
            </Text>
          </View>

          <ScrollView contentContainerStyle={instrStyles.scroll} showsVerticalScrollIndicator={false}>
            <BoletoView
              valor={valorTravado}
              onCopiado={() =>
                showModal('Copiado!', 'Linha digitável copiada. Cole no seu banco ou internet banking.', { type: 'success' })
              }
            />
          </ScrollView>

          {/* Rodapé de ação */}
          <View style={instrStyles.footer}>
            <TouchableOpacity
              style={[instrStyles.confirmBtn, loading && { opacity: 0.6 }]}
              onPress={() => processarPagamentoConfirmado()}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#FFF" />
                : <><Ionicons name="document-text-outline" size={20} color="#FFF" /><Text style={instrStyles.confirmBtnText}>Confirmar emissão do boleto</Text></>
              }
            </TouchableOpacity>
            <TouchableOpacity style={instrStyles.cancelLink} onPress={() => setShowBoletoModal(false)}>
              <Text style={instrStyles.cancelLinkText}>Fechar e alterar descontos</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ══ MODAL CONFIRMAÇÃO CARTÃO ══════════════════════════════════════════════ */}
      <Modal visible={showConfirmModal} transparent animationType="fade" onRequestClose={() => setShowConfirmModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowConfirmModal(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalIconWrapper}>
              <Ionicons name="card" size={36} color="#4CAF50" />
            </View>
            <Text style={styles.modalTitle}>Confirmar Pagamento</Text>

            <View style={styles.modalInfoRow}>
              <Ionicons name="card-outline" size={18} color="#4CAF50" />
              <Text style={styles.modalInfoLabel}>Método</Text>
              <Text style={styles.modalInfoValue}>Cartão de crédito/débito</Text>
            </View>
            <View style={styles.modalInfoRow}>
              <Ionicons name="cash-outline" size={18} color="#4CAF50" />
              <Text style={styles.modalInfoLabel}>Valor</Text>
              <Text style={styles.modalInfoValue}>R$ {baseAmount.toFixed(2)}</Text>
            </View>
            {finalAmount < baseAmount && (
              <View style={styles.modalInfoRow}>
                <Ionicons name="pricetag-outline" size={18} color="#4CAF50" />
                <Text style={styles.modalInfoLabel}>Desconto</Text>
                <Text style={[styles.modalInfoValue, { color: '#2E7D32' }]}>
                  - R$ {(baseAmount - finalAmount).toFixed(2)}
                </Text>
              </View>
            )}
            <View style={[styles.modalInfoRow, styles.modalInfoRowTotal]}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
              <Text style={[styles.modalInfoLabel, { color: '#FFF' }]}>Total</Text>
              <Text style={[styles.modalInfoValue, styles.modalTotalValue]}>
                R$ {finalAmount.toFixed(2)}
              </Text>
            </View>

            <Text style={styles.modalHint}>Deseja confirmar este pagamento?</Text>

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowConfirmModal(false)} activeOpacity={0.75}>
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtnConfirm, loading && { opacity: 0.7 }]}
                onPress={() => processarPagamentoConfirmado()}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading
                  ? <ActivityIndicator size="small" color="#FFF" />
                  : <><Ionicons name="lock-closed-outline" size={16} color="#FFF" /><Text style={styles.modalBtnConfirmText}>Pagar agora</Text></>
                }
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
  title: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
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
  payButton: { backgroundColor: '#4CAF50', padding: 14, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 18 },
  payText: { color: '#FFF', fontWeight: '700' },
  savingText: { fontSize: 12, color: '#2E7D32', marginTop: 4, fontWeight: '600' },
  discountBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: '#E8F5E9', padding: 8, borderRadius: 6 },
  discountBadgeText: { fontSize: 12, color: '#2E7D32', fontWeight: '600' },
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 },
  resetBtnText: { fontSize: 13, color: '#4CAF50', fontWeight: '600' },

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

// ── Estilos dos modais de instrumento (PIX / Boleto) ─────────────────────────
const instrStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  headerRight: {
    width: 36,
    alignItems: 'flex-end',
  },
  pixBadge: {
    backgroundColor: '#00BCD4',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pixBadgeText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1,
  },
  valueSummary: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  valueSummaryLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  valueSummaryAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1B5E20',
  },
  valueSummaryDiscount: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 4,
  },
  boletoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE082',
  },
  boletoBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#F57F17',
    fontWeight: '500',
    lineHeight: 17,
  },
  scroll: {
    padding: 16,
    paddingBottom: 8,
  },
  footer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    gap: 10,
  },
  confirmBtn: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
    elevation: 2,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  confirmBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  cancelLink: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  cancelLinkText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
});

// ── Estilos do PIX ────────────────────────────────────────────────────────────
const pixStyles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#C8E6C9',
    borderRadius: 12,
    backgroundColor: '#F9FFF9',
    marginBottom: 14,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    padding: 14,
  },
  pixLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  pixLogoText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
  },
  headerTitle: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE082',
  },
  timerExpired: {
    backgroundColor: '#FFEBEE',
    borderBottomColor: '#FFCDD2',
  },
  timerText: { fontSize: 13, color: '#F57F17', fontWeight: '600' },
  timerTextExpired: { color: '#D32F2F' },
  qrWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFF',
  },
  qrExpired: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  qrExpiredText: { color: '#9E9E9E', marginTop: 8, fontWeight: '600' },
  qrNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#C8E6C9' },
  dividerText: { fontSize: 12, color: '#81C784', fontWeight: '600' },
  beneficiaryCard: {
    marginHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    backgroundColor: '#FFF',
    paddingVertical: 4,
    marginBottom: 14,
  },
  beneficiaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F8F1',
  },
  beneficiaryLabel: { fontSize: 11, color: '#888', fontWeight: '600', textTransform: 'uppercase' },
  beneficiaryValue: { fontSize: 14, color: '#222', fontWeight: '600', marginTop: 2 },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4CAF50',
    marginHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  copyBtnSuccess: { backgroundColor: '#2E7D32' },
  copyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#4CAF50',
    marginHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  shareBtnText: { color: '#4CAF50', fontWeight: '700', fontSize: 14 },
  instructions: {
    backgroundColor: '#E8F5E9',
    marginHorizontal: 14,
    padding: 14,
    borderRadius: 8,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  instructionsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2E7D32',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  instructionsItem: {
    fontSize: 13,
    color: '#388E3C',
    lineHeight: 22,
  },
});
const boletoStyles = StyleSheet.create({
  boletoCard: {
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    marginBottom: 14,
    overflow: 'hidden',
  },

  // Header
  boletoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B5E20',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  bankLogoBox: {
    backgroundColor: '#FFF',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: 'center',
  },
  bankLogoText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1B5E20',
    letterSpacing: 1,
  },
  bankLogoSub: {
    fontSize: 7,
    color: '#388E3C',
    letterSpacing: 2,
    fontWeight: '700',
  },
  bankCodeBox: {
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#FFF',
    paddingHorizontal: 10,
    marginHorizontal: 4,
  },
  bankCode: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
  },
  boletoTitleText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
    flex: 1,
    textAlign: 'right',
    letterSpacing: 0.5,
  },

  // Linha digitável
  linhaDigitavelBox: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#C8E6C9',
  },
  linhaDigitavelLabel: {
    fontSize: 10,
    color: '#388E3C',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  linhaDigitavel: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    color: '#1B5E20',
    letterSpacing: 0.5,
    fontWeight: '700',
  },

  // Código de barras
  barcodeContainer: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'stretch',
  },
  bar: {
    height: '100%',
  },
  barcodeNote: {
    fontSize: 9,
    color: '#9E9E9E',
    textAlign: 'center',
    marginBottom: 6,
    fontStyle: 'italic',
  },

  // Linha tracejada (corte do canhoto)
  dashedLine: {
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#9E9E9E',
    marginHorizontal: 12,
    marginVertical: 8,
  },

  // Grade de informações
  infoGrid: {
    borderWidth: 1,
    borderColor: '#BDBDBD',
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 4,
    overflow: 'hidden',
  },
  infoBlock: {
    padding: 8,
  },
  infoRow: {
    flexDirection: 'row',
  },
  infoCell: {
    flex: 1,
    padding: 8,
  },
  infoCellBorderLeft: {
    flex: 1,
    padding: 8,
    borderLeftWidth: 1,
    borderColor: '#BDBDBD',
  },
  infoRowDivider: {
    height: 1,
    backgroundColor: '#BDBDBD',
  },
  infoLabel: {
    fontSize: 9,
    color: '#757575',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 12,
    color: '#212121',
    fontWeight: '600',
  },
  infoSubValue: {
    fontSize: 10,
    color: '#757575',
    marginTop: 2,
  },

  // Instruções
  instrucoes: {
    backgroundColor: '#FFFDE7',
    marginHorizontal: 12,
    padding: 10,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#F9A825',
    marginBottom: 12,
  },
  instrucoesTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F57F17',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  instrucoesItem: {
    fontSize: 11,
    color: '#5D4037',
    lineHeight: 18,
  },

  // Botão copiar
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#388E3C',
    marginHorizontal: 12,
    marginBottom: 10,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
  },
  copyBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },

  // Rodapé
  boletoFooter: {
    textAlign: 'center',
    fontSize: 10,
    color: '#9E9E9E',
    paddingBottom: 12,
    fontStyle: 'italic',
  },
});


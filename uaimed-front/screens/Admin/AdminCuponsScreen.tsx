import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator, FlatList, KeyboardAvoidingView, Modal, Platform, RefreshControl,
  StyleSheet, Switch, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { MainTabParamList } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { isArticleAdmin } from '../../utils/articleAdmin';
import { useModal } from '../../hooks/useModal';
import AppModal from '../../components/AppModal';
import uaiMedApi from '../../api/uaiMedApi';

type Props = BottomTabScreenProps<MainTabParamList, 'AdminCupons'>;

interface Cupom {
  id: string;
  codigo: string;
  desconto: number;
  dataExpiracao: string;
  ativo: boolean;
  usosLimite: number | null;
  usosAtuais: number;
}

const DATA_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/;

// Converte "DD/MM/AAAA" em Date local às 23:59 (cupom vale o dia inteiro da expiração).
function parseDataBr(valor: string): Date | null {
  const m = valor.match(DATA_REGEX);
  if (!m) return null;
  const [, dia, mes, ano] = m;
  const data = new Date(Number(ano), Number(mes) - 1, Number(dia), 23, 59, 59);
  if (data.getMonth() !== Number(mes) - 1 || data.getDate() !== Number(dia)) return null; // datas inválidas tipo 31/02
  return data;
}

const AdminCuponsScreen: React.FC<Props> = () => {
  const { user } = useAuth();
  const permitido = isArticleAdmin(user);
  const { modal, showModal, hideModal } = useModal();

  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState('');

  const [modalCriarVisible, setModalCriarVisible] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [desconto, setDesconto] = useState('');
  const [validade, setValidade] = useState('');
  const [usosLimite, setUsosLimite] = useState('');

  const carregar = useCallback(async (refresh = false, ativo: () => boolean = () => true) => {
    if (!permitido) return;
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setErro('');
    try {
      const { data } = await uaiMedApi.get<Cupom[]>('/admin/cupons');
      if (!ativo()) return;
      setCupons(data);
    } catch {
      if (!ativo()) return;
      setErro('Não foi possível carregar os cupons. Tente novamente.');
    } finally {
      if (ativo()) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [permitido]);

  useFocusEffect(useCallback(() => {
    let ativo = true;
    void carregar(false, () => ativo);
    return () => { ativo = false; };
  }, [carregar]));

  if (!permitido) return null;

  const resetForm = () => {
    setCodigo('');
    setDesconto('');
    setValidade('');
    setUsosLimite('');
  };

  const abrirModalCriar = () => {
    resetForm();
    setModalCriarVisible(true);
  };

  const handleCriar = async () => {
    const descontoNum = Number(desconto);
    const dataExpiracao = parseDataBr(validade);
    const usosLimiteNum = usosLimite.trim() ? Number(usosLimite) : undefined;

    if (codigo.trim().length < 3) {
      showModal('Código inválido', 'Informe um código com ao menos 3 caracteres.', { type: 'warning' });
      return;
    }
    if (!Number.isInteger(descontoNum) || descontoNum < 1 || descontoNum > 100) {
      showModal('Desconto inválido', 'O desconto deve ser um número inteiro de 1 a 100.', { type: 'warning' });
      return;
    }
    if (!dataExpiracao) {
      showModal('Data inválida', 'Informe a validade no formato DD/MM/AAAA.', { type: 'warning' });
      return;
    }
    if (usosLimite.trim() && (!Number.isInteger(usosLimiteNum) || (usosLimiteNum as number) <= 0)) {
      showModal('Limite de usos inválido', 'O limite de usos deve ser um número inteiro positivo, ou deixe em branco para sem limite.', { type: 'warning' });
      return;
    }

    setSalvando(true);
    try {
      await uaiMedApi.post('/admin/cupons', {
        codigo: codigo.trim(),
        desconto: descontoNum,
        dataExpiracao: dataExpiracao.toISOString(),
        usosLimite: usosLimiteNum,
      });
      setModalCriarVisible(false);
      resetForm();
      void carregar();
      showModal('Cupom criado', 'O cupom foi cadastrado e já pode ser usado pelos pacientes.', { type: 'success' });
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Não foi possível criar o cupom. Tente novamente.';
      showModal('Erro ao criar cupom', msg, { type: 'error' });
    } finally {
      setSalvando(false);
    }
  };

  const alternarAtivo = async (cupom: Cupom, novoValor: boolean) => {
    // Otimista: reflete na hora, reverte se a API falhar.
    setCupons((prev) => prev.map((c) => (c.id === cupom.id ? { ...c, ativo: novoValor } : c)));
    try {
      await uaiMedApi.put(`/admin/cupons/${cupom.id}`, { ativo: novoValor });
    } catch {
      setCupons((prev) => prev.map((c) => (c.id === cupom.id ? { ...c, ativo: cupom.ativo } : c)));
      showModal('Erro', 'Não foi possível atualizar o cupom. Tente novamente.', { type: 'error' });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={erro ? [] : cupons}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { void carregar(true); }} colors={['#4CAF50']} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.icon}>
              <Ionicons name="pricetags-outline" size={28} color="#388E3C" />
            </View>
            <Text style={styles.title}>Cupons de desconto</Text>
            <Text style={styles.subtitle}>Crie, liste e desative cupons usados no pagamento das consultas.</Text>
            <TouchableOpacity style={styles.primaryButton} accessibilityRole="button" onPress={abrirModalCriar}>
              <Ionicons name="add" size={22} color="#FFF" />
              <Text style={styles.primaryText}>Novo cupom</Text>
            </TouchableOpacity>
            {!loading && !erro && (
              <Text style={styles.count}>{cupons.length} {cupons.length === 1 ? 'cupom cadastrado' : 'cupons cadastrados'}</Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            {loading ? <ActivityIndicator size="large" color="#4CAF50" /> : erro ? (
              <>
                <Text style={styles.emptyText}>{erro}</Text>
                <TouchableOpacity style={styles.retry} onPress={() => { void carregar(); }} accessibilityRole="button">
                  <Text style={styles.link}>Tentar novamente</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Ionicons name="pricetag-outline" size={44} color="#A5D6A7" />
                <Text style={styles.emptyText}>Nenhum cupom cadastrado. Crie o primeiro.</Text>
              </>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const expirado = new Date(item.dataExpiracao) < new Date();
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.codigo}>{item.codigo}</Text>
                <View style={[styles.badge, item.ativo && !expirado ? styles.badgeAtivo : styles.badgeInativo]}>
                  <Text style={[styles.badgeText, item.ativo && !expirado ? styles.badgeTextAtivo : styles.badgeTextInativo]}>
                    {expirado ? 'Expirado' : item.ativo ? 'Ativo' : 'Inativo'}
                  </Text>
                </View>
              </View>
              <Text style={styles.desconto}>{item.desconto}% de desconto</Text>
              <Text style={styles.meta}>
                Válido até {new Date(item.dataExpiracao).toLocaleDateString('pt-BR')}
              </Text>
              <Text style={styles.meta}>
                Usos: {item.usosAtuais}{item.usosLimite ? ` / ${item.usosLimite}` : ' (sem limite)'}
              </Text>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>{item.ativo ? 'Desativar cupom' : 'Reativar cupom'}</Text>
                <Switch
                  value={item.ativo}
                  onValueChange={(v) => alternarAtivo(item, v)}
                  trackColor={{ true: '#4CAF50' }}
                />
              </View>
            </View>
          );
        }}
      />

      {/* Modal de criação */}
      <Modal visible={modalCriarVisible} transparent animationType="slide" onRequestClose={() => setModalCriarVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo cupom</Text>
              <TouchableOpacity onPress={() => setModalCriarVisible(false)} accessibilityRole="button" accessibilityLabel="Fechar">
                <Ionicons name="close" size={24} color="#555" />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Código</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: BEMVINDO10"
              autoCapitalize="characters"
              value={codigo}
              onChangeText={setCodigo}
              maxLength={20}
            />

            <Text style={styles.fieldLabel}>Desconto (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 10"
              keyboardType="numeric"
              value={desconto}
              onChangeText={(v) => setDesconto(v.replace(/[^0-9]/g, ''))}
              maxLength={3}
            />

            <Text style={styles.fieldLabel}>Validade</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              keyboardType="numbers-and-punctuation"
              value={validade}
              onChangeText={setValidade}
              maxLength={10}
            />

            <Text style={styles.fieldLabel}>Limite de usos (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Deixe em branco para sem limite"
              keyboardType="numeric"
              value={usosLimite}
              onChangeText={(v) => setUsosLimite(v.replace(/[^0-9]/g, ''))}
            />

            <TouchableOpacity
              style={[styles.primaryButton, salvando && styles.primaryButtonDisabled]}
              onPress={handleCriar}
              disabled={salvando}
              accessibilityRole="button"
            >
              {salvando ? <ActivityIndicator color="#FFF" /> : (
                <>
                  <Ionicons name="checkmark" size={20} color="#FFF" />
                  <Text style={styles.primaryText}>Criar cupom</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <AppModal
        visible={modal.visible}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        buttons={modal.buttons}
        onClose={hideModal}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 20, paddingBottom: 32 },
  header: { marginBottom: 20 },
  icon: { width: 54, height: 54, borderRadius: 16, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { fontSize: 24, fontWeight: '800', color: '#222', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', lineHeight: 21, marginBottom: 20 },
  primaryButton: { backgroundColor: '#4CAF50', borderRadius: 12, padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryButtonDisabled: { opacity: 0.7 },
  primaryText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  count: { marginTop: 24, color: '#777', fontSize: 13, fontWeight: '600' },
  card: { padding: 18, borderRadius: 14, backgroundColor: '#FFF', marginBottom: 14, borderWidth: 1, borderColor: '#EEE' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  codigo: { color: '#222', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeAtivo: { backgroundColor: '#E8F5E9' },
  badgeInativo: { backgroundColor: '#FBE9E7' },
  badgeText: { fontSize: 11, fontWeight: '700' },
  badgeTextAtivo: { color: '#2E7D32' },
  badgeTextInativo: { color: '#C62828' },
  desconto: { color: '#388E3C', fontSize: 15, fontWeight: '700', marginBottom: 6 },
  meta: { color: '#777', fontSize: 13, marginBottom: 2 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  toggleLabel: { color: '#555', fontSize: 13, fontWeight: '600' },
  link: { color: '#388E3C', fontWeight: '700', fontSize: 14 },
  empty: { alignItems: 'center', padding: 24 },
  emptyText: { color: '#777', textAlign: 'center', lineHeight: 22, marginTop: 12 },
  retry: { padding: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 32 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  modalTitle: { fontSize: 19, fontWeight: '800', color: '#222' },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#F7F7F7', borderRadius: 10, borderWidth: 1, borderColor: '#E5E5E5', paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: '#222' },
});

export default AdminCuponsScreen;

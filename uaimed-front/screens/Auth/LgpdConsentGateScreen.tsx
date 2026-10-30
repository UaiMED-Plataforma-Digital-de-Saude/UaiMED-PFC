import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import uaiMedApi from '../../api/uaiMedApi';
import { LGPD_POLICY_TEXT } from '../../constants/lgpdPolicy';
import AppModal from '../../components/AppModal';
import { useModal } from '../../hooks/useModal';

/**
 * Tela de bloqueio pós-login para contas criadas antes do fluxo de
 * consentimento LGPD (ou que aceitaram uma versão antiga da política).
 * Renderizada no lugar do MainTabNavigator enquanto
 * `user.precisaConsentimentoLgpd` for true — ver navigation/index.tsx.
 */
const LgpdConsentGateScreen: React.FC = () => {
  const { user, updateUser, signOut } = useAuth();
  const [aceita, setAceita] = useState(false);
  const [loading, setLoading] = useState(false);
  const { modal, showModal, hideModal } = useModal();

  const handleAceitar = async () => {
    if (!aceita) {
      showModal('Consentimento necessário', 'Marque a caixa de aceite para continuar.', { type: 'warning' });
      return;
    }
    setLoading(true);
    try {
      await uaiMedApi.post('/users/me/consentimento-lgpd');
      await updateUser({ precisaConsentimentoLgpd: false });
    } catch {
      showModal('Erro', 'Não foi possível registrar seu aceite. Tente novamente.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark-outline" size={28} color="#4CAF50" />
        <Text style={styles.title}>Atualizamos nossa Política de Privacidade</Text>
      </View>
      <Text style={styles.intro}>
        Olá, {user?.nome?.split(' ')[0] ?? ''}. Para continuar usando o UaiMED, precisamos que você
        revise e aceite a Política de Privacidade (LGPD) abaixo.
      </Text>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.policyText}>{LGPD_POLICY_TEXT}</Text>
      </ScrollView>

      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setAceita((v) => !v)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: aceita }}
      >
        <Ionicons name={aceita ? 'checkbox' : 'square-outline'} size={22} color={aceita ? '#4CAF50' : '#999'} />
        <Text style={styles.checkboxLabel}>Li e aceito a Política de Privacidade (LGPD)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btnPrimary, loading && { opacity: 0.7 }]}
        onPress={handleAceitar}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Aceitar e continuar</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnSecondary} onPress={() => signOut()} disabled={loading}>
        <Text style={styles.btnSecondaryText}>Sair da conta</Text>
      </TouchableOpacity>

      <AppModal {...modal} onClose={hideModal} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1 },
  intro: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 14 },
  scroll: { flex: 1, borderWidth: 1, borderColor: '#EEE', borderRadius: 10, marginBottom: 14 },
  scrollContent: { padding: 14 },
  policyText: { fontSize: 13, color: '#444', lineHeight: 19 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  checkboxLabel: { flex: 1, fontSize: 13, color: '#444' },
  btnPrimary: { backgroundColor: '#4CAF50', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  btnSecondary: { paddingVertical: 14, alignItems: 'center' },
  btnSecondaryText: { color: '#999', fontWeight: '600', fontSize: 14 },
});

export default LgpdConsentGateScreen;

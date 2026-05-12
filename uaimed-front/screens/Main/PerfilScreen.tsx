import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Switch } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useAvaliacoes } from '../../hooks/useAvaliacoes';
import AppModal from '../../components/AppModal';
import { useModal } from '../../hooks/useModal';
import uaiMedApi from '../../api/uaiMedApi';

type PerfilScreenProps = BottomTabScreenProps<MainTabParamList, 'Perfil'>;

/**
 * ProfileInfoRow
 * Componente para exibir uma linha de informação no perfil
 */
const ProfileInfoRow: React.FC<{ 
  icon: keyof typeof Ionicons.glyphMap; 
  label: string; 
  value: string;
}> = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={24} color="#4B73B2" style={{ width: 30 }} />
    <View style={{ flex: 1 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

/**
 * ActionItem
 * Componente para um item de ação clicável com ícone e chevron
 */
const ActionItem: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  onPress: () => void;
}> = ({ icon, iconColor = '#4B73B2', label, onPress }) => (
  <TouchableOpacity style={styles.actionItem} onPress={onPress}>
    <Ionicons name={icon} size={24} color={iconColor} />
    <Text style={styles.actionText}>{label}</Text>
    <Ionicons name="chevron-forward" size={24} color="#CCC" />
  </TouchableOpacity>
);

/**
 * PerfilScreen
 * Exibe informações do usuário e opções de configuração
 */
const PerfilScreen: React.FC<PerfilScreenProps> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const profissionalId = user?.tipo === 'medico' ? user?.profissional?.id : undefined;
  const { notaMedia, loading: loadingAvaliacoes } = useAvaliacoes(profissionalId);
  const [showChangePwd, setShowChangePwd] = React.useState(false);
  const [pwdLoading, setPwdLoading] = React.useState(false);
  const [oldPassword, setOldPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [notifEmail, setNotifEmail] = React.useState(true);
  const [notifPush, setNotifPush] = React.useState(true);
  const [notifLoading, setNotifLoading] = React.useState(false);

  // ── Conta bancária ──────────────────────────────────────────────────────────
  const [showBankSection, setShowBankSection] = React.useState(false);
  const [bankLoading, setBankLoading] = React.useState(false);
  const [bankSaving, setBankSaving] = React.useState(false);
  const [pixKey, setPixKey] = React.useState('');
  const [banco, setBanco] = React.useState('');
  const [agencia, setAgencia] = React.useState('');
  const [conta, setConta] = React.useState('');
  const [tipoConta, setTipoConta] = React.useState<'corrente' | 'poupanca'>('corrente');

  const { modal, showModal, hideModal } = useModal();

  const isProfissionalOuClinica = user?.tipo === 'medico' || user?.tipo === 'clinica';

  // Carrega dados bancários ao abrir a seção
  const handleOpenBankSection = async () => {
    if (showBankSection) { setShowBankSection(false); return; }
    setShowBankSection(true);
    setBankLoading(true);
    try {
      const res = await uaiMedApi.get('/conta-bancaria');
      setPixKey(res.data.pixKey ?? '');
      setBanco(res.data.banco ?? '');
      setAgencia(res.data.agencia ?? '');
      setConta(res.data.conta ?? '');
      setTipoConta(res.data.tipoConta ?? 'corrente');
    } catch {
      // sem dados ainda — campos ficam vazios para preenchimento
    } finally {
      setBankLoading(false);
    }
  };

  const handleSaveBankData = async () => {
    if (!pixKey.trim()) {
      showModal('Campo obrigatório', 'Informe a Chave PIX.', { type: 'warning' });
      return;
    }
    setBankSaving(true);
    try {
      await uaiMedApi.put('/conta-bancaria', { pixKey: pixKey.trim(), banco: banco.trim(), agencia: agencia.trim(), conta: conta.trim(), tipoConta });
      showModal('Dados salvos!', 'Suas informações bancárias foram atualizadas com sucesso.', { type: 'success' });
      setShowBankSection(false);
    } catch {
      showModal('Erro', 'Não foi possível salvar os dados bancários. Tente novamente.', { type: 'error' });
    } finally {
      setBankSaving(false);
    }
  };

  const handleLogout = () => {
    showModal(
      'Sair da Conta',
      'Tem certeza de que deseja encerrar sua sessão no UaiMED?',
      {
        type: 'confirm',
        buttons: [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sim, Sair', style: 'destructive', onPress: () => signOut() },
        ],
      },
    );
  };

  // Garante que o usuário existe antes de tentar exibir
  if (!user) {
      return (
          <View style={styles.loadingContainer}>
              <Text>Erro: Usuário não autenticado.</Text>
              <TouchableOpacity onPress={() => signOut()}><Text>Voltar ao Login</Text></TouchableOpacity>
          </View>
      );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* 1. SEÇÃO DE INFORMAÇÕES PESSOAIS */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações Pessoais</Text>
            <ProfileInfoRow icon="person-outline" label="Nome Completo" value={user.nome} />
            <ProfileInfoRow icon="mail-outline" label="E-mail" value={user.email} />
            {/* Mostra média de avaliações caso o usuário seja profissional/clinica */}
            {(user.tipo === 'medico' || user.tipo === 'clinica') && (
              <View style={styles.infoRow}>
                <Ionicons name="star" size={24} color="#4B73B2" style={{ width: 30 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>Avaliação média</Text>
                  {loadingAvaliacoes ? (
                    <ActivityIndicator size="small" color="#4B73B2" />
                  ) : (
                    <Text style={styles.infoValue}>
                      {notaMedia !== null ? `${Number(notaMedia).toFixed(1)} / 5` : 'Sem avaliações'}
                    </Text>
                  )}
                </View>
              </View>
            )}
            <ProfileInfoRow icon="id-card-outline" label="Tipo de Conta" value={user.tipo === 'paciente' ? 'Paciente' : user.tipo === 'medico' ? 'Médico' : 'Clínica'} />
            <ProfileInfoRow icon="call-outline" label="Telefone" value={user.telefone || 'Não informado'} />
            <ProfileInfoRow icon="wallet-outline" label="CPF/CNPJ" value={user.cpf || user.cnpj || 'Não informado'} />
        </View>

        {/* 2. SEÇÃO DE CONSULTAS & PAGAMENTOS */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meus Registros</Text>
            <ActionItem
                icon="calendar-outline"
                label="Minhas Consultas"
                onPress={() => navigation.navigate('Agendamentos', { screen: 'MinhasConsultas' })}
            />
            <ActionItem
                icon="card-outline"
                iconColor="#4CAF50"
                label="Meus Pagamentos"
                onPress={() => navigation.navigate('Agendamentos', { screen: 'MeusPagamentos' })}
            />
        </View>

        {/* 3. SEÇÃO DE CONFIGURAÇÕES */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configurações</Text>
            <ActionItem 
                icon="lock-closed-outline" 
                label="Alterar Senha" 
                onPress={() => setShowChangePwd((s) => !s)} 
            />
            {showChangePwd && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Alterar Senha</Text>
                <TextInput placeholder="Senha atual" secureTextEntry value={oldPassword} onChangeText={setOldPassword} style={styles.input} editable={!pwdLoading} />
                <TextInput placeholder="Nova senha" secureTextEntry value={newPassword} onChangeText={setNewPassword} style={styles.input} editable={!pwdLoading} />
                <TextInput placeholder="Confirme a nova senha" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} style={styles.input} editable={!pwdLoading} />
                <TouchableOpacity
                  style={[styles.changeBtn, pwdLoading && { opacity: 0.7 }]}
                  onPress={async () => {
                    if (!oldPassword || !newPassword) {
                      showModal('Campos obrigatórios', 'Preencha a senha atual e a nova senha.', { type: 'warning' });
                      return;
                    }
                    if (newPassword !== confirmPassword) {
                      showModal('Senhas diferentes', 'A confirmação da senha não coincide.', { type: 'error' });
                      return;
                    }
                    setPwdLoading(true);
                    try {
                      // Tenta chamar endpoint real; se falhar, simulamos sucesso
                      await import('../../api/uaiMedApi').then(async ({ default: api }) => {
                        await api.post('/auth/change-password', { oldPassword, newPassword });
                      });
                      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
                      setShowChangePwd(false);
                      showModal('Senha alterada!', 'Sua senha foi atualizada com sucesso.', { type: 'success' });
                    } catch {
                      showModal('Erro', 'Não foi possível alterar a senha. Tente novamente.', { type: 'error' });
                    } finally {
                      setPwdLoading(false);
                    }
                  }}
                >
                  <Text style={styles.changeBtnText}>{pwdLoading ? 'Processando...' : 'Alterar Senha'}</Text>
                </TouchableOpacity>
              </View>
            )}

            <ActionItem 
                icon="notifications-outline" 
                label="Configurações de Notificação" 
                onPress={() => setShowNotifications((s) => !s)} 
            />
            {showNotifications && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notificações</Text>
                <View style={styles.infoRow}>
                  <Text style={{ flex: 1 }}>E-mail</Text>
                  <Switch value={notifEmail} onValueChange={setNotifEmail} />
                </View>
                <View style={styles.infoRow}>
                  <Text style={{ flex: 1 }}>Push</Text>
                  <Switch value={notifPush} onValueChange={setNotifPush} />
                </View>
                <TouchableOpacity
                  style={[styles.changeBtn, notifLoading && { opacity: 0.7 }]}
                  onPress={async () => {
                    setNotifLoading(true);
                    try {
                      await import('../../api/uaiMedApi').then(async ({ default: api }) => {
                        await api.post('/users/me/notifications', { email: notifEmail, push: notifPush });
                      });
                      setShowNotifications(false);
                      showModal('Preferências salvas!', 'Suas configurações de notificação foram atualizadas.', { type: 'success' });
                    } catch {
                      showModal('Erro', 'Não foi possível salvar as preferências.', { type: 'error' });
                    } finally {
                      setNotifLoading(false);
                    }
                  }}
                >
                  <Text style={styles.changeBtnText}>{notifLoading ? 'Salvando...' : 'Salvar Preferências'}</Text>
                </TouchableOpacity>
              </View>
            )}
        </View>

        {/* 4. SEÇÃO CONTA BANCÁRIA — apenas para médicos e clínicas */}
        {isProfissionalOuClinica && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados Bancários & PIX</Text>
            <ActionItem
              icon="wallet-outline"
              iconColor="#4CAF50"
              label={showBankSection ? 'Fechar' : 'Gerenciar Conta Bancária'}
              onPress={handleOpenBankSection}
            />
            {showBankSection && (
              <View style={{ marginTop: 12 }}>
                {bankLoading ? (
                  <ActivityIndicator size="small" color="#4CAF50" style={{ marginVertical: 16 }} />
                ) : (
                  <>
                    <Text style={styles.bankLabel}>Chave PIX *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: email, CPF, telefone ou chave aleatória"
                      value={pixKey}
                      onChangeText={setPixKey}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />

                    <Text style={styles.bankLabel}>Banco</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: Itaú, Bradesco, Nubank, BB, Caixa"
                      value={banco}
                      onChangeText={setBanco}
                    />

                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.bankLabel}>Agência</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Ex: 0001"
                          value={agencia}
                          onChangeText={setAgencia}
                          keyboardType="numeric"
                        />
                      </View>
                      <View style={{ flex: 2 }}>
                        <Text style={styles.bankLabel}>Conta</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Ex: 12345-6"
                          value={conta}
                          onChangeText={setConta}
                        />
                      </View>
                    </View>

                    <Text style={styles.bankLabel}>Tipo de Conta</Text>
                    <View style={styles.tipoContaRow}>
                      <TouchableOpacity
                        style={[styles.tipoContaBtn, tipoConta === 'corrente' && styles.tipoContaBtnActive]}
                        onPress={() => setTipoConta('corrente')}
                      >
                        <Ionicons name="card-outline" size={16} color={tipoConta === 'corrente' ? '#FFF' : '#4CAF50'} />
                        <Text style={[styles.tipoContaText, tipoConta === 'corrente' && styles.tipoContaTextActive]}>Corrente</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.tipoContaBtn, tipoConta === 'poupanca' && styles.tipoContaBtnActive]}
                        onPress={() => setTipoConta('poupanca')}
                      >
                        <Ionicons name="save-outline" size={16} color={tipoConta === 'poupanca' ? '#FFF' : '#4CAF50'} />
                        <Text style={[styles.tipoContaText, tipoConta === 'poupanca' && styles.tipoContaTextActive]}>Poupança</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={[styles.changeBtn, bankSaving && { opacity: 0.7 }]}
                      onPress={handleSaveBankData}
                      disabled={bankSaving}
                    >
                      {bankSaving
                        ? <ActivityIndicator size="small" color="#FFF" />
                        : <Text style={styles.changeBtnText}>Salvar Dados Bancários</Text>
                      }
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </View>
        )}

        {/* 5. AÇÃO DE LOGOUT */}
        <View style={styles.section}>
            <TouchableOpacity 
                style={styles.logoutButton} 
                onPress={handleLogout} // Conecta à função de logout
            >
                <Text style={styles.logoutButtonText}>SAIR DA CONTA</Text>
            </TouchableOpacity>
        </View>
        
        <View style={{ height: 50 }} /> {/* Espaço no final */}
      </ScrollView>

      <AppModal {...modal} onClose={hideModal} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', paddingTop: 8 },
  headerTitle: {
    fontSize: 26, 
    fontWeight: '700', 
    padding: 20, 
    paddingTop: 16,
    backgroundColor: '#FFF',
    marginBottom: 2,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Seções
  section: { marginHorizontal: 12, marginTop: 12, backgroundColor: '#FFF', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, elevation: 1, borderWidth: 1, borderColor: '#F5F5F5' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14, color: '#222' },
  
  // Linhas de Informação
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#F5F5F5' },
  infoLabel: { fontSize: 12, color: '#999', fontWeight: '500' },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#222' },

  // Ações
  actionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderColor: '#F5F5F5', justifyContent: 'space-between' },
  actionText: { flex: 1, fontSize: 15, marginLeft: 12, fontWeight: '500', color: '#333' },
  input: { borderWidth: 1, borderColor: '#F0F0F0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 11, backgroundColor: '#FAFAFA', marginBottom: 10, fontSize: 14, color: '#333' },
  changeBtn: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  changeBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  
  // Botão de Logout
  logoutButton: { 
    backgroundColor: '#D9534F',
    borderRadius: 8,
    padding: 14,
    marginTop: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Conta Bancária
  bankLabel: { fontSize: 12, fontWeight: '700', color: '#555', marginBottom: 4, marginTop: 4 },
  tipoContaRow: { flexDirection: 'row', gap: 10, marginBottom: 10, marginTop: 4 },
  tipoContaBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5, borderColor: '#4CAF50' },
  tipoContaBtnActive: { backgroundColor: '#4CAF50' },
  tipoContaText: { fontSize: 13, fontWeight: '600', color: '#4CAF50' },
  tipoContaTextActive: { color: '#FFF' },
});

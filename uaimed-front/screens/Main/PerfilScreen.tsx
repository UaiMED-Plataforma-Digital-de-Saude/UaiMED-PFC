import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, Switch, Platform,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useAvaliacoes } from '../../hooks/useAvaliacoes';
import AppModal from '../../components/AppModal';
import { useModal } from '../../hooks/useModal';
import uaiMedApi from '../../api/uaiMedApi';

type PerfilScreenProps = BottomTabScreenProps<MainTabParamList, 'Perfil'>;

// ── Sub-componentes ──────────────────────────────────────────────

const InfoRow: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  value: string;
  last?: boolean;
}> = ({ icon, iconColor = '#4CAF50', label, value, last }) => (
  <View style={[s.infoRow, last && { borderBottomWidth: 0, marginBottom: 0 }]}>
    <View style={[s.iconBox, { backgroundColor: iconColor + '1A' }]}>
      <Ionicons name={icon} size={17} color={iconColor} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  </View>
);

const ActionRow: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  sublabel?: string;
  onPress: () => void;
  last?: boolean;
}> = ({ icon, iconColor = '#4CAF50', label, sublabel, onPress, last }) => (
  <TouchableOpacity
    style={[s.actionRow, last && { borderBottomWidth: 0 }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[s.iconBox, { backgroundColor: iconColor + '1A' }]}>
      <Ionicons name={icon} size={17} color={iconColor} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={s.actionLabel}>{label}</Text>
      {sublabel ? <Text style={s.actionSub}>{sublabel}</Text> : null}
    </View>
    <Ionicons name="chevron-forward" size={16} color="#CCC" />
  </TouchableOpacity>
);

// ── Tela Principal ───────────────────────────────────────────────

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

  const [showBankSection, setShowBankSection] = React.useState(false);
  const [bankLoading, setBankLoading] = React.useState(false);
  const [bankSaving, setBankSaving] = React.useState(false);
  const [pixKey, setPixKey] = React.useState('');
  const [banco, setBanco] = React.useState('');
  const [agencia, setAgencia] = React.useState('');
  const [conta, setConta] = React.useState('');
  const [tipoConta, setTipoConta] = React.useState<'corrente' | 'poupanca'>('corrente');

  const { modal, showModal, hideModal } = useModal();

  const isPaciente = user?.tipo === 'paciente';
  const isMedico   = user?.tipo === 'medico';
  const isClinica  = user?.tipo === 'clinica';

  const tipoLabel = isPaciente ? 'Paciente' : isMedico ? 'Médico' : 'Clínica';

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
    } catch { /* campos vazios */ }
    finally { setBankLoading(false); }
  };

  const handleSaveBankData = async () => {
    if (!pixKey.trim()) {
      showModal('Campo obrigatório', 'Informe a Chave PIX.', { type: 'warning' });
      return;
    }
    setBankSaving(true);
    try {
      await uaiMedApi.put('/conta-bancaria', { pixKey: pixKey.trim(), banco: banco.trim(), agencia: agencia.trim(), conta: conta.trim(), tipoConta });
      showModal('Dados salvos!', 'Informações bancárias atualizadas com sucesso.', { type: 'success' });
      setShowBankSection(false);
    } catch {
      showModal('Erro', 'Não foi possível salvar os dados bancários.', { type: 'error' });
    } finally { setBankSaving(false); }
  };

  const handleLogout = () => {
    showModal('Sair da Conta', 'Tem certeza de que deseja encerrar sua sessão no UaiMED?', {
      type: 'confirm',
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sim, Sair', style: 'destructive', onPress: () => signOut() },
      ],
    });
  };

  if (!user) {
    return (
      <View style={s.loadingBg}>
        <Text style={{ color: '#999' }}>Usuário não autenticado.</Text>
        <TouchableOpacity onPress={() => signOut()} style={s.errBtn}>
          <Text style={{ color: '#FFF', fontWeight: '700' }}>Voltar ao Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.root}>
      {/* ── Cabeçalho do perfil ── */}
      <View style={s.profileHeader}>
        <View style={s.avatarCircle}>
          <Text style={s.avatarTxt}>{user.nome.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={s.profileName} numberOfLines={1}>{user.nome}</Text>
          <View style={s.typeBadge}>
            <Ionicons
              name={isPaciente ? 'person' : isMedico ? 'medical' : 'business'}
              size={11}
              color="#4CAF50"
            />
            <Text style={s.typeBadgeTxt}>{tipoLabel}</Text>
          </View>
          {(isMedico || isClinica) && (
            <View style={s.ratingInline}>
              {loadingAvaliacoes
                ? <ActivityIndicator size="small" color="#FFC107" />
                : <>
                    <Ionicons name="star" size={12} color="#FFC107" />
                    <Text style={s.ratingTxt}>
                      {notaMedia !== null ? `${Number(notaMedia).toFixed(1)} / 5.0` : 'Sem avaliações'}
                    </Text>
                  </>
              }
            </View>
          )}
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── 1. Informações da Conta (campos universais) ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Informações da Conta</Text>
          <InfoRow icon="person-outline"  label="Nome Completo" value={user.nome} />
          <InfoRow icon="mail-outline"    label="E-mail"        value={user.email} iconColor="#1E88E5" />
          <InfoRow icon="call-outline"    label="Telefone"      value={user.telefone || 'Não informado'} iconColor="#43A047" />

          {/* Paciente: CPF */}
          {isPaciente && (
            <InfoRow icon="card-outline" label="CPF" value={user.cpf || 'Não informado'} iconColor="#7B1FA2" last />
          )}

          {/* Médico: CRM + Especialidade */}
          {isMedico && (
            <>
              <InfoRow icon="ribbon-outline"  label="CRM"          value={user.profissional?.crm || 'Não informado'} iconColor="#F57C00" />
              <InfoRow icon="medical-outline" label="Especialidade" value={user.profissional?.especialidade || 'Não informado'} iconColor="#E53935" last />
            </>
          )}

          {/* Clínica: CNPJ */}
          {isClinica && (
            <InfoRow icon="business-outline" label="CNPJ" value={user.cnpj || user.cpf || 'Não informado'} iconColor="#00838F" last />
          )}
        </View>

        {/* ── 2. Registros — somente PACIENTE ── */}
        {isPaciente && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Meus Registros</Text>
            <ActionRow
              icon="calendar-outline"
              label="Minhas Consultas"
              sublabel="Histórico de agendamentos"
              onPress={() => navigation.navigate('Agendamentos', { screen: 'MinhasConsultas' })}
            />
            <ActionRow
              icon="card-outline"
              iconColor="#1E88E5"
              label="Meus Pagamentos"
              sublabel="Histórico financeiro"
              onPress={() => navigation.navigate('Agendamentos', { screen: 'MeusPagamentos' })}
              last
            />
          </View>
        )}

        {/* ── 2b. Agenda — somente MÉDICO ── */}
        {isMedico && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Minha Agenda Profissional</Text>
            <ActionRow
              icon="calendar-outline"
              label="Ver Agendamentos"
              sublabel="Consultas marcadas com pacientes"
              onPress={() => navigation.navigate('Agendamentos' as any)}
            />
            <ActionRow
              icon="star-outline"
              iconColor="#F9A825"
              label="Minhas Avaliações"
              sublabel="Feedbacks dos pacientes"
              onPress={() => navigation.navigate('Agendamentos', { screen: 'HistoricoAvaliacoes' })}
              last
            />
          </View>
        )}

        {/* ── 2c. Gestão — somente CLÍNICA ── */}
        {isClinica && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Gestão da Clínica</Text>
            <ActionRow
              icon="bar-chart-outline"
              label="Painel Administrativo"
              sublabel="Relatórios e indicadores"
              onPress={() => navigation.navigate('ClinicDashboard' as any)}
              last
            />
          </View>
        )}

        {/* ── 3. Dados Bancários — somente MÉDICO ou CLÍNICA ── */}
        {(isMedico || isClinica) && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Dados Bancários & PIX</Text>
            <ActionRow
              icon="wallet-outline"
              iconColor="#4CAF50"
              label={showBankSection ? 'Fechar dados bancários' : 'Gerenciar Conta Bancária'}
              sublabel="Chave PIX, banco e conta para recebimento"
              onPress={handleOpenBankSection}
              last={!showBankSection}
            />
            {showBankSection && (
              <View style={s.bankForm}>
                {bankLoading ? (
                  <ActivityIndicator size="small" color="#4CAF50" style={{ marginVertical: 16 }} />
                ) : (
                  <>
                    <Text style={s.bankLabel}>Chave PIX *</Text>
                    <TextInput style={s.input} placeholder="Email, CPF, telefone ou chave aleatória" value={pixKey} onChangeText={setPixKey} autoCapitalize="none" />
                    <Text style={s.bankLabel}>Banco</Text>
                    <TextInput style={s.input} placeholder="Ex: Itaú, Nubank, Bradesco..." value={banco} onChangeText={setBanco} />
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.bankLabel}>Agência</Text>
                        <TextInput style={s.input} placeholder="0001" value={agencia} onChangeText={setAgencia} keyboardType="numeric" />
                      </View>
                      <View style={{ flex: 2 }}>
                        <Text style={s.bankLabel}>Conta</Text>
                        <TextInput style={s.input} placeholder="12345-6" value={conta} onChangeText={setConta} />
                      </View>
                    </View>
                    <Text style={s.bankLabel}>Tipo de Conta</Text>
                    <View style={s.tipoRow}>
                      <TouchableOpacity style={[s.tipoBtn, tipoConta === 'corrente' && s.tipoBtnActive]} onPress={() => setTipoConta('corrente')}>
                        <Ionicons name="card-outline" size={15} color={tipoConta === 'corrente' ? '#FFF' : '#4CAF50'} />
                        <Text style={[s.tipoBtnTxt, tipoConta === 'corrente' && s.tipoBtnTxtActive]}>Corrente</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[s.tipoBtn, tipoConta === 'poupanca' && s.tipoBtnActive]} onPress={() => setTipoConta('poupanca')}>
                        <Ionicons name="save-outline" size={15} color={tipoConta === 'poupanca' ? '#FFF' : '#4CAF50'} />
                        <Text style={[s.tipoBtnTxt, tipoConta === 'poupanca' && s.tipoBtnTxtActive]}>Poupança</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={[s.saveBtn, bankSaving && { opacity: 0.7 }]} onPress={handleSaveBankData} disabled={bankSaving}>
                      {bankSaving
                        ? <ActivityIndicator size="small" color="#FFF" />
                        : <Text style={s.saveBtnTxt}>Salvar Dados Bancários</Text>
                      }
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </View>
        )}

        {/* ── 4. Configurações ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Configurações</Text>
          <ActionRow
            icon="lock-closed-outline"
            iconColor="#7B1FA2"
            label="Alterar Senha"
            sublabel="Atualize sua senha de acesso"
            onPress={() => setShowChangePwd(p => !p)}
          />
          {showChangePwd && (
            <View style={s.bankForm}>
              <TextInput style={s.input} placeholder="Senha atual" secureTextEntry value={oldPassword} onChangeText={setOldPassword} editable={!pwdLoading} />
              <TextInput style={s.input} placeholder="Nova senha" secureTextEntry value={newPassword} onChangeText={setNewPassword} editable={!pwdLoading} />
              <TextInput style={s.input} placeholder="Confirme a nova senha" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} editable={!pwdLoading} />
              <TouchableOpacity
                style={[s.saveBtn, { backgroundColor: '#7B1FA2' }, pwdLoading && { opacity: 0.7 }]}
                onPress={async () => {
                  if (!oldPassword || !newPassword) { showModal('Campos obrigatórios', 'Preencha a senha atual e a nova senha.', { type: 'warning' }); return; }
                  if (newPassword !== confirmPassword) { showModal('Senhas diferentes', 'A confirmação não coincide.', { type: 'error' }); return; }
                  setPwdLoading(true);
                  try {
                    await uaiMedApi.post('/auth/change-password', { oldPassword, newPassword });
                    setOldPassword(''); setNewPassword(''); setConfirmPassword('');
                    setShowChangePwd(false);
                    showModal('Senha alterada!', 'Sua senha foi atualizada com sucesso.', { type: 'success' });
                  } catch { showModal('Erro', 'Não foi possível alterar a senha.', { type: 'error' }); }
                  finally { setPwdLoading(false); }
                }}
              >
                <Text style={s.saveBtnTxt}>{pwdLoading ? 'Processando...' : 'Alterar Senha'}</Text>
              </TouchableOpacity>
            </View>
          )}
          <ActionRow
            icon="notifications-outline"
            iconColor="#1E88E5"
            label="Notificações"
            sublabel="Preferências de e-mail e push"
            onPress={() => setShowNotifications(p => !p)}
            last={!showNotifications}
          />
          {showNotifications && (
            <View style={s.bankForm}>
              <View style={s.switchRow}>
                <Text style={s.switchLabel}>Notificações por E-mail</Text>
                <Switch value={notifEmail} onValueChange={setNotifEmail} trackColor={{ true: '#4CAF50' }} />
              </View>
              <View style={[s.switchRow, { marginBottom: 12 }]}>
                <Text style={s.switchLabel}>Notificações Push</Text>
                <Switch value={notifPush} onValueChange={setNotifPush} trackColor={{ true: '#4CAF50' }} />
              </View>
              <TouchableOpacity
                style={[s.saveBtn, notifLoading && { opacity: 0.7 }]}
                onPress={async () => {
                  setNotifLoading(true);
                  try {
                    await uaiMedApi.post('/users/me/notifications', { email: notifEmail, push: notifPush });
                    setShowNotifications(false);
                    showModal('Preferências salvas!', 'Configurações de notificação atualizadas.', { type: 'success' });
                  } catch { showModal('Erro', 'Não foi possível salvar as preferências.', { type: 'error' }); }
                  finally { setNotifLoading(false); }
                }}
              >
                <Text style={s.saveBtnTxt}>{notifLoading ? 'Salvando...' : 'Salvar Preferências'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── 5. Sair ── */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={18} color="#FFF" />
          <Text style={s.logoutTxt}>Sair da Conta</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <AppModal {...modal} onClose={hideModal} />
    </View>
  );
};

// ── Estilos ──────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F0F2F5' },
  loadingBg: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  errBtn: { backgroundColor: '#4CAF50', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },

  // Header do perfil
  profileHeader: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 16,
    paddingBottom: 20,
    elevation: 6,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  avatarCircle: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarTxt: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  profileName: { fontSize: 17, fontWeight: '800', color: '#FFF' },
  typeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3,
    marginTop: 5, alignSelf: 'flex-start',
  },
  typeBadgeTxt: { fontSize: 11, color: '#E8F5E9', fontWeight: '600' },
  ratingInline: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  ratingTxt: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },

  // ScrollView
  scrollContent: { padding: 10, paddingBottom: 20 },

  // Card
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },

  // InfoRow
  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F3F3', marginBottom: 0,
  },
  iconBox: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0,
  },
  infoLabel: { fontSize: 10, color: '#BBB', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  infoValue: { fontSize: 14, color: '#1A1A1A', fontWeight: '600', marginTop: 1 },

  // ActionRow
  actionRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F3F3F3',
  },
  actionLabel: { fontSize: 14, color: '#1A1A1A', fontWeight: '600' },
  actionSub: { fontSize: 11, color: '#BBB', marginTop: 1 },

  // Bank / forms
  bankForm: { paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F3F3', marginTop: 4 },
  bankLabel: { fontSize: 11, fontWeight: '700', color: '#888', marginBottom: 4, marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.3 },
  input: {
    borderWidth: 1, borderColor: '#EBEBEB', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 11,
    backgroundColor: '#FAFAFA', marginBottom: 8, fontSize: 14, color: '#333',
  },
  tipoRow: { flexDirection: 'row', gap: 8, marginVertical: 8 },
  tipoBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: '#4CAF50',
  },
  tipoBtnActive: { backgroundColor: '#4CAF50' },
  tipoBtnTxt: { fontSize: 13, fontWeight: '600', color: '#4CAF50' },
  tipoBtnTxtActive: { color: '#FFF' },
  saveBtn: {
    backgroundColor: '#4CAF50', borderRadius: 10,
    paddingVertical: 12, alignItems: 'center', marginTop: 8,
  },
  saveBtnTxt: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  // Switch
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F3F3' },
  switchLabel: { fontSize: 14, color: '#333', fontWeight: '500' },

  // Logout
  logoutBtn: {
    backgroundColor: '#D9534F',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 16, paddingVertical: 14, marginBottom: 4,
    elevation: 2, shadowColor: '#D9534F', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  logoutTxt: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});

export default PerfilScreen;

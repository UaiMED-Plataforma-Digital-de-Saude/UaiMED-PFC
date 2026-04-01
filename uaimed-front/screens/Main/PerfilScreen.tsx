import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput, Switch } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useAvaliacoes } from '../../hooks/useAvaliacoes';

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
 * Componente para um item de ação clicável
 */
const ActionItem: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}> = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.actionItem} onPress={onPress}>
    <Ionicons name={icon} size={24} color="#4B73B2" />
    <Text style={styles.actionText}>{label}</Text>
    <Ionicons name="chevron-forward" size={24} color="#CCC" />
  </TouchableOpacity>
);

/**
 * PerfilScreen
 * Exibe informações do usuário e opções de configuração
 */
const PerfilScreen: React.FC<PerfilScreenProps> = () => {
  const { user, signOut } = useAuth();
  // Para médicos, usa o ID do profissional (não o ID do usuário) para buscar avaliações
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

  // Função para lidar com o Logout
  const handleLogout = () => {
    Alert.alert(
      "Sair da Conta",
      "Tem certeza de que deseja encerrar sua sessão no UaiMED?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Sim, Sair", 
          onPress: () => signOut(), // Chama a função signOut do AuthContext
          style: "destructive"
        }
      ]
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
      <Text style={styles.headerTitle}>Meu Perfil</Text>
      
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
                    <Text style={styles.infoValue}>{notaMedia ? `${notaMedia.toFixed(1)} / 5` : 'Sem avaliações'}</Text>
                  )}
                </View>
              </View>
            )}
            <ProfileInfoRow icon="id-card-outline" label="Tipo de Conta" value={user.tipo === 'paciente' ? 'Paciente' : user.tipo === 'medico' ? 'Médico' : 'Clínica'} />
            <ProfileInfoRow icon="call-outline" label="Telefone" value={user.telefone || 'Não informado'} />
            <ProfileInfoRow icon="wallet-outline" label="CPF/CNPJ" value={user.cpf || user.cnpj || 'Não informado'} />
        </View>

        {/* 2. SEÇÃO DE CONFIGURAÇÕES */}
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
                      Alert.alert('Atenção', 'Preencha as senhas.');
                      return;
                    }
                    if (newPassword !== confirmPassword) {
                      Alert.alert('Atenção', 'A confirmação da senha não coincide.');
                      return;
                    }
                    setPwdLoading(true);
                    try {
                      // Tenta chamar endpoint real; se falhar, simulamos sucesso
                      await import('../../api/uaiMedApi').then(async ({ default: api }) => {
                        await api.post('/auth/change-password', { oldPassword, newPassword });
                      });
                      Alert.alert('Sucesso', 'Senha alterada com sucesso.');
                      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
                      setShowChangePwd(false);
                    } catch (e) {
                      console.warn('Erro ao alterar senha:', e);
                      Alert.alert('Erro', 'Não foi possível alterar a senha. Tente novamente.');
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
                      Alert.alert('Sucesso', 'Preferências salvas.');
                      setShowNotifications(false);
                    } catch (e) {
                      console.warn('Erro ao salvar notificações', e);
                      Alert.alert('Erro', 'Não foi possível salvar as preferências.');
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

        {/* 3. AÇÃO DE LOGOUT */}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  headerTitle: { 
    fontSize: 26, 
    fontWeight: '700', 
    padding: 20, 
    paddingTop: 56,
    marginTop: 8,
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
  }
});

export default PerfilScreen;

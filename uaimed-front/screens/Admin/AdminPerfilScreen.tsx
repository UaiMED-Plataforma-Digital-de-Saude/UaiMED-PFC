import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { isArticleAdmin } from '../../utils/articleAdmin';
import { useModal } from '../../hooks/useModal';
import AppModal from '../../components/AppModal';
import uaiMedApi from '../../api/uaiMedApi';

type Props = BottomTabScreenProps<MainTabParamList, 'Perfil'>;

const AdminPerfilScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateUser, signOut } = useAuth();
  const { modal, showModal, hideModal } = useModal();
  const [nome, setNome] = useState(user?.nome ?? '');
  const [telefone, setTelefone] = useState(user?.telefone ?? '');
  const [salvando, setSalvando] = useState(false);
  const [alterarSenha, setAlterarSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  useFocusEffect(useCallback(() => {
    setNome(user?.nome ?? '');
    setTelefone(user?.telefone ?? '');
    setAlterarSenha(false);
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmacao('');
  }, [user?.nome, user?.telefone]));

  if (!isArticleAdmin(user) || !user) return null;

  const salvarDados = async () => {
    if (salvando) return;
    if (!nome.trim() || !telefone.trim()) {
      showModal('Campos obrigatórios', 'Preencha o nome e o telefone.', { type: 'warning' });
      return;
    }
    setSalvando(true);
    try {
      const { data } = await uaiMedApi.put('/users/me', {
        nome: nome.trim(), telefone: telefone.trim(),
        endereco: user.endereco, cidade: user.cidade, estado: user.estado, cep: user.cep,
      });
      await updateUser(data.user);
      showModal('Dados atualizados', 'Os dados da conta foram salvos.', { type: 'success' });
    } catch (error: any) {
      showModal('Não foi possível salvar', error?.response?.data?.error || 'Tente novamente.', { type: 'error' });
    } finally { setSalvando(false); }
  };

  const salvarSenha = async () => {
    if (salvandoSenha) return;
    if (!senhaAtual || novaSenha.length < 6) {
      showModal('Confira os campos', 'Informe a senha atual e uma nova senha com pelo menos 6 caracteres.', { type: 'warning' });
      return;
    }
    if (novaSenha !== confirmacao) {
      showModal('Senhas diferentes', 'A confirmação deve coincidir com a nova senha.', { type: 'warning' });
      return;
    }
    setSalvandoSenha(true);
    try {
      await uaiMedApi.post('/auth/change-password', { oldPassword: senhaAtual, newPassword: novaSenha });
      setSenhaAtual(''); setNovaSenha(''); setConfirmacao(''); setAlterarSenha(false);
      showModal('Senha alterada', 'Sua senha foi atualizada com sucesso.', { type: 'success' });
    } catch (error: any) {
      showModal('Não foi possível alterar', error?.response?.data?.error || 'Tente novamente.', { type: 'error' });
    } finally { setSalvandoSenha(false); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.identity}>
          {user.avatar ? <Image source={{ uri: user.avatar }} style={styles.avatar} /> : (
            <View style={styles.avatar}><Ionicons name="shield-checkmark" size={34} color="#FFF" /></View>
          )}
          <Text style={styles.name}>{user.nome}</Text>
          <Text style={styles.role}>Administrador UaiMED</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dados da conta</Text>
          <Text style={styles.label}>Nome</Text>
          <TextInput style={styles.input} value={nome} onChangeText={setNome} editable={!salvando} accessibilityLabel="Nome do administrador" autoComplete="name" />
          <Text style={styles.label}>Telefone</Text>
          <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} editable={!salvando} keyboardType="phone-pad" accessibilityLabel="Telefone do administrador" autoComplete="tel" />
          <TouchableOpacity style={[styles.primaryButton, salvando && styles.disabled]} onPress={salvarDados} disabled={salvando} accessibilityRole="button">
            {salvando ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryText}>Salvar dados</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Administração de conteúdo</Text>
          <Text style={styles.description}>Esta conta gerencia os artigos e seleciona os profissionais e as clínicas em destaque.</Text>
          <TouchableOpacity style={styles.action} accessibilityRole="button" onPress={() => navigation.navigate('AdminArtigos')}>
            <Ionicons name="newspaper-outline" size={22} color="#388E3C" />
            <Text style={styles.actionText}>Gerenciar artigos</Text>
            <Ionicons name="chevron-forward" size={18} color="#8B9B90" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.action} accessibilityRole="button" onPress={() => navigation.navigate('AdminDestaques')}>
            <Ionicons name="star-outline" size={22} color="#388E3C" />
            <Text style={styles.actionText}>Gerenciar destaques</Text>
            <Ionicons name="chevron-forward" size={18} color="#8B9B90" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Segurança</Text>
          <TouchableOpacity style={styles.action} accessibilityRole="button" onPress={() => setAlterarSenha(v => !v)}>
            <Ionicons name="lock-closed-outline" size={21} color="#388E3C" />
            <Text style={styles.actionText}>Alterar senha</Text>
            <Ionicons name={alterarSenha ? 'chevron-up' : 'chevron-down'} size={18} color="#8B9B90" />
          </TouchableOpacity>
          {alterarSenha && (
            <View style={styles.passwordForm}>
              <Text style={styles.label}>Senha atual</Text>
              <TextInput style={styles.input} value={senhaAtual} onChangeText={setSenhaAtual} secureTextEntry editable={!salvandoSenha} accessibilityLabel="Senha atual" autoComplete="current-password" />
              <Text style={styles.label}>Nova senha</Text>
              <TextInput style={styles.input} value={novaSenha} onChangeText={setNovaSenha} secureTextEntry editable={!salvandoSenha} accessibilityLabel="Nova senha" autoComplete="new-password" />
              <Text style={styles.label}>Confirme a nova senha</Text>
              <TextInput style={styles.input} value={confirmacao} onChangeText={setConfirmacao} secureTextEntry editable={!salvandoSenha} accessibilityLabel="Confirmação da nova senha" autoComplete="new-password" />
              <TouchableOpacity style={[styles.primaryButton, salvandoSenha && styles.disabled]} onPress={salvarSenha} disabled={salvandoSenha} accessibilityRole="button">
                {salvandoSenha ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryText}>Salvar nova senha</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.logout}
          accessibilityRole="button"
          onPress={() => showModal('Sair da conta', 'Deseja encerrar a sessão administrativa?', {
            type: 'confirm', buttons: [{ text: 'Cancelar', style: 'cancel' }, { text: 'Sair', style: 'destructive', onPress: () => { void signOut(); } }],
          })}
        >
          <Ionicons name="log-out-outline" size={21} color="#B34242" />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
      <AppModal {...modal} onClose={hideModal} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7F5' },
  content: { padding: 20, paddingBottom: 32 },
  identity: { alignItems: 'center', padding: 24, backgroundColor: '#FFF', borderRadius: 20, marginBottom: 20 },
  avatar: { width: 76, height: 76, borderRadius: 24, backgroundColor: '#214B35', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  name: { fontSize: 22, fontWeight: '800', color: '#273E30', textAlign: 'center' },
  role: { marginTop: 10, color: '#388E3C', backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, fontWeight: '700', fontSize: 12 },
  email: { color: '#7A897F', fontSize: 13, marginTop: 12 },
  card: { padding: 20, backgroundColor: '#FFF', borderRadius: 16, marginBottom: 16 },
  sectionTitle: { color: '#273E30', fontSize: 17, fontWeight: '700', marginBottom: 16 },
  description: { color: '#728078', fontSize: 13, lineHeight: 21, marginBottom: 8 },
  label: { color: '#58665D', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#F8FAF9', borderWidth: 1, borderColor: '#E1E8E3', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#273E30', marginBottom: 16 },
  primaryButton: { minHeight: 48, padding: 14, borderRadius: 10, backgroundColor: '#388E3C', alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  disabled: { opacity: 0.6 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48 },
  actionText: { flex: 1, color: '#365540', fontSize: 14, fontWeight: '600' },
  passwordForm: { marginTop: 14 },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 50, borderRadius: 12, backgroundColor: '#FAECEC' },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#B34242' },
});

export default AdminPerfilScreen;

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import uaiMedApi from '../../api/uaiMedApi';
import { Ionicons } from '@expo/vector-icons';
import AppModal from '../../components/AppModal';
import { useModal } from '../../hooks/useModal';

type CadastroScreenProps = StackScreenProps<AuthStackParamList, 'Cadastro'>;

const CadastroScreen: React.FC<CadastroScreenProps> = ({ navigation, route }) => {
  const initialTipo = route?.params?.tipoUsuario ?? 'paciente';
  const hideTipoSelector = Boolean(route?.params?.tipoUsuario);

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tipo, setTipo] = useState<'paciente' | 'medico' | 'clinica'>(initialTipo);
  const [especialidade, setEspecialidade] = useState('');
  const [crm, setCrm] = useState('');
  const [dataFormacao, setDataFormacao] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cep, setCep] = useState('');

  const { modal, showModal, hideModal } = useModal();

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatCPF = (v: string) => {
    const c = v.replace(/\D/g, '');
    if (c.length <= 3) return c;
    if (c.length <= 6) return `${c.slice(0, 3)}.${c.slice(3)}`;
    if (c.length <= 9) return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6)}`;
    return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9, 11)}`;
  };

  const formatPhone = (v: string) => {
    const c = v.replace(/\D/g, '');
    if (c.length <= 2) return c;
    if (c.length <= 7) return `(${c.slice(0, 2)}) ${c.slice(2)}`;
    return `(${c.slice(0, 2)}) ${c.slice(2, 7)}-${c.slice(7, 11)}`;
  };

  const isValidCPF = (v: string) => {
    const c = v.replace(/\D/g, '');
    if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
    let s = 0, r;
    for (let i = 1; i <= 9; i++) s += parseInt(c[i - 1]) * (11 - i);
    r = (s * 10) % 11;
    if (r === 10 || r === 11) r = 0;
    if (r !== parseInt(c[9])) return false;
    s = 0;
    for (let i = 1; i <= 10; i++) s += parseInt(c[i - 1]) * (12 - i);
    r = (s * 10) % 11;
    if (r === 10 || r === 11) r = 0;
    return r === parseInt(c[10]);
  };

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isValidPassword = (v: string) => v.length >= 6;

  // ── Cadastro ───────────────────────────────────────────────────────────────
  const handleCadastro = async () => {
    if (!nome.trim()) {
      showModal('Campo obrigatório', 'Preencha seu nome completo.', { type: 'warning' }); return;
    }
    if (!isValidCPF(cpf)) {
      showModal('CPF inválido', 'Verifique o número de CPF digitado.', { type: 'error' }); return;
    }
    if (!isValidEmail(email)) {
      showModal('E-mail inválido', 'Verifique o formato do e-mail.', { type: 'error' }); return;
    }
    if (!telefone.replace(/\D/g, '') || telefone.replace(/\D/g, '').length < 10) {
      showModal('Telefone inválido', 'Verifique o número de telefone.', { type: 'error' }); return;
    }
    if (!isValidPassword(senha)) {
      showModal('Senha fraca', 'A senha deve ter pelo menos 6 caracteres.', { type: 'warning' }); return;
    }
    if (senha !== confirmaSenha) {
      showModal('Senhas diferentes', 'A confirmação da senha não coincide.', { type: 'error' }); return;
    }
    if (tipo === 'medico' && (!especialidade.trim() || !crm.trim())) {
      showModal('Dados incompletos', 'Preencha especialidade e CRM para prosseguir.', { type: 'warning' }); return;
    }

    setLoading(true);
    try {
      const payload: any = {
        nome: nome.trim(), cpf: cpf.replace(/\D/g, ''),
        email: email.trim(), telefone: telefone.replace(/\D/g, ''),
        senha, tipo,
      };
      if (tipo === 'medico') {
        Object.assign(payload, {
          especialidade: especialidade.trim(), crm: crm.trim(),
          ...(dataFormacao ? { dataFormacao } : {}),
          endereco: endereco.trim(), cidade: cidade.trim(),
          estado: estado.trim(), cep: cep.replace(/\D/g, ''),
        });
      }
      const res = await uaiMedApi.post('/usuarios', payload);
      if (res.status === 201 || res.status === 200) {
        setNome(''); setCpf(''); setEmail(''); setTelefone(''); setSenha(''); setConfirmaSenha('');
        showModal('Cadastro realizado!', 'Seu cadastro foi concluído. Faça login para continuar.', {
          type: 'success',
          buttons: [{ text: 'Fazer Login', onPress: () => navigation.navigate('Login') }],
        });
      }
    } catch (err: any) {
      const msg = err.response?.status === 409
        ? 'CPF ou E-mail já cadastrado.'
        : err.response?.data?.message
          ?? (err.message === 'Network Error' ? 'Erro de conexão. Verifique sua internet.' : 'Não foi possível completar o cadastro.');
      showModal('Erro no Cadastro', msg, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoid}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.headerSection}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Novo Cadastro</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nome Completo *</Text>
              <TextInput style={styles.input} placeholder="João Silva" value={nome} onChangeText={setNome} editable={!loading} />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>CPF *</Text>
              <TextInput style={styles.input} placeholder="000.000.000-00" value={formatCPF(cpf)} onChangeText={setCpf} keyboardType="numeric" editable={!loading} />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>E-mail *</Text>
              <TextInput style={styles.input} placeholder="seu@email.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} editable={!loading} />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Telefone *</Text>
              <TextInput style={styles.input} placeholder="(11) 98765-4321" keyboardType="phone-pad" value={formatPhone(telefone)} onChangeText={setTelefone} editable={!loading} />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Senha *</Text>
              <View style={styles.passwordContainer}>
                <TextInput style={styles.passwordInput} placeholder="••••••••" secureTextEntry={!showPassword} value={senha} onChangeText={setSenha} editable={!loading} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={loading}>
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#999" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmar Senha *</Text>
              <View style={styles.passwordContainer}>
                <TextInput style={styles.passwordInput} placeholder="••••••••" secureTextEntry={!showConfirmPassword} value={confirmaSenha} onChangeText={setConfirmaSenha} editable={!loading} />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading}>
                  <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={24} color="#999" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {!hideTipoSelector && (
            <View style={[styles.inputContainer, { marginTop: 6 }]}>
              <Text style={styles.label}>Você é</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {(['paciente', 'medico'] as const).map(t => (
                  <TouchableOpacity key={t} style={[styles.pill, tipo === t ? styles.pillActive : styles.pillInactive]} onPress={() => setTipo(t)}>
                    <Text style={tipo === t ? styles.pillTextActive : styles.pillTextInactive}>{t === 'paciente' ? 'Paciente' : 'Profissional'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {tipo === 'medico' && (
            <>
              <View style={styles.inputContainer}><Text style={styles.label}>Especialidade *</Text><TextInput style={styles.input} placeholder="Cardiologia" value={especialidade} onChangeText={setEspecialidade} editable={!loading} /></View>
              <View style={styles.inputContainer}><Text style={styles.label}>CRM *</Text><TextInput style={styles.input} placeholder="CRM00000" value={crm} onChangeText={setCrm} editable={!loading} /></View>
              <View style={styles.inputContainer}><Text style={styles.label}>Data de Formação</Text><TextInput style={styles.input} placeholder="YYYY-MM-DD" value={dataFormacao} onChangeText={setDataFormacao} editable={!loading} /></View>
              <View style={styles.inputContainer}><Text style={styles.label}>Endereço</Text><TextInput style={styles.input} placeholder="Rua, número" value={endereco} onChangeText={setEndereco} editable={!loading} /></View>
              <View style={styles.inputContainer}><Text style={styles.label}>Cidade</Text><TextInput style={styles.input} placeholder="Cidade" value={cidade} onChangeText={setCidade} editable={!loading} /></View>
              <View style={styles.inputContainer}><Text style={styles.label}>Estado</Text><TextInput style={styles.input} placeholder="Estado" value={estado} onChangeText={setEstado} editable={!loading} /></View>
              <View style={styles.inputContainer}><Text style={styles.label}>CEP</Text><TextInput style={styles.input} placeholder="00000-000" value={cep} onChangeText={setCep} editable={!loading} keyboardType="numeric" /></View>
            </>
          )}

          <View style={styles.buttonsSection}>
            <TouchableOpacity style={[styles.buttonPrimary, loading && styles.buttonDisabled]} onPress={handleCadastro} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>CADASTRAR</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonSecondary} onPress={() => navigation.goBack()} disabled={loading}>
              <Text style={styles.buttonSecondaryText}>Voltar ao Login</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.requiredNote}>* Campo obrigatório</Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <AppModal {...modal} onClose={hideModal} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  keyboardAvoid: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 30 },
  headerSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 30 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  formSection: { flex: 1 },
  inputContainer: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#333' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#DDD', borderRadius: 8, paddingHorizontal: 12 },
  passwordInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#333' },
  buttonsSection: { marginTop: 20, gap: 12 },
  buttonPrimary: { backgroundColor: '#4CAF50', borderRadius: 8, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonSecondary: { borderWidth: 1, borderColor: '#4CAF50', borderRadius: 8, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  buttonSecondaryText: { color: '#4CAF50', fontSize: 16, fontWeight: 'bold' },
  requiredNote: { fontSize: 12, color: '#999', textAlign: 'center', marginTop: 10 },
  pill: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20 },
  pillActive: { backgroundColor: '#4CAF50' },
  pillInactive: { backgroundColor: '#F0F0F0' },
  pillTextActive: { color: '#FFF', fontWeight: '600' },
  pillTextInactive: { color: '#333', fontWeight: '600' },
});

export default CadastroScreen;

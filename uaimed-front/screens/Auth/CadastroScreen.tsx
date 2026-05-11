import React, { useState, useEffect } from 'react';
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

// Enumerado conforme solicitado
enum TipoUsuario {
  CLIENTE = 1,
  PROFISSIONAL = 2,
  CLINICA = 3,
}

const CadastroScreen: React.FC<CadastroScreenProps> = ({ navigation, route }) => {
  // Mapeamento inicial baseado nos params
  const getInitialTipo = () => {
    const param = route?.params?.tipoUsuario;
    if (param === 'medico') return TipoUsuario.PROFISSIONAL;
    if (param === 'clinica') return TipoUsuario.CLINICA;
    return TipoUsuario.CLIENTE;
  };

  const [tipo, setTipo] = useState<TipoUsuario>(getInitialTipo());
  const [nome, setNome] = useState('');
  const [documento, setDocumento] = useState(''); // CPF ou CNPJ
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Campos específicos
  const [especialidade, setEspecialidade] = useState('');
  const [crm, setCrm] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cep, setCep] = useState('');

  const { modal, showModal, hideModal } = useModal();

  // Limpa campos específicos ao trocar de aba
  useEffect(() => {
    setDocumento('');
  }, [tipo]);

  // ── Formatadores ───────────────────────────────────────────────────────────
  const formatCPF = (v: string) => {
    const c = v.replace(/\D/g, '');
    return c.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').substring(0, 14);
  };

  const formatCNPJ = (v: string) => {
    const c = v.replace(/\D/g, '');
    return c.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5').substring(0, 18);
  };

  const formatPhone = (v: string) => {
    const c = v.replace(/\D/g, '');
    if (c.length <= 10) return c.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    return c.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  // ── Cadastro ───────────────────────────────────────────────────────────────
  const handleCadastro = async () => {
    if (!nome.trim() || !documento || !email || !senha) {
      showModal('Campos obrigatórios', 'Por favor, preencha todos os campos marcados com *', { type: 'warning' });
      return;
    }

    if (senha !== confirmaSenha) {
      showModal('Erro na senha', 'As senhas não coincidem.', { type: 'error' });
      return;
    }

    setLoading(true);
    try {
      // Mapeia o tipo numérico para o que o backend espera (ou envia o número se o backend já aceitar)
      const tipoBackend = tipo === TipoUsuario.CLIENTE ? 'paciente' : (tipo === TipoUsuario.PROFISSIONAL ? 'medico' : 'clinica');

      const payload: any = {
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.replace(/\D/g, ''),
        senha,
        tipo: tipoBackend, // Mantendo string para compatibilidade, ou use 'tipo' para enviar 1, 2, 3
        tipoEnum: tipo, // Enviando o enumerado como campo adicional
      };

      if (tipo === TipoUsuario.CLINICA) {
        payload.cnpj = documento.replace(/\D/g, '');
        payload.endereco = endereco;
        payload.cidade = cidade;
        payload.estado = estado;
        payload.cep = cep.replace(/\D/g, '');
      } else {
        payload.cpf = documento.replace(/\D/g, '');
      }

      if (tipo === TipoUsuario.PROFISSIONAL) {
        payload.especialidade = especialidade;
        payload.crm = crm;
        payload.endereco = endereco;
        payload.cidade = cidade;
        payload.estado = estado;
        payload.cep = cep.replace(/\D/g, '');
      }

      const res = await uaiMedApi.post('/usuarios', payload);

      showModal('Sucesso!', 'Seu cadastro foi realizado com sucesso.', {
        type: 'success',
        buttons: [{ text: 'Ir para Login', onPress: () => navigation.navigate('Login') }]
      });
    } catch (err: any) {
      showModal('Erro', err.response?.data?.error || 'Não foi possível realizar o cadastro.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Criar Conta</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* TAB SELECTOR */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, tipo === TipoUsuario.CLIENTE && styles.activeTab]}
              onPress={() => setTipo(TipoUsuario.CLIENTE)}
            >
              <Text style={[styles.tabText, tipo === TipoUsuario.CLIENTE && styles.activeTabText]}>Cliente</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, tipo === TipoUsuario.PROFISSIONAL && styles.activeTab]}
              onPress={() => setTipo(TipoUsuario.PROFISSIONAL)}
            >
              <Text style={[styles.tabText, tipo === TipoUsuario.PROFISSIONAL && styles.activeTabText]}>Profissional</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, tipo === TipoUsuario.CLINICA && styles.activeTab]}
              onPress={() => setTipo(TipoUsuario.CLINICA)}
            >
              <Text style={[styles.tabText, tipo === TipoUsuario.CLINICA && styles.activeTabText]}>Clínica</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>{tipo === TipoUsuario.CLINICA ? 'Razão Social *' : 'Nome Completo *'}</Text>
            <TextInput
              style={styles.input}
              placeholder={tipo === TipoUsuario.CLINICA ? "Ex: Clínica Saúde Ltda" : "Ex: João Silva"}
              value={nome}
              onChangeText={setNome}
            />

            <Text style={styles.label}>{tipo === TipoUsuario.CLINICA ? 'CNPJ *' : 'CPF *'}</Text>
            <TextInput
              style={styles.input}
              placeholder={tipo === TipoUsuario.CLINICA ? "00.000.000/0000-00" : "000.000.000-00"}
              keyboardType="numeric"
              value={tipo === TipoUsuario.CLINICA ? formatCNPJ(documento) : formatCPF(documento)}
              onChangeText={setDocumento}
            />

            <Text style={styles.label}>E-mail *</Text>
            <TextInput
              style={styles.input}
              placeholder="exemplo@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Telefone *</Text>
            <TextInput
              style={styles.input}
              placeholder="(31) 99999-9999"
              keyboardType="phone-pad"
              value={formatPhone(telefone)}
              onChangeText={setTelefone}
            />

            {/* Campos de Profissional */}
            {tipo === TipoUsuario.PROFISSIONAL && (
              <>
                <Text style={styles.label}>Especialidade *</Text>
                <TextInput style={styles.input} placeholder="Ex: Cardiologia" value={especialidade} onChangeText={setEspecialidade} />

                <Text style={styles.label}>CRM *</Text>
                <TextInput style={styles.input} placeholder="000000-MG" value={crm} onChangeText={setCrm} />
              </>
            )}

            {/* Campos de Endereço (Profissional e Clínica) */}
            {(tipo === TipoUsuario.PROFISSIONAL || tipo === TipoUsuario.CLINICA) && (
              <>
                <Text style={styles.label}>Endereço Completo</Text>
                <TextInput style={styles.input} placeholder="Rua, Número, Bairro" value={endereco} onChangeText={setEndereco} />

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.label}>Cidade</Text>
                    <TextInput style={styles.input} placeholder="Belo Horizonte" value={cidade} onChangeText={setCidade} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>UF</Text>
                    <TextInput style={styles.input} placeholder="MG" maxLength={2} autoCapitalize="characters" value={estado} onChangeText={setEstado} />
                  </View>
                </View>
              </>
            )}

            <Text style={styles.label}>Senha *</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                secureTextEntry={!showPassword}
                value={senha}
                onChangeText={setSenha}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirmar Senha *</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                secureTextEntry={!showConfirmPassword}
                value={confirmaSenha}
                onChangeText={setConfirmaSenha}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.btnPrimary, loading && { opacity: 0.7 }]}
              onPress={handleCadastro}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>CADASTRAR</Text>}
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
      <AppModal {...modal} onClose={hideModal} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  scrollContent: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#F5F5F5', borderRadius: 10, padding: 4, marginBottom: 25 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#FFF', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  tabText: { fontSize: 14, color: '#666', fontWeight: '600' },
  activeTabText: { color: '#4CAF50' },
  form: { flex: 1 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 8, marginTop: 12 },
  input: { borderBottomWidth: 1.5, borderColor: '#EEE', paddingVertical: 8, fontSize: 16, color: '#333' },
  passwordWrapper: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1.5, borderColor: '#EEE' },
  passwordInput: { flex: 1, paddingVertical: 8, fontSize: 16 },
  btnPrimary: { backgroundColor: '#4CAF50', paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginTop: 40 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});

export default CadastroScreen;

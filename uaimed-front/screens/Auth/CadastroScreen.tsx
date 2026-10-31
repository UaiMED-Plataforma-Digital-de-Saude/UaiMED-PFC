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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import uaiMedApi from '../../api/uaiMedApi';
import { Ionicons } from '@expo/vector-icons';
import AppModal from '../../components/AppModal';
import { useModal } from '../../hooks/useModal';
import { TipoCadastro, TipoUsuario } from '../../types/usuario';
import EspecialidadeDropdown from '../../components/EspecialidadeDropdown';
import { LGPD_POLICY_TEXT } from '../../constants/lgpdPolicy';
import { CADASTRO_LIMITES, ErrosCadastro, DadosCadastro, formatarTelefone, limitarDigitos, validarCadastro } from '../../utils/cadastroValidation';

type CadastroScreenProps = StackScreenProps<AuthStackParamList, 'Cadastro'>;

const CadastroScreen: React.FC<CadastroScreenProps> = ({ navigation, route }) => {
  // Mapeamento inicial baseado nos params
  const getInitialTipo = (): TipoCadastro => {
    const param = route?.params?.tipoUsuario;
    if (param === TipoUsuario.MEDICO) return TipoUsuario.MEDICO;
    if (param === TipoUsuario.CLINICA) return TipoUsuario.CLINICA;
    return TipoUsuario.PACIENTE;
  };

  const [tipo, setTipo] = useState<TipoCadastro>(getInitialTipo());
  const [nome, setNome] = useState('');
  const [documento, setDocumento] = useState(''); // CPF ou CNPJ
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [aceitaLgpd, setAceitaLgpd] = useState(false);
  const [showPoliticaModal, setShowPoliticaModal] = useState(false);
  const [erros, setErros] = useState<ErrosCadastro>({});

  // Campos específicos
  const [especialidade, setEspecialidade] = useState('');
  const [crm, setCrm] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cep, setCep] = useState('');

  const { modal, showModal, hideModal } = useModal();

  // ── Formatadores ───────────────────────────────────────────────────────────
  const formatCPF = (v: string) => {
    const c = v.replace(/\D/g, '');
    return c.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').substring(0, 14);
  };

  const formatCNPJ = (v: string) => {
    const c = v.replace(/\D/g, '');
    return c.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5').substring(0, 18);
  };

  const atualizarCampo = (campo: keyof DadosCadastro, valor: string, atualizar: (valor: string) => void) => {
    atualizar(valor);
    setErros((atuais) => ({ ...atuais, [campo]: undefined }));
  };

  const erroCampo = (campo: keyof DadosCadastro) => erros[campo]
    ? <Text accessibilityRole="alert" style={styles.erroTexto}>{erros[campo]}</Text>
    : null;
  const estiloCampo = (campo: keyof DadosCadastro) => [styles.input, erros[campo] && styles.inputErro];

  // ── Cadastro ───────────────────────────────────────────────────────────────
  const handleCadastro = async () => {
    if (loading) return;
    const errosValidacao = validarCadastro({ tipo, nome, documento, email, telefone, senha, confirmaSenha, especialidade, crm, endereco, cidade, estado, cep, aceitaLgpd });
    setErros(errosValidacao);
    if (Object.keys(errosValidacao).length > 0) {
      showModal('Revise o cadastro', Object.values(errosValidacao)[0]!, { type: 'warning' });
      return;
    }

    const documentoNumeros = documento.replace(/\D/g, '');
    setLoading(true);
    try {
      const payload: any = {
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.replace(/\D/g, ''),
        senha,
        tipo,
        consentimentoLgpd: aceitaLgpd,
      };

      if (tipo === TipoUsuario.CLINICA) {
        payload.cnpj = documentoNumeros;
        payload.endereco = endereco.trim();
        payload.cidade = cidade.trim();
        payload.estado = estado.trim().toUpperCase();
        payload.cep = cep.replace(/\D/g, '');
      } else {
        payload.cpf = documentoNumeros;
      }

      if (tipo === TipoUsuario.MEDICO) {
        payload.especialidade = especialidade;
        payload.crm = crm.trim().toUpperCase();
        payload.endereco = endereco.trim();
        payload.cidade = cidade.trim();
        payload.estado = estado.trim().toUpperCase();
        payload.cep = cep.replace(/\D/g, '');
      }

      await uaiMedApi.post('/usuarios', payload);

      showModal('Sucesso!', 'Seu cadastro foi realizado com sucesso.', {
        type: 'success',
        buttons: [{ text: 'Ir para Login', onPress: () => navigation.navigate('Login') }]
      });
    } catch (err: any) {
      const details = err.response?.data?.details;
      if (Array.isArray(details)) {
        const errosApi: ErrosCadastro = {};
        for (const detalhe of details) {
          const campo = detalhe?.path?.[0];
          const campoFormulario = campo === 'cpf' || campo === 'cnpj' ? 'documento'
            : campo === 'consentimentoLgpd' ? 'aceitaLgpd' : campo;
          if (typeof campoFormulario === 'string' && typeof detalhe.message === 'string') {
            errosApi[campoFormulario as keyof DadosCadastro] = detalhe.message;
          }
        }
        setErros(errosApi);
      }
      const validationMessage = Array.isArray(details)
        ? details.find((detail: any) => typeof detail?.message === 'string')?.message
        : undefined;
      const message = validationMessage
        || err.response?.data?.error
        || 'Não foi possível realizar o cadastro.';
      showModal('Erro', message, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Criar Conta</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* INDICADOR DE TIPO */}
          {(() => {
            const config = {
              [TipoUsuario.PACIENTE]: { icon: 'person-circle-outline' as const, label: 'Cadastro de Paciente',      cor: '#4CAF50', bg: '#F0F7F0' },
              [TipoUsuario.MEDICO]:   { icon: 'medical-outline' as const,        label: 'Cadastro de Médico',       cor: '#4B73B2', bg: '#EEF2FB' },
              [TipoUsuario.CLINICA]:      { icon: 'business-outline' as const,       label: 'Cadastro de Clínica',      cor: '#FF9800', bg: '#FFF8F0' },
            }[tipo];
            return (
              <View style={[styles.tipoBadge, { backgroundColor: config.bg, borderColor: config.cor }]}>
                <Ionicons name={config.icon} size={20} color={config.cor} />
                <Text style={[styles.tipoBadgeText, { color: config.cor }]}>{config.label}</Text>
              </View>
            );
          })()}

          <View style={styles.form}>
            <Text style={styles.label}>{tipo === TipoUsuario.CLINICA ? 'Razão Social *' : 'Nome Completo *'}</Text>
            <TextInput
              style={estiloCampo('nome')}
              placeholder={tipo === TipoUsuario.CLINICA ? "Ex: Clínica Saúde Ltda" : "Ex: João Silva"}
              value={nome}
              onChangeText={(valor) => atualizarCampo('nome', valor, setNome)}
              maxLength={CADASTRO_LIMITES.nome}
            />
            {erroCampo('nome')}

            <Text style={styles.label}>{tipo === TipoUsuario.CLINICA ? 'CNPJ *' : 'CPF *'}</Text>
            <TextInput
              style={estiloCampo('documento')}
              placeholder={tipo === TipoUsuario.CLINICA ? "00.000.000/0000-00" : "000.000.000-00"}
              keyboardType="numeric"
              value={tipo === TipoUsuario.CLINICA ? formatCNPJ(documento) : formatCPF(documento)}
              onChangeText={(value) => {
                const limite = tipo === TipoUsuario.CLINICA ? 14 : 11;
                atualizarCampo('documento', limitarDigitos(value, limite), setDocumento);
              }}
              maxLength={tipo === TipoUsuario.CLINICA ? 18 : 14}
            />
            {erroCampo('documento')}

            <Text style={styles.label}>E-mail *</Text>
            <TextInput
              style={estiloCampo('email')}
              placeholder="exemplo@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(valor) => atualizarCampo('email', valor, setEmail)}
              maxLength={CADASTRO_LIMITES.email}
              autoCorrect={false}
            />
            {erroCampo('email')}

            <Text style={styles.label}>Telefone *</Text>
            <TextInput
              style={estiloCampo('telefone')}
              placeholder="(31) 99999-9999"
              keyboardType="phone-pad"
              value={formatarTelefone(telefone)}
              onChangeText={(valor) => atualizarCampo('telefone', limitarDigitos(valor, CADASTRO_LIMITES.telefone), setTelefone)}
              maxLength={15}
            />
            {erroCampo('telefone')}

            {/* Campos de Profissional */}
            {tipo === TipoUsuario.MEDICO && (
              <>
                <Text style={styles.label}>Especialidade *</Text>
                <EspecialidadeDropdown
                  value={especialidade || null}
                  onChange={(value) => atualizarCampo('especialidade', value ?? '', setEspecialidade)}
                  disabled={loading}
                />
                {erroCampo('especialidade')}

                <Text style={styles.label}>CRM *</Text>
                <TextInput style={estiloCampo('crm')} placeholder="000000-MG" value={crm} onChangeText={(valor) => atualizarCampo('crm', valor.toUpperCase(), setCrm)} maxLength={CADASTRO_LIMITES.crm} autoCapitalize="characters" autoCorrect={false} />
                {erroCampo('crm')}
              </>
            )}

            {/* Campos de Endereço (Profissional e Clínica) */}
            {(tipo === TipoUsuario.MEDICO || tipo === TipoUsuario.CLINICA) && (
              <>
                <Text style={styles.label}>Endereço Completo</Text>
                <TextInput style={estiloCampo('endereco')} placeholder="Rua, Número, Bairro" value={endereco} onChangeText={(valor) => atualizarCampo('endereco', valor, setEndereco)} maxLength={CADASTRO_LIMITES.endereco} />
                {erroCampo('endereco')}

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.label}>Cidade</Text>
                    <TextInput style={estiloCampo('cidade')} placeholder="Belo Horizonte" value={cidade} onChangeText={(valor) => atualizarCampo('cidade', valor, setCidade)} maxLength={CADASTRO_LIMITES.cidade} />
                    {erroCampo('cidade')}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>UF</Text>
                    <TextInput style={estiloCampo('estado')} placeholder="MG" maxLength={2} autoCapitalize="characters" value={estado} onChangeText={(valor) => atualizarCampo('estado', valor.replace(/[^a-z]/gi, '').toUpperCase(), setEstado)} />
                    {erroCampo('estado')}
                  </View>
                </View>
                <Text style={styles.label}>CEP</Text>
                <TextInput style={estiloCampo('cep')} placeholder="00000-000" keyboardType="numeric" maxLength={9} value={cep.length > 5 ? `${cep.slice(0, 5)}-${cep.slice(5)}` : cep} onChangeText={(valor) => atualizarCampo('cep', limitarDigitos(valor, 8), setCep)} />
                {erroCampo('cep')}
              </>
            )}

            <Text style={styles.label}>Senha *</Text>
            <View style={[styles.passwordWrapper, erros.senha && styles.inputErro]}>
              <TextInput
                style={styles.passwordInput}
                secureTextEntry={!showPassword}
                value={senha}
                onChangeText={(valor) => atualizarCampo('senha', valor, setSenha)}
                maxLength={CADASTRO_LIMITES.senha}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#666" />
              </TouchableOpacity>
            </View>
            {erroCampo('senha')}

            <Text style={styles.label}>Confirmar Senha *</Text>
            <View style={[styles.passwordWrapper, erros.confirmaSenha && styles.inputErro]}>
              <TextInput
                style={styles.passwordInput}
                secureTextEntry={!showConfirmPassword}
                value={confirmaSenha}
                onChangeText={(valor) => atualizarCampo('confirmaSenha', valor, setConfirmaSenha)}
                maxLength={CADASTRO_LIMITES.senha}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#666" />
              </TouchableOpacity>
            </View>
            {erroCampo('confirmaSenha')}

            <View style={styles.lgpdRow}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => { setAceitaLgpd((v) => !v); setErros((atuais) => ({ ...atuais, aceitaLgpd: undefined })); }}
                hitSlop={10}
                accessibilityLabel="Aceitar a Política de Privacidade"
                accessibilityRole="checkbox"
                accessibilityState={{ checked: aceitaLgpd }}
              >
                <Ionicons
                  name={aceitaLgpd ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={aceitaLgpd ? '#4CAF50' : '#999'}
                />
              </TouchableOpacity>
              <Text style={styles.lgpdText}>
                Li e aceito a{' '}
                <Text style={styles.lgpdLink} onPress={() => setShowPoliticaModal(true)}>
                  Política de Privacidade (LGPD)
                </Text>
                {' *'}
              </Text>
            </View>
            {erroCampo('aceitaLgpd')}

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

      <Modal
        visible={showPoliticaModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPoliticaModal(false)}
      >
        <View style={styles.politicaOverlay}>
          <View style={styles.politicaCard}>
            <Text style={styles.politicaTitulo}>Política de Privacidade (LGPD)</Text>
            <ScrollView style={styles.politicaScroll}>
              <Text style={styles.politicaTexto}>{LGPD_POLICY_TEXT}</Text>
            </ScrollView>
            <TouchableOpacity style={styles.politicaFechar} onPress={() => setShowPoliticaModal(false)}>
              <Text style={styles.politicaFecharTexto}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  scrollContent: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  tipoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 24,
  },
  tipoBadgeText: { fontSize: 14, fontWeight: '700' },
  form: { flex: 1 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 8, marginTop: 12 },
  input: { borderBottomWidth: 1.5, borderColor: '#EEE', paddingVertical: 8, fontSize: 16, color: '#333' },
  inputErro: { borderColor: '#C62828' },
  erroTexto: { color: '#C62828', fontSize: 12, marginTop: 5 },
  passwordWrapper: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1.5, borderColor: '#EEE' },
  passwordInput: { flex: 1, paddingVertical: 8, fontSize: 16 },
  btnPrimary: { backgroundColor: '#4CAF50', paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginTop: 40 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  lgpdRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24, gap: 10 },
  checkbox: { padding: 2 },
  lgpdText: { flex: 1, fontSize: 13, color: '#444', lineHeight: 18 },
  lgpdLink: { color: '#4CAF50', fontWeight: '700', textDecorationLine: 'underline' },
  politicaOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  politicaCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 20, maxHeight: '80%' },
  politicaTitulo: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  politicaScroll: { marginBottom: 16 },
  politicaTexto: { fontSize: 14, color: '#444', lineHeight: 20 },
  politicaFechar: { backgroundColor: '#4CAF50', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  politicaFecharTexto: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
});

export default CadastroScreen;

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

    const documentoNumeros = documento.replace(/\D/g, '');
    const tamanhoDocumento = tipo === TipoUsuario.CLINICA ? 14 : 11;
    if (documentoNumeros.length !== tamanhoDocumento) {
      showModal(
        'Documento inválido',
        tipo === TipoUsuario.CLINICA
          ? 'O CNPJ deve possuir exatamente 14 dígitos.'
          : 'O CPF deve possuir exatamente 11 dígitos.',
        { type: 'warning' },
      );
      return;
    }

    if (tipo === TipoUsuario.MEDICO && (!especialidade || !crm.trim())) {
      showModal(
        'Dados profissionais obrigatórios',
        'Selecione uma especialidade e informe o CRM.',
        { type: 'warning' },
      );
      return;
    }

    if (senha !== confirmaSenha) {
      showModal('Erro na senha', 'As senhas não coincidem.', { type: 'error' });
      return;
    }

    if (!aceitaLgpd) {
      showModal(
        'Consentimento necessário',
        'É necessário aceitar a Política de Privacidade (LGPD) para continuar.',
        { type: 'warning' },
      );
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.replace(/\D/g, ''),
        senha,
        tipo,
        consentimentoLgpd: true,
      };

      if (tipo === TipoUsuario.CLINICA) {
        payload.cnpj = documentoNumeros;
        payload.endereco = endereco;
        payload.cidade = cidade;
        payload.estado = estado;
        payload.cep = cep.replace(/\D/g, '');
      } else {
        payload.cpf = documentoNumeros;
      }

      if (tipo === TipoUsuario.MEDICO) {
        payload.especialidade = especialidade;
        payload.crm = crm.trim();
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
      const details = err.response?.data?.details;
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
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

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
              onChangeText={(value) => {
                const limite = tipo === TipoUsuario.CLINICA ? 14 : 11;
                setDocumento(value.replace(/\D/g, '').slice(0, limite));
              }}
              maxLength={tipo === TipoUsuario.CLINICA ? 18 : 14}
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
            {tipo === TipoUsuario.MEDICO && (
              <>
                <Text style={styles.label}>Especialidade *</Text>
                <EspecialidadeDropdown
                  value={especialidade || null}
                  onChange={(value) => setEspecialidade(value ?? '')}
                  disabled={loading}
                />

                <Text style={styles.label}>CRM *</Text>
                <TextInput style={styles.input} placeholder="000000-MG" value={crm} onChangeText={setCrm} />
              </>
            )}

            {/* Campos de Endereço (Profissional e Clínica) */}
            {(tipo === TipoUsuario.MEDICO || tipo === TipoUsuario.CLINICA) && (
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

            <View style={styles.lgpdRow}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setAceitaLgpd((v) => !v)}
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
              <Text style={styles.politicaTexto}>
                A UaiMED coleta e trata seus dados pessoais (nome, CPF/CNPJ, e-mail, telefone e,
                quando aplicável, dados relacionados aos seus agendamentos e consultas) com as
                seguintes finalidades: viabilizar o seu cadastro, o agendamento de consultas, a
                comunicação entre pacientes e profissionais de saúde, e a geração de relatórios
                de gestão para clínicas parceiras.{'\n\n'}

                O tratamento desses dados tem como base o seu consentimento (art. 7º, I, da Lei
                nº 13.709/2018 — LGPD) e, quando aplicável, o cumprimento de obrigações legais e
                regulatórias.{'\n\n'}

                Seus dados de saúde e de contato só são acessados por profissionais e clínicas
                diretamente vinculados ao seu atendimento. Todo acesso de um profissional ou
                clínica aos seus dados é registrado em um log de auditoria interno.{'\n\n'}

                Relatórios e exportações de dados agregados, usados para gestão das clínicas,
                são anonimizados: CPF, telefone e e-mail são mascarados, exibindo apenas os
                últimos dígitos necessários para conferência.{'\n\n'}

                Você pode, a qualquer momento, solicitar a confirmação da existência de
                tratamento, acesso, correção, anonimização, portabilidade ou eliminação dos seus
                dados, conforme os arts. 17 a 22 da LGPD, pelos canais de contato da plataforma.
                {'\n\n'}

                Ao marcar a opção de aceite no cadastro, você declara estar de acordo com esta
                política (versão 1.0).
              </Text>
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

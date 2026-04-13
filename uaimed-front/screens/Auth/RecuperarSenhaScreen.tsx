import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
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
import { colors, spacing, borderRadius } from '../../styles/themes';

type RecuperarSenhaScreenProps = StackScreenProps<AuthStackParamList, 'RecuperarSenha'>;

/**
 * Tela de Recuperação de Senha
 * Segue o modelo de estilização global do sistema UaiMED
 */
const RecuperarSenhaScreen: React.FC<RecuperarSenhaScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { modal, showModal, hideModal } = useModal();

  /**
   * Função para enviar email de recuperação
   */
  const handleRecuperarSenha = async () => {
    if (!email.trim()) {
      showModal('Campo obrigatório', 'Por favor, digite seu e-mail.', { type: 'warning' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showModal('E-mail inválido', 'Verifique o formato do e-mail informado.', { type: 'error' });
      return;
    }

    setLoading(true);

    try {
      // Chamada à API para solicitar recuperação
      const response = await uaiMedApi.post('/password-recovery', {
        email: email.trim(),
      });

      if (response.status === 200 || response.status === 201) {
        // Navega para tela de confirmação de envio
        navigation.navigate('EmailEnviado', { email: email.trim() });
      }
    } catch (error: any) {
      let errorMessage = 'Não foi possível processar sua solicitação.';

      if (error.response?.status === 404) {
        errorMessage = 'Este e-mail não está cadastrado no sistema.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === 'Network Error') {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      }

      showModal('Erro na Recuperação', errorMessage, { type: 'error' });
      console.error('Erro de recuperação:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header com botão de voltar */}
          <View style={styles.headerSection}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Recuperar Senha</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Seção de Informação e Ícone */}
          <View style={styles.infoSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-open-outline" size={70} color={colors.primary} />
            </View>
            <Text style={styles.instructionTitle}>Esqueceu sua senha?</Text>
            <Text style={styles.instructionText}>
              Fique tranquilo! Digite seu e-mail abaixo e enviaremos as instruções para você criar uma nova senha.
            </Text>
          </View>

          {/* Formulário */}
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>E-mail de Cadastro</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color={colors.lightGray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="exemplo@email.com"
                  placeholderTextColor={colors.lightGray}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRecuperarSenha}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.buttonText}>ENVIAR INSTRUÇÕES</Text>
                  <Ionicons name="send-outline" size={18} color="#FFF" style={{ marginLeft: 10 }} />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Rodapé com link de retorno */}
          <View style={styles.footerSection}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.footerLink}>
              <Ionicons name="arrow-back-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.linkText}>Voltar para o Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de Alertas padronizado */}
      <AppModal {...modal} onClose={hideModal} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  infoSection: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.xxxl,
  },
  iconContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#F0F9F0', // Tom suave de verde (primary)
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  instructionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  formSection: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: '#FAFAFA',
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: spacing.md,
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  footerSection: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.dividerColor,
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  linkText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default RecuperarSenhaScreen;

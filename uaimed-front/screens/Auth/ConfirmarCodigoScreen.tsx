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

type ConfirmarCodigoScreenProps = StackScreenProps<AuthStackParamList, 'ConfirmarCodigo'>;

/**
 * Tela de Confirmação do Código de Recuperação de Senha
 * Recebe o código de 6 dígitos enviado por e-mail e a nova senha.
 */
const ConfirmarCodigoScreen: React.FC<ConfirmarCodigoScreenProps> = ({ navigation, route }) => {
  const { email } = route.params;
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const { modal, showModal, hideModal } = useModal();

  const handleConfirmar = async () => {
    if (!/^\d{6}$/.test(codigo.trim())) {
      showModal('Código inválido', 'Digite o código de 6 dígitos enviado para seu e-mail.', { type: 'warning' });
      return;
    }
    if (novaSenha.length < 6) {
      showModal('Senha muito curta', 'A nova senha deve ter pelo menos 6 caracteres.', { type: 'warning' });
      return;
    }
    if (novaSenha !== confirmarSenha) {
      showModal('Senhas não coincidem', 'A confirmação deve ser igual à nova senha.', { type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      await uaiMedApi.post('/password-recovery/confirmar', {
        email,
        codigo: codigo.trim(),
        novaSenha,
      });

      showModal('Senha redefinida!', 'Você já pode fazer login com sua nova senha.', {
        type: 'success',
        buttons: [{ text: 'Ir para o login', onPress: () => navigation.navigate('Login') }],
      });
    } catch (error: any) {
      const mensagem = error?.response?.data?.error
        || (error?.message === 'Network Error' ? 'Erro de conexão. Verifique sua internet.' : 'Não foi possível redefinir sua senha.');
      showModal('Erro ao redefinir senha', mensagem, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReenviarCodigo = async () => {
    setReenviando(true);
    try {
      await uaiMedApi.post('/password-recovery', { email });
      showModal('Código reenviado', 'Enviamos um novo código para o seu e-mail.', { type: 'success' });
    } catch {
      showModal('Erro', 'Não foi possível reenviar o código. Tente novamente em instantes.', { type: 'error' });
    } finally {
      setReenviando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Confirmar Código</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.infoSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark-outline" size={70} color={colors.primary} />
            </View>
            <Text style={styles.instructionText}>
              Enviamos um código de 6 dígitos para:
            </Text>
            <Text style={styles.emailHighlight}>{email}</Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Código de 6 dígitos</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="key-outline" size={20} color={colors.lightGray} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.codigoInput]}
                  placeholder="000000"
                  placeholderTextColor={colors.lightGray}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={codigo}
                  onChangeText={setCodigo}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nova Senha</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.lightGray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={colors.lightGray}
                  secureTextEntry
                  value={novaSenha}
                  onChangeText={setNovaSenha}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmar Nova Senha</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.lightGray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Repita a nova senha"
                  placeholderTextColor={colors.lightGray}
                  secureTextEntry
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  editable={!loading}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleConfirmar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>REDEFINIR SENHA</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendLink}
              onPress={handleReenviarCodigo}
              disabled={reenviando}
            >
              <Text style={styles.linkText}>
                {reenviando ? 'Reenviando...' : 'Não recebi o código. Reenviar.'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
  iconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#F0F9F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  instructionText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emailHighlight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: spacing.xs,
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
  codigoInput: {
    fontSize: 20,
    letterSpacing: 6,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
  resendLink: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default ConfirmarCodigoScreen;

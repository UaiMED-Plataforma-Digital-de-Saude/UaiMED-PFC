import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../styles/themes';

type EmailEnviadoScreenProps = StackScreenProps<AuthStackParamList, 'EmailEnviado'>;

/**
 * Tela de Confirmação de E-mail Enviado
 * Informa ao usuário que o link de recuperação foi enviado com sucesso.
 */
const EmailEnviadoScreen: React.FC<EmailEnviadoScreenProps> = ({ navigation, route }) => {
  const email = route.params?.email || 'seu e-mail';

  /**
   * Volta para a tela de login
   */
  const handleGoToLogin = () => {
    navigation.navigate('Login');
  };

  /**
   * Função para reenviar o email (Placeholder para futura implementação)
   */
  const handleResendEmail = () => {
    // No futuro, aqui chamaria a API de recuperação novamente
    console.log('Reenviando email para:', email);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Ícone de Sucesso Centralizado */}
        <View style={styles.iconSection}>
          <View style={styles.iconBackground}>
            <Ionicons name="mail-unread-outline" size={80} color={colors.primary} />
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark-circle" size={32} color={colors.success} />
            </View>
          </View>
        </View>

        {/* Título e Mensagem Principal */}
        <View style={styles.textSection}>
          <Text style={styles.title}>E-mail Enviado!</Text>
          <Text style={styles.message}>
            Enviamos um link de recuperação para o endereço:
          </Text>
          <Text style={styles.emailHighlight}>{email}</Text>
        </View>

        {/* Card de Instruções */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Próximos passos:</Text>

          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepText}>1</Text>
            </View>
            <Text style={styles.instructionText}>
              Abra seu aplicativo de e-mail ou acesse pelo navegador.
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepText}>2</Text>
            </View>
            <Text style={styles.instructionText}>
              Procure pela mensagem do <Text style={{ fontWeight: 'bold' }}>UaiMED</Text> na sua caixa de entrada.
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepText}>3</Text>
            </View>
            <Text style={styles.instructionText}>
              Clique no botão de <Text style={{ fontWeight: 'bold' }}>Redefinir Senha</Text> e siga as instruções.
            </Text>
          </View>
        </View>

        {/* Aviso sobre Spam */}
        <View style={styles.spamWarning}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.warning} />
          <Text style={styles.spamText}>
            Não recebeu? Verifique sua pasta de <Text style={{ fontWeight: 'bold' }}>Spam</Text> ou Lixo Eletrônico.
          </Text>
        </View>

        {/* Ações */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.buttonPrimary}
            onPress={handleGoToLogin}
          >
            <Text style={styles.buttonPrimaryText}>VOLTAR AO LOGIN</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={handleResendEmail}
          >
            <Text style={styles.buttonSecondaryText}>Não recebi o e-mail. Reenviar.</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSection: {
    marginBottom: spacing.xxl,
    alignItems: 'center',
  },
  iconBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F0F9F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  checkBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: colors.white,
    borderRadius: 20,
  },
  textSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  emailHighlight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: spacing.xs,
  },
  instructionsCard: {
    width: '100%',
    backgroundColor: colors.backgroundColor,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  stepText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  instructionText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  spamWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9F0', // Tom suave de warning
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xxl,
    width: '100%',
  },
  spamText: {
    fontSize: 13,
    color: '#855600',
    marginLeft: spacing.sm,
    flex: 1,
  },
  actionsSection: {
    width: '100%',
    gap: spacing.md,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonPrimaryText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  buttonSecondary: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default EmailEnviadoScreen;

import React from 'react';
import {
  Modal,
  Pressable,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type AppModalButton = {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
};

export type AppModalType = 'info' | 'success' | 'error' | 'warning' | 'confirm';

export type AppModalProps = {
  visible: boolean;
  title: string;
  message: string;
  type?: AppModalType;
  buttons?: AppModalButton[];
  onClose: () => void;
};

const CONFIG: Record<AppModalType, { icon: string; color: string; bg: string }> = {
  info:    { icon: 'information-circle-outline', color: '#4B73B2', bg: '#E8EDF7' },
  success: { icon: 'checkmark-circle-outline',   color: '#4CAF50', bg: '#E8F5E9' },
  error:   { icon: 'close-circle-outline',        color: '#E53935', bg: '#FFEBEE' },
  warning: { icon: 'warning-outline',             color: '#FF9800', bg: '#FFF3E0' },
  confirm: { icon: 'help-circle-outline',         color: '#4CAF50', bg: '#E8F5E9' },
};

const AppModal: React.FC<AppModalProps> = ({
  visible,
  title,
  message,
  type = 'info',
  buttons,
  onClose,
}) => {
  const cfg = CONFIG[type];

  const defaultButtons: AppModalButton[] = buttons ?? [{ text: 'OK', style: 'default' }];

  const handlePress = (btn: AppModalButton) => {
    onClose();
    btn.onPress?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* Bloqueia propagação do tap para o card */}
        <Pressable style={styles.card} onPress={() => {}}>
          {/* Ícone */}
          <View style={[styles.iconWrapper, { backgroundColor: cfg.bg }]}>
            <Ionicons name={cfg.icon as any} size={38} color={cfg.color} />
          </View>

          {/* Título */}
          <Text style={[styles.title, { color: cfg.color }]}>{title}</Text>

          {/* Mensagem */}
          <Text style={styles.message}>{message}</Text>

          {/* Botões */}
          <View style={[styles.btns, defaultButtons.length === 1 && styles.btnsCenter]}>
            {defaultButtons.map((btn, idx) => {
              const isDestructive = btn.style === 'destructive';
              const isCancel      = btn.style === 'cancel';
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.btn,
                    isCancel      && styles.btnCancel,
                    isDestructive && styles.btnDestructive,
                    !isCancel && !isDestructive && { backgroundColor: cfg.color },
                    defaultButtons.length === 1 && styles.btnFull,
                  ]}
                  onPress={() => handlePress(btn)}
                  activeOpacity={0.78}
                >
                  <Text
                    style={[
                      styles.btnText,
                      isCancel && styles.btnTextCancel,
                    ]}
                  >
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 36,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  iconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  btns: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btnsCenter: {
    justifyContent: 'center',
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
  },
  btnFull: {
    flex: 0,
    paddingHorizontal: 48,
  },
  btnCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#DDD',
    elevation: 0,
  },
  btnDestructive: {
    backgroundColor: '#E53935',
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  btnTextCancel: {
    color: '#888',
  },
});

export default AppModal;


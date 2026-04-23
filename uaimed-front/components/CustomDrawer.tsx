import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  Dimensions,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';

const DRAWER_WIDTH = Dimensions.get('window').width * 0.75;

interface Props {
  visible: boolean;
  onClose: () => void;
}

const CustomDrawer: React.FC<Props> = ({ visible, onClose }) => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<any>();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const navigate = (screen: string, params?: object) => {
    onClose();
    setTimeout(() => navigation.navigate(screen, params), 250);
  };

  const handleSignOut = () => {
    onClose();
    setTimeout(() => signOut(), 250);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"  // Animação manual acima
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Overlay escuro */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: overlayAnim }]} />
      </TouchableWithoutFeedback>

      {/* Painel do Drawer */}
      <Animated.View
        style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}
      >
        <SafeAreaView style={{ flex: 1 }}>
          {/* Cabeçalho */}
          <View style={styles.header}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.userName}>{user?.nome ?? 'Usuário'}</Text>
            <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
          </View>

          {/* Itens de navegação */}
          <View style={styles.menu}>
            <DrawerItem
              icon="home-outline"
              label="Início"
              onPress={() => navigate('Home')}
            />

            {user?.tipo === 'paciente' && (
              <DrawerItem
                icon="calendar-outline"
                label="Minhas Consultas"
                onPress={() => navigate('Agendamentos', { screen: 'Busca' })}
              />
            )}

            {user?.tipo === 'medico' && (
              <DrawerItem
                icon="calendar-outline"
                label="Minha Agenda"
                onPress={() => navigate('MedicoAgenda')}
              />
            )}

            {user?.tipo === 'clinica' && (
              <DrawerItem
                icon="bar-chart-outline"
                label="Gestão"
                onPress={() => navigate('ClinicDashboard')}
              />
            )}

            <DrawerItem
              icon="person-outline"
              label="Meu Perfil"
              onPress={() => navigate('Perfil')}
            />

            <DrawerItem
              icon="help-circle-outline"
              label="Ajuda e Suporte"
              onPress={() => navigate('Ajuda')}
            />
          </View>

          {/* Rodapé com logout */}
          <View style={styles.footer}>
            <DrawerItem
              icon="log-out-outline"
              label="Sair"
              onPress={handleSignOut}
              color="#E53935"
            />
          </View>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};

/* Item reutilizável */
interface ItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
}

const DrawerItem: React.FC<ItemProps> = ({ icon, label, onPress, color = '#333' }) => (
  <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
    <Ionicons name={icon} size={22} color={color} style={styles.itemIcon} />
    <Text style={[styles.itemLabel, { color }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#FFF',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 24,
    paddingTop: 16,
  },
  logo: {
    width: 90,
    height: 32,
    marginBottom: 12,
    tintColor: '#FFF',   // remove se o logo já for branco
  },
  userName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  userEmail: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 2,
  },
  menu: {
    flex: 1,
    paddingTop: 8,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingBottom: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  itemIcon: {
    marginRight: 16,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
});

export default CustomDrawer;
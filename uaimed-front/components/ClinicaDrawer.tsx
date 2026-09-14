import React, { useEffect, useRef } from 'react';
import {
  Animated, Dimensions, Modal, SafeAreaView, ScrollView,
  StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../navigation/types';
import { useAuth } from '../hooks/useAuth';

interface Props {
  visible: boolean;
  onClose: () => void;
  navigation: BottomTabNavigationProp<MainTabParamList>;
}

interface ItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
}

const WIDTH = Dimensions.get('window').width * 0.8;

const DrawerItem: React.FC<ItemProps> = ({ icon, label, onPress, color = '#333' }) => (
  <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.itemIcon}>
      <Ionicons name={icon} size={21} color={color} />
    </View>
    <Text style={[styles.itemText, { color }]}>{label}</Text>
    <Ionicons name="chevron-forward" size={16} color="#C1C1C1" />
  </TouchableOpacity>
);

const ClinicaDrawer: React.FC<Props> = ({ visible, onClose, navigation }) => {
  const { user, signOut } = useAuth();
  const translateX = useRef(new Animated.Value(-WIDTH)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: visible ? 0 : -WIDTH,
        duration: visible ? 260 : 210,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: visible ? 260 : 210,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateX, visible]);

  const navigate = (screen: keyof MainTabParamList) => {
    onClose();
    setTimeout(() => navigation.navigate(screen as any), 230);
  };

  const sair = () => {
    onClose();
    setTimeout(() => signOut(), 230);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity }]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.panel, { transform: [{ translateX }] }]}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Ionicons name="business" size={26} color="#FFF" />
            </View>
            <Text style={styles.name} numberOfLines={1}>{user?.nome || 'Clínica'}</Text>
            <Text style={styles.role}>Área da clínica</Text>
            <Text style={styles.location} numberOfLines={1}>
              {[user?.cidade, user?.estado].filter(Boolean).join(', ') || 'Localização não informada'}
            </Text>
          </View>

          <ScrollView style={styles.menu} showsVerticalScrollIndicator={false}>
            <DrawerItem icon="home-outline" label="Início" onPress={onClose} />
            <DrawerItem icon="people-outline" label="Equipe Médica"
              onPress={() => navigate('ClinicaMedicos')} />
            <DrawerItem icon="bar-chart-outline" label="Indicadores"
              onPress={() => navigate('ClinicDashboard')} />
            <DrawerItem icon="person-outline" label="Perfil da Clínica"
              onPress={() => navigate('Perfil')} />
            <DrawerItem icon="newspaper-outline" label="Artigos de Saúde"
              onPress={() => navigate('Artigos')} />
          </ScrollView>

          <View style={styles.footer}>
            <DrawerItem icon="help-circle-outline" label="Ajuda e Suporte"
              onPress={() => navigate('Ajuda')} color="#2E7D32" />
            <DrawerItem icon="log-out-outline" label="Sair da Conta"
              onPress={sair} color="#D32F2F" />
            <Text style={styles.version}>UaiMED v1.0</Text>
          </View>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.48)' },
  panel: {
    position: 'absolute', top: 0, bottom: 0, left: 0, width: WIDTH,
    backgroundColor: '#FFF', elevation: 18, shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 }, shadowOpacity: 0.2, shadowRadius: 12,
  },
  safe: { flex: 1 },
  header: { backgroundColor: '#2E7D32', paddingHorizontal: 21, paddingTop: 24, paddingBottom: 20 },
  avatar: {
    width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)', marginBottom: 11,
  },
  name: { color: '#FFF', fontSize: 17, fontWeight: '800' },
  role: { color: 'rgba(255,255,255,0.78)', fontSize: 12, marginTop: 3 },
  location: { color: '#FFF', fontSize: 13, fontWeight: '600', marginTop: 8 },
  menu: { flex: 1, paddingTop: 8 },
  item: { flexDirection: 'row', alignItems: 'center', minHeight: 52, paddingHorizontal: 17 },
  itemIcon: { width: 34, alignItems: 'center', marginRight: 8 },
  itemText: { flex: 1, fontSize: 14, fontWeight: '600' },
  footer: { borderTopWidth: 1, borderTopColor: '#EFEFEF', paddingTop: 3, paddingBottom: 9 },
  version: { color: '#B5B5B5', fontSize: 11, marginLeft: 21, marginTop: 5 },
});

export default ClinicaDrawer;

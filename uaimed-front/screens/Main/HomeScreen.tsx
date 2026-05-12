import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  SafeAreaView,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FeaturedProfessionalsCarousel from '../../components/FeaturedProfessionalsCarousel';
import FeaturedClinicsCarousel from '../../components/FeaturedClinicsCarousel';
import LocationModal, { LocationValue } from '../../components/LocationModal';

const LOCATION_STORAGE_KEY = '@uaimed:location';
const DRAWER_WIDTH = Dimensions.get('window').width * 0.78;

type HomeScreenProps = BottomTabScreenProps<MainTabParamList, 'Home'>;

// ─────────────────────────────────────────────
// Sub-componente: Item do Drawer
// ─────────────────────────────────────────────
interface DrawerItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
}

const DrawerItem: React.FC<DrawerItemProps> = ({ icon, label, onPress, color = '#333' }) => (
  <TouchableOpacity style={drawerStyles.item} onPress={onPress} activeOpacity={0.7}>
    <Ionicons name={icon} size={22} color={color} style={{ marginRight: 16 }} />
    <Text style={[drawerStyles.itemLabel, { color }]}>{label}</Text>
  </TouchableOpacity>
);

// ─────────────────────────────────────────────
// Sub-componente: CustomDrawer
// ─────────────────────────────────────────────
interface DrawerProps {
  visible: boolean;
  onClose: () => void;
  navigation: HomeScreenProps['navigation'];
}

const CustomDrawer: React.FC<DrawerProps> = ({ visible, onClose, navigation }) => {
  const { user, signOut } = useAuth();
  const slideAnim = React.useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayAnim = React.useRef(new Animated.Value(0)).current;

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
    setTimeout(() => navigation.navigate(screen as any, params as any), 260);
  };

  const handleSignOut = () => {
    onClose();
    setTimeout(() => signOut(), 260);
  };

  const isPaciente = user?.tipo === 'paciente';
  const isMedico   = user?.tipo === 'medico';
  const isClinica  = user?.tipo === 'clinica';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[drawerStyles.overlay, { opacity: overlayAnim }]} />
      </TouchableWithoutFeedback>

      {/* Painel deslizante */}
      <Animated.View
        style={[drawerStyles.panel, { transform: [{ translateX: slideAnim }] }]}
      >
        <SafeAreaView style={{ flex: 1 }}>

          {/* Cabeçalho verde */}
          <View style={drawerStyles.header}>
            <View style={drawerStyles.avatarCircle}>
              <Text style={drawerStyles.avatarText}>
                {user?.nome ? user.nome.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
            <Text style={drawerStyles.userName} numberOfLines={1}>
              {user?.nome ?? 'Usuário'}
            </Text>
            <Text style={drawerStyles.userEmail} numberOfLines={1}>
              {user?.email ?? ''}
            </Text>
          </View>

          {/* Itens de navegação */}
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View style={drawerStyles.section}>
              <DrawerItem
                icon="home-outline"
                label="Início"
                onPress={() => onClose()}
              />

              {isPaciente && (
                <>
                  <DrawerItem
                    icon="calendar-outline"
                    label="Minhas Consultas"
                    onPress={() => navigate('Agendamentos', { screen: 'MinhasConsultas' })}
                  />
                  <DrawerItem
                    icon="card-outline"
                    label="Meus Pagamentos"
                    onPress={() => navigate('Agendamentos', { screen: 'MeusPagamentos' })}
                  />
                </>
              )}

              {isMedico && (
                <DrawerItem
                  icon="calendar-outline"
                  label="Minha Agenda"
                  onPress={() => navigate('MedicoAgenda')}
                />
              )}

              {isClinica && (
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
                icon="newspaper-outline"
                label="Artigos de Saúde"
                onPress={() => navigate('Artigos')}
              />

              <DrawerItem
                icon="help-circle-outline"
                label="Ajuda e Suporte"
                onPress={() => navigate('Ajuda')}
                color="#4CAF50"
              />
            </View>

            {/* Divisor */}
            <View style={drawerStyles.divider} />

            <View style={drawerStyles.section}>
              <DrawerItem
                icon="log-out-outline"
                label="Sair"
                onPress={handleSignOut}
                color="#D9534F"
              />
            </View>
          </ScrollView>

          {/* Rodapé com versão */}
          <View style={drawerStyles.footer}>
            <Text style={drawerStyles.footerText}>UaiMED v1.0</Text>
          </View>

        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};

// ─────────────────────────────────────────────
// Tela Principal: HomeScreen
// ─────────────────────────────────────────────
const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [location, setLocation]       = useState<LocationValue>({ uf: '', estado: '', cidade: '' });

  // Escuta o parâmetro openMenu vindo do headerLeft do MainTabNavigator
  useEffect(() => {
    if ((route.params as any)?.openMenu) {
      setDrawerOpen(true);
      navigation.setParams({ openMenu: undefined } as any);
    }
  }, [(route.params as any)?.openMenu]);

  // Carrega localização persistida
  useEffect(() => {
    AsyncStorage.getItem(LOCATION_STORAGE_KEY).then((val) => {
      if (val) {
        try { setLocation(JSON.parse(val)); } catch { /* ignore */ }
      }
    });
  }, []);

  const handleLocationConfirm = async (loc: LocationValue) => {
    setLocation(loc);
    await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(loc));
  };

  const hasLocation = !!(location.uf || location.cidade);

  return (
    <View style={{ flex: 1 }}>
      {/* ── Drawer lateral ── */}
      <CustomDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigation={navigation}
      />

      {/* ── Conteúdo principal ── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Filtro de região */}
        <View style={{ marginTop: 16 }}>
          <TouchableOpacity
            style={[styles.locationBar, hasLocation && styles.locationBarActive]}
            onPress={() => setLocationModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="location-outline"
              size={18}
              color={hasLocation ? '#2E7D32' : '#888'}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.locationText, hasLocation && styles.locationTextActive]}>
              {location.uf
                ? `${location.cidade ? location.cidade + ', ' : ''}${location.uf}`
                : 'Qualquer localização'}
            </Text>
            <Ionicons
              name="chevron-down-outline"
              size={16}
              color={hasLocation ? '#2E7D32' : '#888'}
            />
          </TouchableOpacity>
        </View>

        {/* Profissionais em destaque */}
        <Text style={styles.sectionTitle}>Profissionais em destaque</Text>
        <FeaturedProfessionalsCarousel
          estado={location.uf || undefined}
          cidade={location.cidade || undefined}
        />

        {/* Clínicas em destaque */}
        <Text style={styles.sectionTitle}>Clínicas em destaque</Text>
        <FeaturedClinicsCarousel
          estado={location.uf || undefined}
          cidade={location.cidade || undefined}
        />

        {/* Artigos de Saúde */}
        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Artigos de Saúde</Text>

        <View style={styles.articlesContainer}>
          <TouchableOpacity
            style={styles.largeArticleCard}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('ArtigoDetalhes', { artigoId: '1' })}
          >
            <View style={[styles.articleBanner, { backgroundColor: '#E1F5FE' }]}>
              <Ionicons name="fitness-outline" size={48} color="#03A9F4" />
            </View>
            <View style={styles.articleContent}>
              <View style={styles.articleBadge}>
                <Text style={styles.articleBadgeText}>BEM-ESTAR</Text>
              </View>
              <Text style={styles.largeArticleTitle} numberOfLines={2}>
                Dicas para uma vida saudável
              </Text>
              <Text style={styles.largeArticleSub} numberOfLines={2}>
                Descubra os principais pilares da alimentação e dos exercícios diários para maximizar sua energia.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.largeArticleCard}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('ArtigoDetalhes', { artigoId: '2' })}
          >
            <View style={[styles.articleBanner, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="moon-outline" size={48} color="#9C27B0" />
            </View>
            <View style={styles.articleContent}>
              <View style={[styles.articleBadge, { backgroundColor: '#F3E5F5' }]}>
                <Text style={[styles.articleBadgeText, { color: '#9C27B0' }]}>
                  SAÚDE DO SONO
                </Text>
              </View>
              <Text style={styles.largeArticleTitle} numberOfLines={2}>
                A importância do sono de qualidade
              </Text>
              <Text style={styles.largeArticleSub} numberOfLines={2}>
                Como dormir melhor, render mais durante o dia e evitar problemas crônicos de saúde a longo prazo.
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de localização */}
      <LocationModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onConfirm={handleLocationConfirm}
        initialUF={location.uf}
        initialCidade={location.cidade}
      />
    </View>
  );
};

// ─────────────────────────────────────────────
// Estilos do Drawer
// ─────────────────────────────────────────────
const drawerStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#FFF',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
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
  section: {
    paddingVertical: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 16,
    marginVertical: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  footerText: {
    fontSize: 12,
    color: '#BBB',
  },
});

// ─────────────────────────────────────────────
// Estilos da HomeScreen
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 40,
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginHorizontal: 4,
  },
  locationBarActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#A5D6A7',
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  locationTextActive: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 10,
    marginHorizontal: 4,
    color: '#111',
  },
  articlesContainer: {
    paddingHorizontal: 4,
    marginTop: 4,
  },
  largeArticleCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  articleBanner: {
    height: 140,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  articleContent: {
    padding: 16,
  },
  articleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E1F5FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  articleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#03A9F4',
    letterSpacing: 0.5,
  },
  largeArticleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 6,
  },
  largeArticleSub: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default HomeScreen;
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FeaturedProfessionalsCarousel from '../../components/FeaturedProfessionalsCarousel';
import FeaturedClinicsCarousel from '../../components/FeaturedClinicsCarousel';
import LocationModal, { LocationValue } from '../../components/LocationModal';
import uaiMedApi from '../../api/uaiMedApi';
import NextAppointmentCard from '../../components/NextAppointmentCard';

const LOCATION_STORAGE_KEY = '@uaimed:location';

type HomeScreenProps = BottomTabScreenProps<MainTabParamList, 'Home'>;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [location, setLocation] = useState<LocationValue>({ uf: '', estado: '', cidade: '' });

  const menuAnim = useRef(new Animated.Value(0)).current;
  const itemAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  // Escuta o parâmetro openMenu vindo do Header
  useEffect(() => {
    if ((route.params as any)?.openMenu) {
      setMenuOpen(true);
      // Limpa o parâmetro para não abrir de novo acidentalmente ao voltar para a tela
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

  useEffect(() => {
    Animated.timing(menuAnim, {
      toValue: menuOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    if (menuOpen) {
      const seq = itemAnims.map((anim, i) =>
        Animated.timing(anim, { toValue: 1, duration: 180, delay: i * 50, useNativeDriver: true })
      );
      Animated.stagger(50, seq).start();
    } else {
      itemAnims.forEach(anim =>
        Animated.timing(anim, { toValue: 0, duration: 100, useNativeDriver: true }).start()
      );
    }
  }, [menuOpen, menuAnim, itemAnims]);

  const handleLocationConfirm = async (loc: LocationValue) => {
    setLocation(loc);
    await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(loc));
  };

  const locationLabel = location.uf
    ? `${location.cidade ? location.cidade + ', ' : ''}${location.uf}`
    : 'Brasil';

  // Next appointment
  const [nextAppointments, setNextAppointments] = useState<any[]>([]);
  const [nextLoading, setNextLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchNext = async () => {
      setNextLoading(true);
      try {
        const res = await uaiMedApi.get('/agendamentos');
        const list: any[] = Array.isArray(res.data) ? res.data : [];
        const future = list
          .map((a) => ({ ...a, _date: new Date(a.data) }))
          .filter((a) => a._date > new Date())
          .sort((a, b) => a._date.getTime() - b._date.getTime());

        if (mounted && future.length >= 3) {
          setNextAppointments(future.slice(0, 3));
        } else if (mounted) {
          // Mock data if not enough real future appointments
          const mockData = [
            { id: 'mock-1', medico: 'Dra. Ana Silva', especialidade: 'Cardiologia', data: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() },
            { id: 'mock-2', medico: 'Dr. Roberto Santos', especialidade: 'Ortopedia', data: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString() },
            { id: 'mock-3', medico: 'Dra. Juliana Lima', especialidade: 'Dermatologia', data: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString() },
          ];
          setNextAppointments(future.length > 0 ? [...future, ...mockData].slice(0, 3) : mockData);
        }
      } catch (e) {
        console.warn('Erro ao buscar agendamentos:', e);
        if (mounted) {
          setNextAppointments([
            { id: 'mock-1', medico: 'Dra. Ana Silva', especialidade: 'Cardiologia', data: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() },
            { id: 'mock-2', medico: 'Dr. Roberto Santos', especialidade: 'Ortopedia', data: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString() },
            { id: 'mock-3', medico: 'Dra. Juliana Lima', especialidade: 'Dermatologia', data: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString() },
          ]);
        }
      } finally {
        if (mounted) setNextLoading(false);
      }
    };

    fetchNext();
    return () => { mounted = false; };
  }, []);

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 12,
        paddingBottom: 40, // Aumentado um pouco o padding inferior para melhor rolagem
      }}
      showsVerticalScrollIndicator={false}
    >
      {menuOpen && (
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setMenuOpen(false)}>
          <Animated.View
            pointerEvents={menuOpen ? 'auto' : 'none'}
            style={[
              styles.menuBox,
              {
                opacity: menuAnim,
                transform: [
                  { translateY: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) },
                  { scale: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) },
                ],
              },
            ]}
          >
            {/* Meu Perfil */}
            <Animated.View style={[styles.menuItem, { opacity: itemAnims[0], transform: [{ translateY: itemAnims[0].interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) }] }]}>
              <TouchableOpacity onPress={() => { setMenuOpen(false); navigation.navigate('Perfil'); }} style={styles.menuRow}>
                <Ionicons name="person-outline" size={18} color="#4B73B2" style={{ marginRight: 10 }} />
                <Text style={styles.menuText}>Meu Perfil</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Minhas Consultas */}
            <Animated.View style={[styles.menuItem, { opacity: itemAnims[1], transform: [{ translateY: itemAnims[1].interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) }] }]}>
              <TouchableOpacity onPress={() => { setMenuOpen(false); navigation.navigate('Agendamentos', { screen: 'MinhasConsultas' }); }} style={styles.menuRow}>
                <Ionicons name="calendar-outline" size={18} color="#4B73B2" style={{ marginRight: 10 }} />
                <Text style={styles.menuText}>Minhas Consultas</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Meus Pagamentos */}
            <Animated.View style={[styles.menuItem, { opacity: itemAnims[2], transform: [{ translateY: itemAnims[2].interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) }] }]}>
              <TouchableOpacity onPress={() => { setMenuOpen(false); navigation.navigate('Agendamentos', { screen: 'MeusPagamentos' }); }} style={styles.menuRow}>
                <Ionicons name="card-outline" size={18} color="#4B73B2" style={{ marginRight: 10 }} />
                <Text style={styles.menuText}>Meus Pagamentos</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Ajuda */}
            <Animated.View style={[styles.menuItem, { opacity: itemAnims[3], transform: [{ translateY: itemAnims[3].interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) }] }]}>
              <TouchableOpacity
                onPress={() => {
                  setMenuOpen(false);
                  navigation.navigate('Ajuda');
                }}
                style={styles.menuRow}
              >
                <Ionicons name="help-circle-outline" size={18} color="#4CAF50" style={{ marginRight: 10 }} />
                <Text style={styles.menuText}>Ajuda</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Divisor */}
            <View style={styles.menuDivider} />

            {/* Sair */}
            <Animated.View style={[styles.menuItem, { opacity: itemAnims[4], transform: [{ translateY: itemAnims[4].interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) }] }]}>
              <TouchableOpacity onPress={() => { setMenuOpen(false); signOut(); }} style={styles.menuRow}>
                <Ionicons name="log-out-outline" size={18} color="#D9534F" style={{ marginRight: 10 }} />
                <Text style={[styles.menuText, { color: '#D9534F' }]}>Sair</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </TouchableOpacity>
      )}

      {/* Filtro de região */}
      <View style={{ marginTop: 16 }}>
        <TouchableOpacity
          style={[styles.locationBar, (location.uf || location.cidade) && styles.locationBarActive]}
          onPress={() => setLocationModalVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="location-outline"
            size={18}
            color={(location.uf || location.cidade) ? '#2E7D32' : '#888'}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.locationText, (location.uf || location.cidade) && styles.locationTextActive]}>
            {location.uf ? `${location.cidade ? location.cidade + ', ' : ''}${location.uf}` : 'Qualquer localização'}
          </Text>
          <Ionicons
            name="chevron-down-outline"
            size={16}
            color={(location.uf || location.cidade) ? '#2E7D32' : '#888'}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Profissionais em destaque</Text>
      <FeaturedProfessionalsCarousel estado={location.uf || undefined} cidade={location.cidade || undefined} />

      {nextLoading ? (
        <ActivityIndicator size="small" color="#4CAF50" style={{ marginVertical: 8 }} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.nextStepsContainer}>
          {nextAppointments.map((appointment) => (
            <NextAppointmentCard
              key={appointment.id || appointment.agendamentoId}
              medico={appointment.medico || appointment.medicoNome || 'Profissional'}
              especialidade={appointment.especialidade}
              data={appointment.data}
              onPress={() => navigation.navigate('Agendamentos', {
                screen: 'DetalhesMedico',
                params: { medicoId: appointment.medicoId || appointment.medico_id }
              })}
            />
          ))}
        </ScrollView>
      )}

      <Text style={styles.sectionTitle}>Clínicas em destaque</Text>
      <FeaturedClinicsCarousel />

      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Artigos de Saúde</Text>

      {/* Nova seção de artigos verticais */}
      <View style={styles.articlesContainer}>
        {/* Card 1 */}
        <TouchableOpacity style={styles.largeArticleCard} activeOpacity={0.9}>
          <View style={[styles.articleBanner, { backgroundColor: '#E1F5FE' }]}>
            <Ionicons name="fitness-outline" size={48} color="#03A9F4" />
          </View>
          <View style={styles.articleContent}>
            <View style={styles.articleBadge}>
              <Text style={styles.articleBadgeText}>BEM-ESTAR</Text>
            </View>
            <Text style={styles.largeArticleTitle} numberOfLines={2}>Dicas para uma vida saudável</Text>
            <Text style={styles.largeArticleSub} numberOfLines={2}>Descubra os principais pilares da alimentação e dos exercícios diários para maximizar sua energia.</Text>
          </View>
        </TouchableOpacity>

        {/* Card 2 */}
        <TouchableOpacity style={styles.largeArticleCard} activeOpacity={0.9}>
          <View style={[styles.articleBanner, { backgroundColor: '#F3E5F5' }]}>
            <Ionicons name="moon-outline" size={48} color="#9C27B0" />
          </View>
          <View style={styles.articleContent}>
            <View style={[styles.articleBadge, { backgroundColor: '#F3E5F5' }]}>
              <Text style={[styles.articleBadgeText, { color: '#9C27B0' }]}>SAÚDE DO SONO</Text>
            </View>
            <Text style={styles.largeArticleTitle} numberOfLines={2}>A importância do sono de qualidade</Text>
            <Text style={styles.largeArticleSub} numberOfLines={2}>Como dormir melhor, render mais durante o dia e evitar problemas crônicos de saúde a longo prazo.</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Modal de Localização */}
      <LocationModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onConfirm={handleLocationConfirm}
        initialUF={location.uf}
        initialCidade={location.cidade}
      />

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#FAFAFA', paddingHorizontal: 12, paddingTop: 8 },
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
  locationText: { flex: 1, fontSize: 14, color: '#888', fontWeight: '500' },
  locationTextActive: { color: '#2E7D32', fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 12, marginBottom: 10, marginHorizontal: 4, color: '#111' },
  nextStepsContainer: { paddingLeft: 4, marginBottom: 10 },

  /* Novos Estilos de Artigo Vertical */
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
  /* Fim dos novos estilos */

  menuOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.25)', zIndex: 50 },
  menuBox: { position: 'absolute', top: 60, left: 12, width: 230, backgroundColor: '#FFF', borderRadius: 12, elevation: 8, paddingVertical: 8, paddingHorizontal: 6, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  menuItem: { paddingVertical: 8, paddingHorizontal: 6 },
  menuRow: { flexDirection: 'row', alignItems: 'center' },
  menuText: { fontSize: 15, color: '#333', fontWeight: '500' },
  menuDivider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 4, marginHorizontal: 6 },
});

export default HomeScreen;
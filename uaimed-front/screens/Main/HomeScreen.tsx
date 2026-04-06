import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Animated, Easing, ActivityIndicator } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FeaturedProfessionalsCarousel from '../../components/FeaturedProfessionalsCarousel';
import LocationModal, { LocationValue } from '../../components/LocationModal';
import uaiMedApi from '../../api/uaiMedApi';
import NextAppointmentCard from '../../components/NextAppointmentCard';

const LOCATION_STORAGE_KEY = '@uaimed:location';

type HomeScreenProps = BottomTabScreenProps<MainTabParamList, 'Home'>;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [location, setLocation] = useState<LocationValue>({ uf: '', estado: '', cidade: '' });

  const rotation = useRef(new Animated.Value(0)).current;
  const menuAnim = useRef(new Animated.Value(0)).current;
  const itemAnims = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;

  // Carrega localização persistida
  useEffect(() => {
    AsyncStorage.getItem(LOCATION_STORAGE_KEY).then((val) => {
      if (val) {
        try { setLocation(JSON.parse(val)); } catch { /* ignore */ }
      }
    });
  }, []);

  useEffect(() => {
    Animated.timing(rotation, {
      toValue: menuOpen ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    Animated.timing(menuAnim, {
      toValue: menuOpen ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    if (menuOpen) {
      const seq = itemAnims.map((anim, i) => Animated.timing(anim, { toValue: 1, duration: 200, delay: i * 60, useNativeDriver: true }));
      Animated.stagger(60, seq).start();
    } else {
      const seq = itemAnims.map((anim) => Animated.timing(anim, { toValue: 0, duration: 120, useNativeDriver: true }));
      Animated.parallel(seq).start();
    }
  }, [menuOpen, rotation, menuAnim, itemAnims]);

  const handleLocationConfirm = async (loc: LocationValue) => {
    setLocation(loc);
    await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(loc));
  };

  const locationLabel = location.uf
    ? `${location.cidade ? location.cidade + ', ' : ''}${location.uf}`
    : 'Brasil';

  // Next appointment
  const [nextAppointment, setNextAppointment] = useState<any | null>(null);
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
        if (mounted && future.length) {
          setNextAppointment(future[0]);
        } else if (mounted) {
          // Se não houver agendamentos futuros, usa simulado
          setNextAppointment({ medico: 'Dr. Simulado', especialidade: 'Clínica geral', data: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() });
        }
      } catch (e) {
        // fallback simulated next appointment
        console.warn('Erro ao buscar agendamentos:', e);
        if (mounted) setNextAppointment({ medico: 'Dr. Simulado', especialidade: 'Clínica geral', data: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() });
      } finally {
        if (mounted) setNextLoading(false);
      }
    };

    fetchNext();
    return () => { mounted = false; };
  }, []);


  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => setMenuOpen((s) => !s)} style={styles.menuButton} accessibilityLabel="Abrir menu">
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons name="menu" size={26} color="#333" />
          </Animated.View>
        </TouchableOpacity>
        <Text style={styles.greetingText}>Olá{user?.nome ? `, ${user.nome.split(' ')[0]}` : ''}</Text>
      </View>

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
                  { scale: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) },
                ],
              },
            ]}
          >
            <Animated.View style={[styles.menuItem, { opacity: itemAnims[0], transform: [{ translateY: itemAnims[0].interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) }] }]}>
              <TouchableOpacity onPress={() => { setMenuOpen(false); navigation.navigate('Perfil'); }} style={styles.menuRow}>
                <Ionicons name="person-outline" size={18} color="#4B73B2" style={{ marginRight: 10 }} />
                <Text style={styles.menuText}>Meu Perfil</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={[styles.menuItem, { opacity: itemAnims[1], transform: [{ translateY: itemAnims[1].interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) }] }]}>
              <TouchableOpacity onPress={() => { setMenuOpen(false); navigation.navigate('Agendamentos'); }} style={styles.menuRow}>
                <Ionicons name="calendar-outline" size={18} color="#4B73B2" style={{ marginRight: 10 }} />
                <Text style={styles.menuText}>Meus Agendamentos</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={[styles.menuItem, { opacity: itemAnims[2], transform: [{ translateY: itemAnims[2].interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) }] }]}>
              <TouchableOpacity onPress={() => { setMenuOpen(false); signOut(); }} style={styles.menuRow}>
                <Ionicons name="log-out-outline" size={18} color="#D9534F" style={{ marginRight: 10 }} />
                <Text style={[styles.menuText, { color: '#D9534F' }]}>Sair</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </TouchableOpacity>
      )}

      <Text style={styles.sectionTitle}>Profissionais em destaque</Text>

      {/* Filtro de região — entre o título e o carrossel */}
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

      <FeaturedProfessionalsCarousel estado={location.uf || undefined} cidade={location.cidade || undefined} />

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="gray" style={{ marginRight: 10 }} />
        <TextInput placeholder="Buscar especialidade ou médico" style={styles.searchInput} onSubmitEditing={(e) => navigation.navigate('Agendamentos', { screen: 'Resultados', params: { query: e.nativeEvent.text } })} />
      </View>

      <Text style={styles.sectionTitle}>Seu Próximo Passo</Text>
      {nextLoading ? (
        <ActivityIndicator size="small" color="#4CAF50" style={{ marginVertical: 8 }} />
      ) : nextAppointment ? (
        <NextAppointmentCard
          medico={nextAppointment.medico || nextAppointment.medicoNome || 'Profissional'}
          especialidade={nextAppointment.especialidade}
          data={nextAppointment.data}
          onPress={() => navigation.navigate('Agendamentos', { screen: 'DetalhesMedico', params: { medicoId: nextAppointment.medicoId || nextAppointment.medico_id } })}
        />
      ) : null}

      <Text style={styles.sectionTitle}>Atalhos</Text>
      <View style={styles.shortcutsContainer}>
        <TouchableOpacity style={styles.shortcutItem} onPress={() => navigation.navigate('Agendamentos', { screen: 'Busca' })}>
          <Ionicons name="calendar" size={28} color="#4CAF50" />
          <Text style={styles.shortcutText}>Agendar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shortcutItem} onPress={() => navigation.navigate('Perfil')}>
          <Ionicons name="person" size={28} color="#4CAF50" />
          <Text style={styles.shortcutText}>Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shortcutItem} onPress={() => Alert.alert('Ajuda', 'Em breve...')}>
          <Ionicons name="help-circle" size={28} color="#4CAF50" />
          <Text style={styles.shortcutText}>Ajuda</Text>
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
  container: { flexGrow: 1, backgroundColor: '#FAFAFA', paddingHorizontal: 12, paddingTop: 0 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingTop: 28, paddingHorizontal: 6 },
  menuButton: { padding: 8, marginRight: 6 },
  greetingText: { fontSize: 20, fontWeight: '700', textAlign: 'left', flex: 1, color: '#222', marginTop: 6 },
  // Filtro de localização — igual ao SearchScreen de Agendamento
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
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 10, padding: 12, marginVertical: 8, marginHorizontal: 4, elevation: 1, borderWidth: 1, borderColor: '#F5F5F5' },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 8, marginBottom: 6, marginHorizontal: 4, color: '#222' },
  card: { backgroundColor: '#FFF', borderRadius: 10, padding: 15, borderWidth: 1, borderColor: '#F5F5F5' },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardSubtitle: { fontSize: 14, color: '#666', marginVertical: 5 },
  detailButton: { marginTop: 10, alignSelf: 'flex-start' },
  detailButtonText: { color: '#4B73B2', fontWeight: '600' },
  shortcutsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 6, marginBottom: 16, marginHorizontal: 4 },
  shortcutItem: { alignItems: 'center' },
  shortcutText: { fontSize: 12, marginTop: 6, fontWeight: '500', color: '#555' },
  menuOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.25)', zIndex: 50 },
  menuBox: { position: 'absolute', top: 60, left: 12, width: 220, backgroundColor: '#FFF', borderRadius: 12, elevation: 8, paddingVertical: 8, paddingHorizontal: 6, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  menuItem: { paddingVertical: 8, paddingHorizontal: 6 },
  menuRow: { flexDirection: 'row', alignItems: 'center' },
  menuText: { fontSize: 15, color: '#333', fontWeight: '500' },
});

export default HomeScreen;

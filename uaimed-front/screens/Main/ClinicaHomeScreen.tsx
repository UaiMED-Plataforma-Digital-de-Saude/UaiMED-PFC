import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Image, RefreshControl, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { MainTabParamList } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import uaiMedApi from '../../api/uaiMedApi';
import ClinicaDrawer from '../../components/ClinicaDrawer';
import { MedicoClinica, MinhaClinicaResponse } from '../../types/clinica';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

interface AtalhoProps {
  icon: keyof typeof Ionicons.glyphMap;
  titulo: string;
  descricao: string;
  onPress: () => void;
}

const Atalho: React.FC<AtalhoProps> = ({ icon, titulo, descricao, onPress }) => (
  <TouchableOpacity style={styles.atalho} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.atalhoIcon}>
      <Ionicons name={icon} size={24} color="#2E7D32" />
    </View>
    <View style={styles.atalhoContent}>
      <Text style={styles.atalhoTitle}>{titulo}</Text>
      <Text style={styles.atalhoDescription}>{descricao}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#A5A5A5" />
  </TouchableOpacity>
);

const MedicoResumo: React.FC<{ medico: MedicoClinica }> = ({ medico }) => {
  const iniciais = medico.nome.split(' ').filter(Boolean).slice(0, 2)
    .map((parte) => parte[0]).join('').toUpperCase();

  return (
    <View style={styles.medicoCard}>
      <View style={styles.medicoAvatar}>
        {medico.avatar
          ? <Image source={{ uri: medico.avatar }} style={styles.medicoAvatarImage} />
          : <Text style={styles.medicoAvatarText}>{iniciais || 'M'}</Text>}
      </View>
      <View style={styles.medicoInfo}>
        <Text style={styles.medicoNome} numberOfLines={1}>{medico.nome}</Text>
        <Text style={styles.medicoEspecialidade}>{medico.especialidade}</Text>
        <Text style={styles.medicoCrm}>CRM {medico.crm}</Text>
      </View>
    </View>
  );
};

const ClinicaHomeScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dados, setDados] = useState<MinhaClinicaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const carregouRef = useRef(false);

  const carregar = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else if (!carregouRef.current) setLoading(true);
    try {
      const resposta = await uaiMedApi.get<MinhaClinicaResponse>('/clinicas/me');
      setDados(resposta.data);
      carregouRef.current = true;
      setErro(null);
    } catch (error: any) {
      setErro(error.response?.data?.error ?? 'Não foi possível carregar os dados da clínica.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    carregar(false);
  }, [carregar]));

  useEffect(() => {
    if (route.params?.openMenu) {
      setDrawerOpen(true);
      navigation.setParams({ openMenu: undefined });
    }
  }, [navigation, route.params?.openMenu]);

  const clinica = dados?.clinica;
  const resumo = dados?.resumo;
  const primeiroNome = (clinica?.nome ?? user?.nome ?? 'Clínica').split(' ')[0];

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Carregando área da clínica...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ClinicaDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} navigation={navigation} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => carregar(true)} tintColor="#2E7D32" />}
      >
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="business" size={32} color="#FFF" />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.welcome}>Olá, {primeiroNome}</Text>
            <Text style={styles.subtitle}>Você entrou na área da clínica.</Text>
          </View>
        </View>

        {erro ? (
          <TouchableOpacity style={styles.errorCard} onPress={() => carregar(false)}>
            <Ionicons name="alert-circle-outline" size={20} color="#B71C1C" />
            <Text style={styles.errorText}>{erro} Toque para tentar novamente.</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.profileCard}>
          <Text style={styles.profileLabel}>Perfil da clínica</Text>
          <Text style={styles.profileValue}>{clinica?.nome ?? user?.nome}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={15} color="#5F6F60" />
            <Text style={styles.locationText}>
              {[clinica?.cidade, clinica?.estado].filter(Boolean).join(', ') || 'Localização não informada'}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="people-outline" size={22} color="#2E7D32" />
            <Text style={styles.statValue}>{resumo?.totalMedicos ?? 0}</Text>
            <Text style={styles.statLabel}>Médicos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Ionicons name="today-outline" size={22} color="#1E88E5" />
            <Text style={styles.statValue}>{resumo?.agendamentosHoje ?? 0}</Text>
            <Text style={styles.statLabel}>Hoje</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={22} color="#F57C00" />
            <Text style={styles.statValue}>{resumo?.totalAgendamentos ?? 0}</Text>
            <Text style={styles.statLabel}>Consultas</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Acesso rápido</Text>
        <Atalho icon="people-outline" titulo="Gerenciar médicos"
          descricao="Vincule ou remova profissionais da clínica."
          onPress={() => navigation.navigate('ClinicaMedicos')} />
        <Atalho icon="bar-chart-outline" titulo="Indicadores"
          descricao="Acompanhe os dados da sua operação."
          onPress={() => navigation.navigate('ClinicDashboard')} />
        <Atalho icon="person-outline" titulo="Perfil da clínica"
          descricao="Confira e atualize os dados cadastrais."
          onPress={() => navigation.navigate('Perfil')} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Equipe médica</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ClinicaMedicos')}>
            <Text style={styles.seeAll}>Gerenciar</Text>
          </TouchableOpacity>
        </View>

        {dados?.medicos.length ? (
          dados.medicos.slice(0, 3).map((medico) => <MedicoResumo key={medico.id} medico={medico} />)
        ) : (
          <TouchableOpacity style={styles.emptyTeam} onPress={() => navigation.navigate('ClinicaMedicos')}>
            <Ionicons name="person-add-outline" size={32} color="#2E7D32" />
            <Text style={styles.emptyTitle}>Nenhum médico vinculado</Text>
            <Text style={styles.emptyDescription}>Toque para montar a equipe da clínica.</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8F6' },
  content: { padding: 18, paddingBottom: 40 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6F8F6' },
  loadingText: { color: '#777', fontSize: 13, marginTop: 10 },
  hero: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2E7D32', borderRadius: 18, padding: 20 },
  heroIcon: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.18)' },
  heroText: { flex: 1, marginLeft: 14 },
  welcome: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.82)', fontSize: 14, marginTop: 4 },
  errorCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFEBEE', borderRadius: 12, padding: 12, marginTop: 12 },
  errorText: { flex: 1, color: '#B71C1C', fontSize: 12, lineHeight: 17 },
  profileCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 17, marginTop: 16, borderWidth: 1, borderColor: '#E4ECE4' },
  profileLabel: { color: '#7A7A7A', fontSize: 12, fontWeight: '600' },
  profileValue: { color: '#222', fontSize: 18, fontWeight: '700', marginTop: 5 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 7 },
  locationText: { color: '#666', fontSize: 13 },
  statsRow: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 14, marginTop: 12, borderWidth: 1, borderColor: '#E8E8E8', paddingVertical: 14 },
  statCard: { flex: 1, alignItems: 'center', gap: 3 },
  statDivider: { width: 1, backgroundColor: '#ECECEC' },
  statValue: { fontSize: 18, fontWeight: '800', color: '#222' },
  statLabel: { fontSize: 11, color: '#888' },
  sectionTitle: { color: '#222', fontSize: 18, fontWeight: '800', marginTop: 24, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seeAll: { color: '#2E7D32', fontSize: 13, fontWeight: '700', marginTop: 14 },
  atalho: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, padding: 15, marginBottom: 11, borderWidth: 1, borderColor: '#E8E8E8' },
  atalhoIcon: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F5E9' },
  atalhoContent: { flex: 1, marginHorizontal: 13 },
  atalhoTitle: { color: '#252525', fontSize: 15, fontWeight: '700' },
  atalhoDescription: { color: '#777', fontSize: 12, marginTop: 3 },
  medicoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, padding: 13, marginBottom: 9, borderWidth: 1, borderColor: '#E8E8E8' },
  medicoAvatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F5E9', overflow: 'hidden' },
  medicoAvatarImage: { width: 46, height: 46 },
  medicoAvatarText: { color: '#2E7D32', fontWeight: '800', fontSize: 14 },
  medicoInfo: { flex: 1, marginLeft: 12 },
  medicoNome: { color: '#222', fontSize: 14, fontWeight: '700' },
  medicoEspecialidade: { color: '#2E7D32', fontSize: 12, marginTop: 2 },
  medicoCrm: { color: '#999', fontSize: 11, marginTop: 2 },
  emptyTeam: { alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, padding: 24, borderWidth: 1, borderColor: '#DDE8DD', borderStyle: 'dashed' },
  emptyTitle: { color: '#333', fontSize: 15, fontWeight: '700', marginTop: 8 },
  emptyDescription: { color: '#888', fontSize: 12, marginTop: 4 },
});

export default ClinicaHomeScreen;

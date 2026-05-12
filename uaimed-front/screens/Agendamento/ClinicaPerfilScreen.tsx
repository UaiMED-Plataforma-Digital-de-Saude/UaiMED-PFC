import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Image, Platform, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { AgendamentoStackParamList } from '../../navigation/types';
import uaiMedApi from '../../api/uaiMedApi';

type Props = StackScreenProps<AgendamentoStackParamList, 'ClinicaPerfil'>;

interface ClinicaPerfil {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  avatar: string | null;
  cidade: string | null;
  estado: string | null;
  localizacao: string | null;
  pixKey: string | null;
  nota: number;
}

const SERVICOS: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: 'medkit-outline',    label: 'Consultas Médicas' },
  { icon: 'flask-outline',     label: 'Exames Laboratoriais' },
  { icon: 'fitness-outline',   label: 'Fisioterapia' },
  { icon: 'heart-outline',     label: 'Cardiologia' },
  { icon: 'eye-outline',       label: 'Oftalmologia' },
];

const DIFERENCIAIS = [
  'Agendamento Online', 'Estacionamento', 'Acessibilidade',
  'WiFi Gratuito', 'Atendimento Humanizado', 'Convênios Aceitos',
];

const ClinicaPerfilScreen: React.FC<Props> = ({ route, navigation }) => {
  const { clinicaId, nomeClinica } = route.params ?? {};
  const [perfil, setPerfil] = useState<ClinicaPerfil | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clinicaId) { setLoading(false); return; }
    uaiMedApi.get(`/clinicas/${clinicaId}`)
      .then(r => setPerfil(r.data))
      .catch(() => setPerfil(null))
      .finally(() => setLoading(false));
  }, [clinicaId]);

  const nome = perfil?.nome ?? nomeClinica ?? '?';
  const iniciais = nome.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase();

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.getParent<any>()?.navigate('Home');
  };

  const handleConversar = async () => {
    if (!clinicaId) return;
    try {
      const res = await uaiMedApi.post('/conversas', { profissionalId: clinicaId, titulo: nome });
      navigation.getParent<any>()?.navigate('Conversas', {
        screen: 'ConversaDetalhe',
        params: { conversaId: res.data.id, titulo: nome, nomeOutro: nome },
      });
    } catch { /* segue */ }
  };

  if (loading) {
    return (
      <View style={s.loadingBg}>
        <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />

      {/* ── Hero fixo ── */}
      <View style={s.hero}>
        <SafeAreaView edges={['top']} style={s.heroRow}>
          <TouchableOpacity style={s.backBtn} onPress={handleBack} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </TouchableOpacity>
          <View style={s.avatarRing}>
            {perfil?.avatar
              ? <Image source={{ uri: perfil.avatar }} style={s.avatarImg} />
              : <Text style={s.avatarTxt}>{iniciais}</Text>
            }
          </View>
          <View style={s.heroInfo}>
            <Text style={s.heroNome} numberOfLines={1}>{nome}</Text>
            {perfil && (
              <View style={s.heroBadgeRow}>
                <Ionicons name="business" size={11} color="#A5D6A7" />
                <Text style={s.heroBadgeTxt}>Clínica Médica</Text>
                {perfil.localizacao ? (
                  <>
                    <Text style={s.heroDot}>·</Text>
                    <Ionicons name="location-outline" size={11} color="#C8E6C9" />
                    <Text style={s.heroLocTxt} numberOfLines={1}>{perfil.localizacao}</Text>
                  </>
                ) : null}
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>

      {/* ── Conteúdo rolável ── */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {perfil ? (
          <>
            {/* Destaques */}
            <View style={s.statsRow}>
              <View style={[s.statCard, { borderRightWidth: 1, borderRightColor: '#F0F0F0' }]}>
                <View style={[s.statIcon, { backgroundColor: '#FFF8E1' }]}>
                  <Ionicons name="star" size={18} color="#F9A825" />
                </View>
                <Text style={s.statVal}>{perfil.nota?.toFixed(1) ?? '—'}</Text>
                <Text style={s.statLbl}>Avaliação</Text>
              </View>
              <View style={[s.statCard, { borderRightWidth: 1, borderRightColor: '#F0F0F0' }]}>
                <View style={[s.statIcon, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#4CAF50" />
                </View>
                <Text style={s.statVal}>100%</Text>
                <Text style={s.statLbl}>Verificada</Text>
              </View>
              <View style={s.statCard}>
                <View style={[s.statIcon, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="time-outline" size={18} color="#1E88E5" />
                </View>
                <Text style={s.statVal}>Seg–Sex</Text>
                <Text style={s.statLbl}>Horário</Text>
              </View>
            </View>

            {/* Informações + Serviços no mesmo card */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Informações da Clínica</Text>
              {perfil.localizacao
                ? <InfoRow icon="location-outline" label="Localização" value={perfil.localizacao} />
                : null}
              {perfil.telefone
                ? <InfoRow icon="call-outline" label="Telefone" value={perfil.telefone} last />
                : null}
            </View>

            {/* Serviços */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Serviços Oferecidos</Text>
              {SERVICOS.map((srv, i) => (
                <View key={i} style={[s.serviceRow, i === SERVICOS.length - 1 && { borderBottomWidth: 0, paddingBottom: 0 }]}>
                  <View style={s.serviceIcon}>
                    <Ionicons name={srv.icon} size={16} color="#4CAF50" />
                  </View>
                  <Text style={s.serviceLabel}>{srv.label}</Text>
                  <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                </View>
              ))}
            </View>

            {/* Diferenciais */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Nossos Diferenciais</Text>
              <View style={s.tagsWrap}>
                {DIFERENCIAIS.map(tag => (
                  <View key={tag} style={s.tag}>
                    <Ionicons name="checkmark" size={11} color="#2E7D32" style={{ marginRight: 3 }} />
                    <Text style={s.tagTxt}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : (
          <View style={s.erroBg}>
            <Ionicons name="alert-circle-outline" size={52} color="#CCC" />
            <Text style={s.erroTxt}>Clínica não encontrada</Text>
            <TouchableOpacity style={s.erroBtn} onPress={handleBack}>
              <Text style={s.erroBtnTxt}>Voltar</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ── Footer ── */}
      {perfil && (
        <View style={s.footer}>
          <TouchableOpacity style={s.btnSecundario} onPress={handleConversar} activeOpacity={0.85}>
            <Ionicons name="chatbubble-outline" size={18} color="#4CAF50" />
            <Text style={s.btnSecundarioTxt}>Contato</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.btnPrimario}
            onPress={() => navigation.navigate('Busca')}
            activeOpacity={0.85}
          >
            <Ionicons name="calendar-outline" size={18} color="#FFF" />
            <Text style={s.btnPrimarioTxt}>Agendar Consulta</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// ── Sub-componentes ──────────────────────────────────────────────

const InfoRow: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}> = ({ icon, label, value, last }) => (
  <View style={[s.infoRow, last && { borderBottomWidth: 0, paddingBottom: 0 }]}>
    <View style={s.infoIconBox}>
      <Ionicons name={icon} size={16} color="#4CAF50" />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  </View>
);

// ── Estilos ──────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F0F2F5' },
  loadingBg: { flex: 1, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center' },

  // Hero
  hero: {
    backgroundColor: '#388E3C',
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? 4 : 0,
    paddingBottom: 12,
    gap: 10,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarRing: {
    width: 50, height: 50, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarImg: { width: 50, height: 50, borderRadius: 12 },
  avatarTxt: { fontSize: 17, fontWeight: '800', color: '#FFF' },
  heroInfo: { flex: 1 },
  heroNome: { fontSize: 15, fontWeight: '800', color: '#FFF', letterSpacing: 0.1 },
  heroBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3, flexWrap: 'wrap' },
  heroBadgeTxt: { fontSize: 12, color: '#C8E6C9', fontWeight: '500' },
  heroDot: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  heroLocTxt: { fontSize: 12, color: '#C8E6C9', flex: 1 },

  // Scroll
  scrollContent: { padding: 10, paddingBottom: 24 },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 14, gap: 6 },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statVal: { fontSize: 15, fontWeight: '800', color: '#1A1A1A' },
  statLbl: { fontSize: 11, color: '#999', fontWeight: '500' },

  // Card
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 12, letterSpacing: 0.1 },

  // InfoRow
  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#F3F3F3',
  },
  infoIconBox: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  infoLabel: { fontSize: 10, color: '#BBB', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  infoValue: { fontSize: 13, color: '#2A2A2A', fontWeight: '500', marginTop: 1 },

  // Serviços
  serviceRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#F3F3F3',
  },
  serviceIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  serviceLabel: { flex: 1, fontSize: 13, color: '#2A2A2A', fontWeight: '500' },

  // Tags
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  tag: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#E8F5E9', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  tagTxt: { fontSize: 12, color: '#2E7D32', fontWeight: '600' },

  // Erro
  erroBg: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  erroTxt: { fontSize: 15, color: '#AAA' },
  erroBtn: { marginTop: 8, backgroundColor: '#388E3C', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 11 },
  erroBtnTxt: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  // Footer
  footer: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 26 : 10,
    backgroundColor: '#FFF',
    borderTopWidth: 1, borderTopColor: '#EBEBEB',
    elevation: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.07, shadowRadius: 6,
  },
  btnSecundario: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1.5, borderColor: '#4CAF50', borderRadius: 12, paddingVertical: 13,
    backgroundColor: '#F1FBF1',
  },
  btnSecundarioTxt: { fontSize: 14, fontWeight: '700', color: '#4CAF50' },
  btnPrimario: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#388E3C', borderRadius: 12, paddingVertical: 13,
    elevation: 2, shadowColor: '#388E3C', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 5,
  },
  btnPrimarioTxt: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});

export default ClinicaPerfilScreen;

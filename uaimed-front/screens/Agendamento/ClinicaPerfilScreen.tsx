import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Image, Linking, Platform, StatusBar,
} from 'react-native';
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
  medicos: Array<{
    id: string;
    nome: string;
    avatar: string | null;
    especialidade: string;
    crm: string;
    cidade: string;
    estado: string;
    totalAgendamentos: number;
    totalAvaliacoes: number;
  }>;
}

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
    navigation.getParent<any>()?.navigate('Home');
  };

  const handleContato = () => {
    if (perfil?.telefone) {
      Linking.openURL(`tel:${perfil.telefone.replace(/\D/g, '')}`);
      return;
    }
    if (perfil?.email) Linking.openURL(`mailto:${perfil.email}`);
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
        <View style={s.heroRow}>
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
        </View>
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
                <Text style={s.statVal}>{perfil.medicos.length}</Text>
                <Text style={s.statLbl}>Médicos</Text>
              </View>
              <View style={s.statCard}>
                <View style={[s.statIcon, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="time-outline" size={18} color="#1E88E5" />
                </View>
                <Text style={s.statVal}>Seg–Sex</Text>
                <Text style={s.statLbl}>Horário</Text>
              </View>
            </View>

            {/* Informações */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Informações da Clínica</Text>
              {perfil.localizacao
                ? <InfoRow icon="location-outline" label="Localização" value={perfil.localizacao} />
                : null}
              {perfil.telefone
                ? <InfoRow icon="call-outline" label="Telefone" value={perfil.telefone} last />
                : null}
            </View>

            {/* Equipe médica vinculada */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Equipe Médica ({perfil.medicos.length})</Text>
              {perfil.medicos.length ? perfil.medicos.map((medico, i) => (
                <TouchableOpacity
                  key={medico.id}
                  style={[s.medicoRow, i === perfil.medicos.length - 1 && { borderBottomWidth: 0 }]}
                  onPress={() => navigation.navigate('DetalhesMedico', {
                    medicoId: medico.id,
                    nomeProfissional: medico.nome,
                  })}
                  activeOpacity={0.75}
                >
                  <View style={s.medicoAvatar}>
                    {medico.avatar
                      ? <Image source={{ uri: medico.avatar }} style={s.medicoAvatarImage} />
                      : <Text style={s.medicoAvatarText}>
                          {medico.nome.split(' ').filter(Boolean).slice(0, 2).map(parte => parte[0]).join('').toUpperCase()}
                        </Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.medicoNome}>{medico.nome}</Text>
                    <Text style={s.medicoEspecialidade}>{medico.especialidade}</Text>
                    <Text style={s.medicoCrm}>CRM {medico.crm}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#CCC" />
                </TouchableOpacity>
              )) : (
                <View style={s.equipeVazia}>
                  <Ionicons name="people-outline" size={34} color="#C8D8C8" />
                  <Text style={s.equipeVaziaText}>Nenhum médico vinculado.</Text>
                </View>
              )}
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
          <TouchableOpacity style={s.btnSecundario} onPress={handleContato} activeOpacity={0.85}>
            <Ionicons name="call-outline" size={18} color="#4CAF50" />
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

  // Equipe médica
  medicoRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F3F3',
  },
  medicoAvatar: {
    width: 42, height: 42, borderRadius: 21, overflow: 'hidden',
    backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', marginRight: 11,
  },
  medicoAvatarImage: { width: 42, height: 42 },
  medicoAvatarText: { color: '#2E7D32', fontSize: 13, fontWeight: '800' },
  medicoNome: { color: '#222', fontSize: 13, fontWeight: '700' },
  medicoEspecialidade: { color: '#2E7D32', fontSize: 12, marginTop: 2 },
  medicoCrm: { color: '#999', fontSize: 10, marginTop: 2 },
  equipeVazia: { alignItems: 'center', paddingVertical: 20 },
  equipeVaziaText: { color: '#999', fontSize: 12, marginTop: 7 },

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

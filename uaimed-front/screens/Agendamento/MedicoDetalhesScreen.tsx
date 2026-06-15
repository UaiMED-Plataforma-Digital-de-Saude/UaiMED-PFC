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

type Props = StackScreenProps<AgendamentoStackParamList, 'DetalhesMedico'>;

interface MedicoPerfil {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  especialidade: string;
  crm: string;
  cidade: string;
  estado: string;
  endereco: string;
  dataFormacao: string;
  pixKey: string | null;
  precoConsulta: number;
  totalAgendamentos: number;
  totalAvaliacoes: number;
  notaMedia: number | null;
  avaliacoes: { id: string; nota: number; comentario: string | null; paciente: string; data: string }[];
}

const Estrelas: React.FC<{ nota: number; size?: number }> = ({ nota, size = 13 }) => (
  <View style={{ flexDirection: 'row', gap: 1 }}>
    {[1,2,3,4,5].map(i => (
      <Ionicons key={i} name={i <= nota ? 'star' : 'star-outline'} size={size} color="#FFC107" />
    ))}
  </View>
);

const MedicoDetalhesScreen: React.FC<Props> = ({ route, navigation }) => {
  const { medicoId, pixKey: pixKeyParam, nomeProfissional } = route.params ?? {};
  const [perfil, setPerfil] = useState<MedicoPerfil | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!medicoId) { setLoading(false); return; }
    uaiMedApi.get(`/medicos/${medicoId}`)
      .then(r => setPerfil(r.data))
      .catch(() => setPerfil(null))
      .finally(() => setLoading(false));
  }, [medicoId]);

  const anoFormacao = perfil?.dataFormacao ? new Date(perfil.dataFormacao).getFullYear() : null;
  const anosExp = anoFormacao ? new Date().getFullYear() - anoFormacao : null;
  const iniciais = perfil?.nome
    ? perfil.nome.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase()
    : '?';

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.getParent<any>()?.navigate('Home');
  };

  const handleAgendar = () =>
    navigation.navigate('SelecaoHorario', {
      medicoId: medicoId ?? '',
      amount: perfil?.precoConsulta,
      pixKey: perfil?.pixKey ?? pixKeyParam,
      nomeProfissional: perfil?.nome ?? nomeProfissional,
    });

  const handleConversar = async () => {
    if (!medicoId) return;
    try {
      const res = await uaiMedApi.post('/conversas', { profissionalId: medicoId, titulo: perfil?.nome });
      navigation.getParent<any>()?.navigate('Conversas', {
        screen: 'ConversaDetalhe',
        params: { conversaId: res.data.id, titulo: perfil?.nome, nomeOutro: perfil?.nome },
      });
    } catch { /* segue */ }
  };

  if (loading) {
    return (
      <View style={s.loadingBg}>
        <StatusBar barStyle="light-content" backgroundColor="#388E3C" />
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#388E3C" />

      {/* ── Hero fixo ── */}
      <View style={s.hero}>
        <SafeAreaView edges={['top']} style={s.heroRow}>
          <TouchableOpacity style={s.backBtn} onPress={handleBack} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </TouchableOpacity>
          <View style={s.avatarRing}>
            {(perfil as any)?.avatar
              ? <Image source={{ uri: (perfil as any).avatar }} style={s.avatarImg} />
              : <Text style={s.avatarTxt}>{iniciais}</Text>
            }
          </View>
          <View style={s.heroInfo}>
            <Text style={s.heroNome} numberOfLines={1}>
              {perfil?.nome ?? nomeProfissional ?? 'Profissional'}
            </Text>
            {perfil && (
              <View style={s.heroBadgeRow}>
                <Ionicons name="medical" size={11} color="#A5D6A7" />
                <Text style={s.heroBadgeTxt}>{perfil.especialidade}</Text>
                {perfil.notaMedia !== null && (
                  <>
                    <Text style={s.heroDot}>·</Text>
                    <Ionicons name="star" size={11} color="#FFC107" />
                    <Text style={s.heroRatingTxt}>{perfil.notaMedia.toFixed(1)}</Text>
                  </>
                )}
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>

      {/* ── Conteúdo rolável ── */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {perfil ? (
          <>
            {/* Stats em linha */}
            <View style={s.statsRow}>
              <View style={[s.statCard, { borderRightWidth: 1, borderRightColor: '#F0F0F0' }]}>
                <View style={[s.statIcon, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="time-outline" size={18} color="#4CAF50" />
                </View>
                <Text style={s.statVal}>{anosExp ?? '—'}</Text>
                <Text style={s.statLbl}>Anos exp.</Text>
              </View>
              <View style={[s.statCard, { borderRightWidth: 1, borderRightColor: '#F0F0F0' }]}>
                <View style={[s.statIcon, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="calendar-outline" size={18} color="#1E88E5" />
                </View>
                <Text style={s.statVal}>{perfil.totalAgendamentos}</Text>
                <Text style={s.statLbl}>Consultas</Text>
              </View>
              <View style={s.statCard}>
                <View style={[s.statIcon, { backgroundColor: '#FFF8E1' }]}>
                  <Ionicons name="star-outline" size={18} color="#F9A825" />
                </View>
                <Text style={s.statVal}>{perfil.notaMedia?.toFixed(1) ?? '—'}</Text>
                <Text style={s.statLbl}>Avaliação</Text>
              </View>
            </View>

            {/* Sobre */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Sobre o Profissional</Text>
              <InfoRow icon="school-outline"   label="Formação"    value={anoFormacao ? `Formado em ${anoFormacao}` : 'Não informado'} />
              <InfoRow icon="ribbon-outline"   label="CRM"         value={perfil.crm || 'Não informado'} />
              <InfoRow icon="cash-outline"     label="Consulta"    value={`R$ ${perfil.precoConsulta.toFixed(2)}`} />
              <InfoRow icon="location-outline" label="Localização" value={[perfil.cidade, perfil.estado].filter(Boolean).join(', ') || 'Não informado'} />
              <InfoRow icon="home-outline"     label="Endereço"    value={perfil.endereco || 'Não informado'} />
              <InfoRow icon="call-outline" label="Telefone" value={perfil.telefone || 'Não informado'} last />
            </View>

            {/* Avaliações */}
            {perfil.avaliacoes.length > 0 && (
              <View style={s.card}>
                <Text style={s.cardTitle}>Avaliações ({perfil.totalAvaliacoes})</Text>
                {perfil.avaliacoes.map((a, i) => (
                  <View key={a.id} style={[s.avalCard, i === perfil.avaliacoes.length - 1 && { marginBottom: 0 }]}>
                    <View style={s.avalTop}>
                      <View style={s.avalAvatar}>
                        <Text style={s.avalAvatarTxt}>{a.paciente.charAt(0).toUpperCase()}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={s.avalNome}>{a.paciente}</Text>
                        <Estrelas nota={a.nota} />
                      </View>
                      <Text style={s.avalData}>
                        {new Date(a.data).toLocaleDateString('pt-BR', { day:'2-digit', month:'short' })}
                      </Text>
                    </View>
                    {a.comentario
                      ? <Text style={s.avalComentario}>"{a.comentario}"</Text>
                      : null}
                  </View>
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={s.erroBg}>
            <Ionicons name="alert-circle-outline" size={52} color="#CCC" />
            <Text style={s.erroTxt}>Perfil não encontrado</Text>
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
            <Text style={s.btnSecundarioTxt}>Conversar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnPrimario} onPress={handleAgendar} activeOpacity={0.85}>
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
  loadingBg: { flex: 1, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center' },

  // Hero
  hero: {
    backgroundColor: '#4CAF50',
    shadowColor: '#2E7D32',
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
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarImg: { width: 50, height: 50, borderRadius: 25 },
  avatarTxt: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  heroInfo: { flex: 1 },
  heroNome: { fontSize: 15, fontWeight: '800', color: '#FFF', letterSpacing: 0.1 },
  heroBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3, flexWrap: 'wrap' },
  heroBadgeTxt: { fontSize: 12, color: '#C8E6C9', fontWeight: '500' },
  heroDot: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  heroRatingTxt: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },

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
  statVal: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  statLbl: { fontSize: 11, color: '#999', fontWeight: '500' },

  // Card genérico
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

  // Avaliações
  avalCard: {
    backgroundColor: '#FAFAFA', borderRadius: 12, padding: 11,
    marginBottom: 8, borderWidth: 1, borderColor: '#EEEEEE',
  },
  avalTop: { flexDirection: 'row', alignItems: 'center' },
  avalAvatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center',
  },
  avalAvatarTxt: { fontSize: 13, fontWeight: '800', color: '#4CAF50' },
  avalNome: { fontSize: 13, fontWeight: '700', color: '#222', marginBottom: 3 },
  avalData: { fontSize: 11, color: '#CCC' },
  avalComentario: { fontSize: 13, color: '#666', fontStyle: 'italic', marginTop: 7, lineHeight: 18 },

  // Erro
  erroBg: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  erroTxt: { fontSize: 15, color: '#AAA' },
  erroBtn: { marginTop: 8, backgroundColor: '#4CAF50', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 11 },
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
    backgroundColor: '#4CAF50', borderRadius: 12, paddingVertical: 13,
    elevation: 2, shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 5,
  },
  btnPrimarioTxt: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});

export default MedicoDetalhesScreen;

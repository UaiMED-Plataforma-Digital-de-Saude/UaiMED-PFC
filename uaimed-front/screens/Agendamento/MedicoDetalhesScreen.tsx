import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar, Linking,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { AgendamentoStackParamList } from '../../navigation/types';
import uaiMedApi from '../../api/uaiMedApi';
import { distanciaKm, googleMapsUrl } from '../../utils/geo';
import { formatNota } from '../../utils/format';
import LocalizacaoMedicoCard from '../../components/LocalizacaoMedicoCard';
import ProfileHero, { heroBadgeStyles } from '../../components/ProfileHero';
import StatsRow from '../../components/StatsRow';
import InfoCard, { InfoRow } from '../../components/InfoCard';
import ProfileFooter from '../../components/ProfileFooter';
import AppModal from '../../components/AppModal';
import { useModal } from '../../hooks/useModal';

type Props = StackScreenProps<AgendamentoStackParamList, 'DetalhesMedico'>;

interface MedicoPerfil {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  avatar: string | null;
  especialidade: string;
  crm: string;
  cidade: string;
  estado: string;
  endereco: string;
  latitude: number | null;
  longitude: number | null;
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
  const [distancia, setDistancia] = useState<number | null>(null);
  const [iniciandoConversa, setIniciandoConversa] = useState(false);
  const { modal, showModal, hideModal } = useModal();

  useEffect(() => {
    if (!medicoId) { setLoading(false); return; }
    uaiMedApi.get(`/medicos/${medicoId}`)
      .then(r => setPerfil(r.data))
      .catch(() => setPerfil(null))
      .finally(() => setLoading(false));
  }, [medicoId]);

  useEffect(() => {
    if (perfil?.latitude == null || perfil?.longitude == null) return;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      setDistancia(distanciaKm(
        pos.coords.latitude, pos.coords.longitude,
        perfil.latitude!, perfil.longitude!,
      ));
    })().catch(() => { /* localização é opcional, ignora falha */ });
  }, [perfil?.latitude, perfil?.longitude]);

  const handleAbrirMapa = () => {
    if (perfil?.latitude == null || perfil?.longitude == null) return;
    Linking.openURL(googleMapsUrl(perfil.latitude, perfil.longitude));
  };

  const handleLigar = () => {
    if (!perfil?.telefone) return;
    Linking.openURL(`tel:${perfil.telefone.replace(/\D/g, '')}`);
  };

  const anoFormacao = perfil?.dataFormacao ? new Date(perfil.dataFormacao).getFullYear() : null;
  const anosExp = anoFormacao ? new Date().getFullYear() - anoFormacao : null;
  const iniciais = perfil?.nome
    ? perfil.nome.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase()
    : '?';

  const handleBack = () => {
    navigation.getParent<any>()?.navigate('Home');
  };

  const handleAgendar = () =>
    navigation.navigate('SelecaoHorario', {
      medicoId: medicoId ?? '',
      amount: perfil?.precoConsulta,
      pixKey: perfil?.pixKey ?? pixKeyParam,
      nomeProfissional: perfil?.nome ?? nomeProfissional,
      latitude: perfil?.latitude,
      longitude: perfil?.longitude,
    });

  const handleConversar = async () => {
    if (!medicoId || iniciandoConversa) return;
    setIniciandoConversa(true);
    try {
      const res = await uaiMedApi.post('/conversas', { profissionalId: medicoId, titulo: perfil?.nome });
      navigation.getParent<any>()?.navigate('Conversas', {
        screen: 'ConversaDetalhe',
        params: {
          conversaId: res.data.id,
          titulo: perfil?.nome ?? nomeProfissional ?? 'Médico',
          nomeOutro: perfil?.nome ?? nomeProfissional ?? 'Médico',
        },
      });
    } catch (error: any) {
      showModal(
        'Não foi possível abrir a conversa',
        error.response?.data?.error ?? 'Verifique sua conexão e tente novamente.',
        { type: 'error' },
      );
    } finally {
      setIniciandoConversa(false);
    }
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

      <ProfileHero
        color="#4CAF50"
        shadowColor="#2E7D32"
        onBack={handleBack}
        avatarUri={perfil?.avatar}
        iniciais={iniciais}
        nome={perfil?.nome ?? nomeProfissional ?? 'Profissional'}
      >
        {perfil && (
          <View style={heroBadgeStyles.row}>
            <Ionicons name="medical" size={11} color="#A5D6A7" />
            <Text style={heroBadgeStyles.text}>{perfil.especialidade}</Text>
            {perfil.notaMedia !== null && (
              <>
                <Text style={heroBadgeStyles.dot}>·</Text>
                <Ionicons name="star" size={11} color="#FFC107" />
                <Text style={heroBadgeStyles.extraText}>{formatNota(perfil.notaMedia)}</Text>
              </>
            )}
          </View>
        )}
      </ProfileHero>

      {/* ── Conteúdo rolável ── */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {perfil ? (
          <>
            <StatsRow stats={[
              { icon: 'time-outline', iconBg: '#E8F5E9', iconColor: '#4CAF50', value: anosExp != null ? String(anosExp) : '—', label: 'Anos exp.' },
              { icon: 'calendar-outline', iconBg: '#E3F2FD', iconColor: '#1E88E5', value: String(perfil.totalAgendamentos), label: 'Consultas' },
              { icon: 'star-outline', iconBg: '#FFF8E1', iconColor: '#F9A825', value: perfil.notaMedia != null ? formatNota(perfil.notaMedia) : '—', label: 'Avaliação' },
            ]} />

            <InfoCard title="Sobre o Profissional">
              <InfoRow icon="school-outline"   label="Formação"    value={anoFormacao ? `Formado em ${anoFormacao}` : 'Não informado'} />
              <InfoRow icon="ribbon-outline"   label="CRM"         value={perfil.crm || 'Não informado'} />
              <InfoRow icon="cash-outline"     label="Consulta"    value={`R$ ${perfil.precoConsulta.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
              <InfoRow icon="location-outline" label="Localização" value={[perfil.cidade, perfil.estado].filter(Boolean).join(', ') || 'Não informado'} />
              <InfoRow icon="home-outline"     label="Endereço"    value={perfil.endereco || 'Não informado'} />
              <InfoRow
                icon="call-outline"
                label="Telefone"
                value={perfil.telefone || 'Não informado'}
                onPress={perfil.telefone ? handleLigar : undefined}
              />
              <InfoRow
                icon="mail-outline"
                label="Mensagem"
                value="Enviar uma mensagem para o profissional"
                onPress={() => navigation.navigate('ContatoProfissional', { medicoId: medicoId ?? '' })}
                last
              />
            </InfoCard>

            {/* Localização */}
            {perfil.latitude != null && perfil.longitude != null && (
              <LocalizacaoMedicoCard
                latitude={perfil.latitude}
                longitude={perfil.longitude}
                distanciaKm={distancia}
                onAbrirMapa={handleAbrirMapa}
              />
            )}

            {/* Avaliações */}
            <InfoCard title={`Avaliações (${perfil.totalAvaliacoes})`}>
              {perfil.avaliacoes.length > 0 ? perfil.avaliacoes.map((a, i) => (
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
              )) : (
                <View style={s.avalVazia}>
                  <Ionicons name="star-outline" size={34} color="#E0E0E0" />
                  <Text style={s.avalVaziaText}>Ainda não há avaliações para este profissional.</Text>
                </View>
              )}
            </InfoCard>
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

      {perfil && (
        <ProfileFooter
          secondaryIcon="chatbubble-outline"
          secondaryLabel={iniciandoConversa ? 'Abrindo...' : 'Conversar'}
          secondaryLoading={iniciandoConversa}
          onSecondaryPress={handleConversar}
          primaryIcon="calendar-outline"
          primaryLabel="Agendar Consulta"
          onPrimaryPress={handleAgendar}
          primaryColor="#4CAF50"
        />
      )}

      <AppModal {...modal} onClose={hideModal} />
    </View>
  );
};

// ── Estilos ──────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F0F2F5' },
  loadingBg: { flex: 1, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center' },

  // Scroll
  scrollContent: { padding: 10, paddingBottom: 24 },

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
  avalVazia: { alignItems: 'center', paddingVertical: 20 },
  avalVaziaText: { color: '#999', fontSize: 12, marginTop: 7, textAlign: 'center' },

  // Erro
  erroBg: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  erroTxt: { fontSize: 15, color: '#AAA' },
  erroBtn: { marginTop: 8, backgroundColor: '#4CAF50', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 11 },
  erroBtnTxt: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});

export default MedicoDetalhesScreen;

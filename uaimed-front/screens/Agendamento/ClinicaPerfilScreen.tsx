import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Image, Linking, StatusBar,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { AgendamentoStackParamList } from '../../navigation/types';
import uaiMedApi from '../../api/uaiMedApi';
import { formatNota } from '../../utils/format';
import ProfileHero, { heroBadgeStyles } from '../../components/ProfileHero';
import StatsRow from '../../components/StatsRow';
import InfoCard, { InfoRow } from '../../components/InfoCard';
import ProfileFooter from '../../components/ProfileFooter';

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
  const scrollRef = useRef<ScrollView>(null);
  const [equipeY, setEquipeY] = useState(0);

  useEffect(() => {
    if (!clinicaId) { setLoading(false); return; }
    uaiMedApi.get(`/clinicas/${clinicaId}`)
      .then(r => setPerfil(r.data))
      .catch(() => setPerfil(null))
      .finally(() => setLoading(false));
  }, [clinicaId]);

  const nome = perfil?.nome ?? nomeClinica ?? '?';
  const iniciais = nome.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase();
  const totalConsultas = perfil?.medicos.reduce((acc, m) => acc + m.totalAgendamentos, 0) ?? 0;
  type InfoField = { icon: 'location-outline' | 'call-outline'; label: string; value: string; onPress?: () => void };
  const infoFields: InfoField[] = [
    perfil?.localizacao ? { icon: 'location-outline', label: 'Localização', value: perfil.localizacao } : null,
    perfil?.telefone
      ? {
          icon: 'call-outline',
          label: 'Telefone',
          value: perfil.telefone,
          onPress: () => Linking.openURL(`tel:${perfil.telefone!.replace(/\D/g, '')}`),
        }
      : null,
  ].filter((f): f is InfoField => f !== null);

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

  // Clínica com 1 só médico: vai direto pro perfil dele (ali sim existe o
  // "Agendar Consulta" real). Com mais de um, rola até a lista pra escolher
  // — evita que o CTA da clínica caia numa busca genérica sem contexto.
  const handleAgendarConsulta = () => {
    if (!perfil || perfil.medicos.length === 0) return;
    if (perfil.medicos.length === 1) {
      const unico = perfil.medicos[0];
      navigation.navigate('DetalhesMedico', { medicoId: unico.id, nomeProfissional: unico.nome });
      return;
    }
    scrollRef.current?.scrollTo({ y: equipeY, animated: true });
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

      <ProfileHero
        color="#388E3C"
        shadowColor="#1B5E20"
        onBack={handleBack}
        avatarUri={perfil?.avatar}
        iniciais={iniciais}
        avatarBorderRadius={12}
        nome={nome}
      >
        {perfil && (
          <View style={heroBadgeStyles.row}>
            <Ionicons name="business" size={11} color="#A5D6A7" />
            <Text style={heroBadgeStyles.text}>Clínica Médica</Text>
            {perfil.localizacao ? (
              <>
                <Text style={heroBadgeStyles.dot}>·</Text>
                <Ionicons name="location-outline" size={11} color="#C8E6C9" />
                <Text style={[heroBadgeStyles.text, { flex: 1 }]} numberOfLines={1}>{perfil.localizacao}</Text>
              </>
            ) : null}
          </View>
        )}
      </ProfileHero>

      {/* ── Conteúdo rolável ── */}
      <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {perfil ? (
          <>
            <StatsRow stats={[
              { icon: 'star-outline', iconBg: '#FFF8E1', iconColor: '#F9A825', value: perfil.nota != null ? formatNota(perfil.nota) : '—', label: 'Avaliação' },
              { icon: 'shield-checkmark-outline', iconBg: '#E8F5E9', iconColor: '#4CAF50', value: String(perfil.medicos.length), label: 'Médicos' },
              { icon: 'calendar-outline', iconBg: '#E3F2FD', iconColor: '#1E88E5', value: String(totalConsultas), label: 'Consultas' },
            ]} />

            <InfoCard title="Informações da Clínica">
              {infoFields.length ? infoFields.map((f, i) => (
                <InfoRow key={f.label} icon={f.icon} label={f.label} value={f.value} onPress={f.onPress} last={i === infoFields.length - 1} />
              )) : (
                <Text style={s.semInfoTxt}>Nenhuma informação adicional cadastrada.</Text>
              )}
            </InfoCard>

            {/* Equipe médica vinculada */}
            <View onLayout={(e) => setEquipeY(e.nativeEvent.layout.y)}>
              <InfoCard title={`Equipe Médica (${perfil.medicos.length})`}>
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
              </InfoCard>
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

      {perfil && (
        <ProfileFooter
          secondaryIcon="call-outline"
          secondaryLabel="Contato"
          onSecondaryPress={handleContato}
          primaryIcon="calendar-outline"
          primaryLabel="Agendar Consulta"
          onPrimaryPress={handleAgendarConsulta}
          primaryColor="#388E3C"
        />
      )}
    </View>
  );
};

// ── Estilos ──────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F0F2F5' },
  loadingBg: { flex: 1, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center' },

  // Scroll
  scrollContent: { padding: 10, paddingBottom: 24 },

  semInfoTxt: { fontSize: 12, color: '#999' },

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
});

export default ClinicaPerfilScreen;

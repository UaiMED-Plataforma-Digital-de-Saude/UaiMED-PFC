import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { MainTabParamList } from '../../navigation/types';
import uaiMedApi from '../../api/uaiMedApi';
import { formatNota, formatMoeda, iniciais } from '../../utils/format';
import MedicoDrawer from '../../components/MedicoDrawer';
import StatsRow from '../../components/StatsRow';
import ArtigosDestaque from '../../components/ArtigosDestaque';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

interface ConsultaResumo {
  id: string;
  dataHora: string;
  status: string;
  usuario: { nome: string };
}

interface AvaliacoesResumo {
  notaMedia: number;
  totalAvaliacoes: number;
}

interface ConversaResumo {
  naoLidas: number;
}

// Formata a data da próxima consulta de forma relativa (Hoje/Amanhã) —
// é o primeiro número que o médico precisa ler ao abrir o app.
function formatDataConsulta(iso: string): string {
  const data = new Date(iso);
  const hoje = new Date();
  const amanha = new Date(hoje);
  amanha.setDate(hoje.getDate() + 1);
  const horario = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const mesmoDia = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (mesmoDia(data, hoje)) return `Hoje, ${horario}`;
  if (mesmoDia(data, amanha)) return `Amanhã, ${horario}`;
  return `${data.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}, ${horario}`;
}

// Semana corrente (segunda a domingo) usada pra contar "consultas desta semana".
function inicioFimSemana(ref: Date): [Date, Date] {
  const inicio = new Date(ref);
  const diaSemana = (inicio.getDay() + 6) % 7; // 0 = segunda-feira
  inicio.setDate(inicio.getDate() - diaSemana);
  inicio.setHours(0, 0, 0, 0);
  const fim = new Date(inicio);
  fim.setDate(inicio.getDate() + 7);
  return [inicio, fim];
}

const MedicoHomeScreen: React.FC<Props> = ({ navigation, route }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [proximaConsulta, setProximaConsulta] = useState<ConsultaResumo | null>(null);
  const [consultasSemana, setConsultasSemana] = useState(0);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacoesResumo>({ notaMedia: 0, totalAvaliacoes: 0 });
  const [mensagensNaoLidas, setMensagensNaoLidas] = useState(0);
  const [contatosPendentes, setContatosPendentes] = useState(0);
  const [receitaMes, setReceitaMes] = useState(0);

  useEffect(() => {
    if (route.params?.openMenu) {
      setDrawerOpen(true);
      navigation.setParams({ openMenu: undefined });
    }
  }, [navigation, route.params?.openMenu]);

  useFocusEffect(useCallback(() => {
    let ativo = true;
    setCarregando(true);

    Promise.all([
      uaiMedApi.get('/professionals/me/agendamentos'),
      uaiMedApi.get('/professionals/me/avaliacoes'),
      uaiMedApi.get('/conversas'),
      uaiMedApi.get('/professionals/me/summary'),
    ]).then(([agendaRes, avaliacoesRes, conversasRes, summaryRes]) => {
      if (!ativo) return;

      const consultas: ConsultaResumo[] = Array.isArray(agendaRes.data) ? agendaRes.data : [];
      const agora = Date.now();

      const futuras = consultas
        .filter(c => new Date(c.dataHora).getTime() >= agora && ['agendado', 'confirmado'].includes(c.status))
        .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());
      setProximaConsulta(futuras[0] ?? null);

      const [inicioSemana, fimSemana] = inicioFimSemana(new Date());
      setConsultasSemana(consultas.filter(c => {
        const t = new Date(c.dataHora).getTime();
        return c.status !== 'cancelado' && t >= inicioSemana.getTime() && t < fimSemana.getTime();
      }).length);

      setAvaliacoes({
        notaMedia: avaliacoesRes.data?.notaMedia ?? 0,
        totalAvaliacoes: avaliacoesRes.data?.totalAvaliacoes ?? 0,
      });

      const conversas: ConversaResumo[] = Array.isArray(conversasRes.data) ? conversasRes.data : [];
      setMensagensNaoLidas(conversas.reduce((acc, c) => acc + (c.naoLidas ?? 0), 0));

      setContatosPendentes(summaryRes.data?.pendingContacts ?? 0);
      setReceitaMes(summaryRes.data?.revenueThisMonth ?? 0);
    }).catch(() => {
      // Resumo é só informativo — se falhar, mantém os valores padrão em vez de travar a tela.
    }).finally(() => {
      if (ativo) setCarregando(false);
    });

    return () => { ativo = false; };
  }, []));

  return (
    <View style={styles.container}>
      <MedicoDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigation={navigation}
        pendingContacts={contatosPendentes}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={[styles.proximaCard, proximaConsulta ? styles.proximaCardAtiva : styles.proximaCardVazia]}
          onPress={() => navigation.navigate('MedicoAgenda')}
          activeOpacity={0.9}
        >
          <Text style={[styles.proximaLabel, proximaConsulta && styles.proximaLabelAtiva]}>
            PRÓXIMA CONSULTA
          </Text>

          {carregando ? (
            <ActivityIndicator size="small" color="#FFF" style={styles.proximaLoading} />
          ) : proximaConsulta ? (
            <View style={styles.proximaBody}>
              <View style={styles.proximaAvatar}>
                <Text style={styles.proximaAvatarTxt}>{iniciais(proximaConsulta.usuario.nome)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.proximaNome} numberOfLines={1}>{proximaConsulta.usuario.nome}</Text>
                <Text style={styles.proximaQuando}>{formatDataConsulta(proximaConsulta.dataHora)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.85)" />
            </View>
          ) : (
            <View style={styles.proximaBody}>
              <Ionicons name="calendar-outline" size={22} color="#9AA6A0" />
              <Text style={styles.proximaVazio}>Nenhuma consulta agendada.</Text>
            </View>
          )}
        </TouchableOpacity>

        <StatsRow stats={[
          {
            icon: 'calendar-outline', iconBg: '#E3F2FD', iconColor: '#1E88E5',
            value: carregando ? '—' : String(consultasSemana), label: 'Essa semana',
            onPress: () => navigation.navigate('MedicoAgenda'),
          },
          {
            icon: 'star-outline', iconBg: '#FFF8E1', iconColor: '#F9A825',
            value: carregando ? '—' : (avaliacoes.totalAvaliacoes > 0 ? formatNota(avaliacoes.notaMedia) : '—'),
            label: 'Avaliação',
            onPress: () => navigation.navigate('MedicoAvaliacoes'),
          },
          {
            icon: 'chatbubble-outline', iconBg: '#E8F5E9', iconColor: '#4CAF50',
            value: carregando ? '—' : String(mensagensNaoLidas), label: 'Mensagens',
            onPress: () => navigation.navigate('Conversas', { screen: 'ConversasLista' }),
          },
        ]} />

        <TouchableOpacity
          style={styles.dashboardCard}
          onPress={() => navigation.navigate('MedicoDashboard')}
          activeOpacity={0.9}
        >
          <View style={styles.dashboardIcon}>
            <Ionicons name="bar-chart" size={22} color="#00897B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.dashboardTitle}>Dashboard</Text>
            <Text style={styles.dashboardSubtitle}>
              {carregando ? 'Carregando...' : `Receita este mês: ${formatMoeda(receitaMes)}`}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#A5A5A5" />
        </TouchableOpacity>

        <ArtigosDestaque
          onPressArtigo={(id) => navigation.navigate('ArtigoDetalhes', { artigoId: id })}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8F6' },
  content: { padding: 18, paddingBottom: 40 },

  proximaCard: {
    borderRadius: 16, padding: 18,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6,
  },
  proximaCardAtiva: { backgroundColor: '#2E7D32' },
  proximaCardVazia: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E4ECE4', elevation: 0, shadowOpacity: 0 },
  proximaLabel: { color: '#9AA6A0', fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  proximaLabelAtiva: { color: 'rgba(255,255,255,0.75)' },
  proximaLoading: { alignSelf: 'flex-start', marginTop: 10 },
  proximaBody: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  proximaAvatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.22)',
  },
  proximaAvatarTxt: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  proximaNome: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  proximaQuando: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 2 },
  proximaVazio: { color: '#999', fontSize: 14 },

  dashboardCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: 14, padding: 16, marginTop: 14,
    borderWidth: 1, borderColor: '#E4ECE4', gap: 12,
  },
  dashboardIcon: {
    width: 42, height: 42, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#E0F2F1',
  },
  dashboardTitle: { color: '#222', fontSize: 15, fontWeight: '700' },
  dashboardSubtitle: { color: '#7A7A7A', fontSize: 13, marginTop: 3 },
});

export default MedicoHomeScreen;

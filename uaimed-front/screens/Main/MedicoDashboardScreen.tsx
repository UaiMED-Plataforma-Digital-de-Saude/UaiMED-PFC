import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import uaiMedApi from '../../api/uaiMedApi';
import { formatNota, formatMoeda } from '../../utils/format';
import StatsRow from '../../components/StatsRow';

interface SeriePonto {
  count: number;
  revenue: number;
}

interface SerieDiaria extends SeriePonto { day: string; }
interface SerieMensal extends SeriePonto { month: string; }

interface MedicoSummary {
  totalToday: number;
  ratingAvg: number | null;
  revenueThisMonth: number;
  pendingContacts: number;
  weekly: SerieDiaria[];
  monthly: SerieMensal[];
}

const chartConfigBase = {
  backgroundColor: '#fff',
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
  style: { borderRadius: 8 },
};

const chartWidth = Dimensions.get('window').width - 36;

const MedicoDashboardScreen: React.FC = () => {
  const [summary, setSummary] = useState<MedicoSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let ativo = true;
    setLoading(true);

    uaiMedApi.get('/professionals/me/summary').then((res) => {
      if (ativo) setSummary(res.data);
    }).catch((erro) => {
      console.warn('[MedicoDashboard] Erro ao buscar resumo:', erro);
    }).finally(() => {
      if (ativo) setLoading(false);
    });

    return () => { ativo = false; };
  }, []));

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Carregando dashboard...</Text>
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Não foi possível carregar o dashboard.</Text>
      </View>
    );
  }

  const receitaSemana = summary.weekly.reduce((soma, dia) => soma + dia.revenue, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatsRow stats={[
        { icon: 'today-outline', iconBg: '#E3F2FD', iconColor: '#1E88E5', value: String(summary.totalToday), label: 'Hoje' },
        {
          icon: 'star-outline', iconBg: '#FFF8E1', iconColor: '#F9A825',
          value: summary.ratingAvg != null ? formatNota(summary.ratingAvg) : '—', label: 'Avaliação',
        },
        { icon: 'mail-unread-outline', iconBg: '#FFEBEE', iconColor: '#E53935', value: String(summary.pendingContacts), label: 'Pendências' },
      ]} />

      <StatsRow stats={[
        { icon: 'cash-outline', iconBg: '#E8F5E9', iconColor: '#2E7D32', value: formatMoeda(receitaSemana), label: 'Receita esta semana' },
        { icon: 'wallet-outline', iconBg: '#E0F2F1', iconColor: '#00897B', value: formatMoeda(summary.revenueThisMonth), label: 'Receita este mês' },
      ]} />

      <Text style={styles.sectionTitle}>Consultas na semana</Text>
      <View style={styles.chartCard}>
        <LineChart
          data={{
            labels: summary.weekly.map((d) => d.day.slice(5)),
            datasets: [{ data: summary.weekly.map((d) => d.count) }],
          }}
          width={chartWidth}
          height={180}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            ...chartConfigBase,
            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
            propsForDots: { r: '5', strokeWidth: '2', stroke: '#388E3C' },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      <Text style={styles.sectionTitle}>Receita nos últimos 6 meses</Text>
      <View style={styles.chartCard}>
        <BarChart
          data={{
            labels: summary.monthly.map((m) => m.month.slice(5)),
            datasets: [{ data: summary.monthly.map((m) => m.revenue) }],
          }}
          width={chartWidth}
          height={180}
          yAxisLabel="R$"
          fromZero
          chartConfig={{
            ...chartConfigBase,
            color: (opacity = 1) => `rgba(0, 137, 123, ${opacity})`,
          }}
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8F6' },
  content: { padding: 18, paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6F8F6' },
  loadingText: { color: '#777', fontSize: 14, marginTop: 10 },
  sectionTitle: { color: '#222', fontSize: 16, fontWeight: '800', marginTop: 18, marginBottom: 10 },
  chartCard: {
    backgroundColor: '#FFF', borderRadius: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#E8E8E8', alignItems: 'center',
  },
  chart: { borderRadius: 8 },
});

export default MedicoDashboardScreen;

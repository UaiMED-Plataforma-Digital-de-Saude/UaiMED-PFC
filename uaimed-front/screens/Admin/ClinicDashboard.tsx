import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import uaiMedApi from '../../api/uaiMedApi';
import { useAuth } from '../../hooks/useAuth';

const ClinicDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await uaiMedApi.get('/admin/summary');
        if (!mounted) return;
        setSummary(res.data);
      } catch (e) {
        console.warn('Erro ao buscar dashboard da clínica', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, [user]);

  if (!user) return <View style={styles.container}><Text>Usuário não autenticado.</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard da Clínica</Text>
      {loading ? <ActivityIndicator /> : (
        <View>
          {summary ? (
            <>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Usuários</Text>
                <Text>Total: {summary.totalUsuarios}</Text>
                <Text>Pacientes: {summary.totalPacientes}</Text>
                <Text>Médicos: {summary.totalMedicos}</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Contatos Pendentes</Text>
                <Text>{summary.totalContatosPendentes}</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Agendamentos Hoje</Text>
                <Text>{summary.totalAgendamentosHoje}</Text>
              </View>

              {/* Gráfico de agendamentos por dia */}
              {summary.appointmentsByDay && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Agendamentos por Dia</Text>
                  <LineChart
                    data={{
                      labels: summary.appointmentsByDay.map((d: any) => d.day.slice(5)),
                      datasets: [
                        { data: summary.appointmentsByDay.map((d: any) => d.count) }
                      ]
                    }}
                    width={Dimensions.get('window').width - 48}
                    height={180}
                    yAxisLabel=""
                    yAxisSuffix=""
                    chartConfig={{
                      backgroundColor: '#fff',
                      backgroundGradientFrom: '#fff',
                      backgroundGradientTo: '#fff',
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
                      style: { borderRadius: 8 },
                      propsForDots: { r: '5', strokeWidth: '2', stroke: '#388E3C' },
                    }}
                    bezier
                    style={{ marginVertical: 8, borderRadius: 8 }}
                  />
                </View>
              )}

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Top Profissionais</Text>
                <FlatList
                  data={summary.topProfissionais || []}
                  keyExtractor={(i: any) => i.id}
                  renderItem={({ item }) => (
                    <View style={{ paddingVertical: 6 }}>
                      <Text style={{ fontWeight: '700' }}>{item.nome}</Text>
                      <Text style={{ color: '#666' }}>{item.especialidade} — {item.total} agend.</Text>
                    </View>
                  )}
                />
              </View>
            </>
          ) : (
            <Text>Nenhum dado disponível.</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#FAFAFA' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  card: { backgroundColor: '#FFF', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#F5F5F5' },
  cardTitle: { fontWeight: '700', marginBottom: 8 },
});

export default ClinicDashboard;

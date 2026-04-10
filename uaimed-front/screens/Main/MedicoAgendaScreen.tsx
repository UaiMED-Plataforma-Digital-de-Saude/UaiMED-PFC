import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import uaiMedApi from '../../api/uaiMedApi';

const MedicoAgendaScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await uaiMedApi.get('/professionals/me/summary');
        if (!mounted) return;
        setSummary(res.data);
      } catch (e) {
        console.warn('Erro ao buscar resumo do médico', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  // Usa user?.id (string estável) em vez do objeto completo para evitar re-renders desnecessários
  }, [user?.id]);

  if (!user) return <View style={styles.container}><Text>Usuário não autenticado.</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minha Agenda</Text>
      {loading ? <ActivityIndicator /> : (
        <>
          {summary ? (
            <>
              <View style={styles.kpisRow}>
                <View style={styles.kpiCard}>
                  <Text style={styles.kpiLabel}>Agendamentos Hoje</Text>
                  <Text style={styles.kpiValue}>{summary.totalToday}</Text>
                </View>
                <View style={styles.kpiCard}>
                  <Text style={styles.kpiLabel}>Avaliação Média</Text>
                  <Text style={styles.kpiValue}>{summary.ratingAvg ? summary.ratingAvg.toFixed(1) : '—'}</Text>
                </View>
                <View style={styles.kpiCard}>
                  <Text style={styles.kpiLabel}>Receita (mês)</Text>
                  <Text style={styles.kpiValue}>R$ {summary.revenueThisMonth?.toFixed(2)}</Text>
                </View>
              </View>

              <Text style={{ fontWeight: '700', marginTop: 12 }}>Próximos Agendamentos</Text>
              <FlatList
                data={summary.nextAppointments || []}
                keyExtractor={(i: any) => i.id}
                renderItem={({ item }: any) => (
                  <View style={styles.item}>
                    <Text style={styles.itemTitle}>{item.usuario?.nome || 'Paciente'}</Text>
                    <Text style={styles.itemSub}>{new Date(item.dataHora).toLocaleString()}</Text>
                  </View>
                )}
                ListEmptyComponent={<Text style={{ marginTop: 12 }}>Nenhum agendamento futuro.</Text>}
              />
            </>
          ) : (
            <Text>Nenhum dado disponível.</Text>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#FAFAFA' },
  title: { fontSize: 22, fontWeight: '700', marginTop: 22, marginBottom: 12 },
  kpisRow: { flexDirection: 'row', justifyContent: 'space-between' },
  kpiCard: { backgroundColor: '#FFF', padding: 10, borderRadius: 8, flex: 1, alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: '#F5F5F5' },
  kpiLabel: { fontSize: 12, color: '#777' },
  kpiValue: { fontSize: 18, fontWeight: '700', marginTop: 6 },
  item: { backgroundColor: '#FFF', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#F5F5F5' },
  itemTitle: { fontWeight: '700' },
  itemSub: { color: '#666', marginTop: 4 },
});

export default MedicoAgendaScreen;

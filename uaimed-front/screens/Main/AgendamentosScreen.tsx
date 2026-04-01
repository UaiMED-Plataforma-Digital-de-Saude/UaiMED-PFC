import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/types';
import uaiMedApi from '../../api/uaiMedApi';
import { Ionicons } from '@expo/vector-icons';

type AgendamentosScreenProps = BottomTabScreenProps<MainTabParamList, 'Agendamentos'>;

// Tipagem básica para um agendamento
interface Agendamento {
  id: string;
  medico: string;
  especialidade: string;
  data: string; // Ex: '2025-12-10T14:00:00Z'
  status: 'confirmado' | 'cancelado' | 'realizado';
}

/**
 * AgendamentosScreen
 * Exibe a lista de agendamentos do usuário com filtros
 */
const AgendamentosScreen: React.FC<AgendamentosScreenProps> = ({ navigation }) => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Estado para controlar qual Tab interna está ativa (Futuros/Anteriores)
  const [activeTab, setActiveTab] = useState<'futuros' | 'anteriores'>('futuros');

  // Filtros avançados
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [especialidadeFilter, setEspecialidadeFilter] = useState<string>('');
  const [dataFilter, setDataFilter] = useState<string>(''); // formato: yyyy-mm-dd

  // SIMULAÇÃO DE DADOS (Substitua pela chamada real)
  const simulatedData: Agendamento[] = [
    {
      id: '1',
      medico: 'Dr. Lucas Ribeiro',
      especialidade: 'Cardiologia',
      data: '2025-12-20T10:00:00Z',
      status: 'confirmado',
    },
    {
      id: '2',
      medico: 'Dra. Ana Costa',
      especialidade: 'Ginecologia',
      data: '2025-11-05T15:30:00Z',
      status: 'realizado',
    },
  ];

  // Efeito para carregar os dados
  useEffect(() => {
    // TODO: Substituir por chamada real à API
    const fetchAgendamentos = async () => {
      try {
        try {
          const response = await uaiMedApi.get('/agendamentos');
          setAgendamentos(response.data);
        } catch (err) {
          // Se a chamada real falhar (backend não disponível), usa dados simulados
          console.warn('Falha ao obter agendamentos do backend, usando simulados', err);
          setAgendamentos(simulatedData);
        }
      } catch (e) {
        console.error('Erro ao carregar agendamentos:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgendamentos();
  }, []);

  // Filtra os agendamentos com base na aba ativa e filtros avançados
  const filteredAgendamentos = agendamentos.filter(agendamento => {
    const isFuture = new Date(agendamento.data) > new Date();
    if (activeTab === 'futuros' && !isFuture) return false;
    if (activeTab === 'anteriores' && isFuture) return false;
    if (statusFilter && agendamento.status !== statusFilter) return false;
    if (especialidadeFilter && !agendamento.especialidade.toLowerCase().includes(especialidadeFilter.toLowerCase())) return false;
    if (dataFilter && !agendamento.data.startsWith(dataFilter)) return false;
    return true;
  });

  // Componente de renderização de cada item da lista
  const renderItem = ({ item }: { item: Agendamento }) => (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.cardTitle}>{item.medico} ({item.especialidade})</Text>
      <Text style={styles.cardSubtitle}>
        <Ionicons name="calendar-outline" size={14} /> {new Date(item.data).toLocaleDateString()}
        <Ionicons name="time-outline" size={14} style={{marginLeft: 10}} /> {new Date(item.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
      </Text>
      <Text style={item.status === 'confirmado' ? styles.statusConfirmed : styles.statusCompleted}>
        {item.status.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Meus Agendamentos</Text>

      {/* Navegação Interna (Tabs) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'futuros' && styles.tabActive]}
          onPress={() => setActiveTab('futuros')}
        >
          <Text style={styles.tabText}>Futuros</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'anteriores' && styles.tabActive]}
          onPress={() => setActiveTab('anteriores')}
        >
          <Text style={styles.tabText}>Anteriores</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros Avançados */}
      <View style={{ flexDirection: 'row', padding: 10, backgroundColor: '#FFF', alignItems: 'center', gap: 8 }}>
        <TextInput
          style={{ flex: 1, backgroundColor: '#F5F5F5', borderRadius: 8, paddingHorizontal: 8, marginRight: 4, height: 36 }}
          placeholder="Filtrar por especialidade"
          value={especialidadeFilter}
          onChangeText={setEspecialidadeFilter}
        />
        <TextInput
          style={{ width: 90, backgroundColor: '#F5F5F5', borderRadius: 8, paddingHorizontal: 8, marginRight: 4, height: 36 }}
          placeholder="Data (aaaa-mm-dd)"
          value={dataFilter}
          onChangeText={setDataFilter}
        />
        <TextInput
          style={{ width: 100, backgroundColor: '#F5F5F5', borderRadius: 8, paddingHorizontal: 8, height: 36 }}
          placeholder="Status"
          value={statusFilter}
          onChangeText={setStatusFilter}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredAgendamentos}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={() => <Text style={styles.emptyText}>Nenhum agendamento nesta categoria.</Text>}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Botão Flutuante para Novo Agendamento */}
      <TouchableOpacity 
        style={styles.floatingButton} 
        onPress={() => console.log('Navegar para a tela de busca/agendamento')}
      >
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', paddingTop: 0, marginTop: 12 },
  headerTitle: { fontSize: 26, fontWeight: '700', padding: 20, paddingTop: 56, marginTop: 8, backgroundColor: '#FFF', marginBottom: 2 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#FFF', paddingHorizontal: 0, borderBottomWidth: 1, borderColor: '#F0F0F0' },
  tabButton: { flex: 1, paddingVertical: 16, alignItems: 'center', backgroundColor: '#FFF' },
  tabActive: { borderBottomWidth: 3, borderColor: '#4CAF50' },
  tabText: { fontSize: 15, fontWeight: '600', color: '#666' },
  card: { backgroundColor: '#FFF', padding: 16, marginHorizontal: 12, marginTop: 12, marginBottom: 0, borderRadius: 10, elevation: 1, borderWidth: 1, borderColor: '#F5F5F5' },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#222' },
  cardSubtitle: { fontSize: 13, color: '#777', lineHeight: 20 },
  statusConfirmed: { color: '#4CAF50', fontWeight: '700', marginTop: 10, fontSize: 12 },
  statusCompleted: { color: '#4B73B2', fontWeight: '700', marginTop: 10, fontSize: 12 },
  emptyText: { textAlign: 'center', marginTop: 60, fontSize: 16, color: '#999' },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#4CAF50',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});

export default AgendamentosScreen;

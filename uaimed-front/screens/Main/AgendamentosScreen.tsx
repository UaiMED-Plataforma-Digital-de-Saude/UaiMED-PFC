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

  const QUICK_SPECIALTIES = [
    { id: '1', nome: 'Cardiologia', icon: 'heart-outline', color: '#4CAF50' },
    { id: '2', nome: 'Dermatologia', icon: 'sparkles-outline', color: '#4CAF50' },
    { id: '3', nome: 'Pediatria', icon: 'happy-outline', color: '#4CAF50' },
    { id: '4', nome: 'Psicologia', icon: 'chatbubbles-outline', color: '#4CAF50' },
    { id: '5', nome: 'Ginecologia', icon: 'female-outline', color: '#4CAF50' },
    { id: '6', nome: 'Ortopedia', icon: 'body-outline', color: '#4CAF50' },
    { id: '7', nome: 'Nutrição', icon: 'nutrition-outline', color: '#4CAF50' },
    { id: '8', nome: 'Oftalmologia', icon: 'eye-outline', color: '#4CAF50' },
  ];

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
      {/* Navegação Interna (Tabs) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'futuros' && styles.tabActive]}
          onPress={() => setActiveTab('futuros')}
        >
          <Text style={styles.tabText}>Próximas</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'anteriores' && styles.tabActive]}
          onPress={() => setActiveTab('anteriores')}
        >
          <Text style={styles.tabText}>Histórico</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros Rápidos */}
      <View style={styles.filterContainer}>
        <Ionicons name="filter-outline" size={20} color="#4CAF50" style={{ marginRight: 5 }} />
        <TextInput
          style={styles.filterInput}
          placeholder="Especialidade..."
          value={especialidadeFilter}
          onChangeText={setEspecialidadeFilter}
        />
        <TextInput
          style={[styles.filterInput, { width: 110 }]}
          placeholder="AAAA-MM-DD"
          value={dataFilter}
          onChangeText={setDataFilter}
        />
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <FlatList
          data={filteredAgendamentos}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
        />
      )}

      {/* Botão Flutuante para Novo Agendamento */}
      <TouchableOpacity 
        style={styles.floatingButton} 
        onPress={() => navigation.navigate('Agendamentos', { screen: 'Busca' })}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#EEE' },
  tabButton: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderColor: '#4CAF50' },

});

export default AgendamentosScreen;

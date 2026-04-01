import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AgendamentoStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';

type SearchScreenProps = StackScreenProps<AgendamentoStackParamList, 'Busca'>;

/**
 * Lista de especialidades comuns
 */
const especialidades = [
  { name: 'Cardiologia', icon: 'heart-outline' },
  { name: 'Pediatria', icon: 'accessibility-outline' },
  { name: 'Dermatologia', icon: 'leaf-outline' },
  { name: 'Ginecologia', icon: 'woman-outline' },
  { name: 'Odontologia', icon: 'happy-outline' },
  { name: 'Ortopedia', icon: 'body-outline' },
  { name: 'Oftalmologia', icon: 'eye-outline' },
  { name: 'Psicologia', icon: 'brain-outline' },
];

/**
 * SearchScreen
 * Tela de busca de médicos e especialidades para agendamento
 */
const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Função para realizar a busca
   */
  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigation.navigate('Resultados', { query: query.trim() });
    }
  };

  /**
   * Função para filtrar por especialidade
   */
  const handleSpecialtyPress = (specialtyName: string) => {
    navigation.navigate('Resultados', { especialidade: specialtyName });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Agende sua Consulta</Text>

      {/* Campo de Busca Principal */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={24} color="#666" style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Busque por médico, clínica ou especialidade"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => handleSearch(searchQuery)}
          placeholderTextColor="#999"
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Seção de Especialidades */}
        <Text style={styles.sectionTitle}>Busque por Especialidade</Text>
        <View style={styles.specialtiesGrid}>
          {especialidades.map((spec) => (
            <TouchableOpacity
              key={spec.name}
              style={styles.specialtyCard}
              onPress={() => handleSpecialtyPress(spec.name)}
            >
              <Ionicons 
                name={spec.icon as keyof typeof Ionicons.glyphMap} 
                size={36} 
                color="#4CAF50"
              />
              <Text style={styles.specialtyText}>{spec.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Ação Rápida */}
        <Text style={styles.sectionTitle}>Agendamento Rápido</Text>
        <TouchableOpacity 
          style={styles.quickActionButton} 
          onPress={() => console.log('TODO: Implementar médicos favoritos')}
        >
          <Ionicons name="star-outline" size={20} color="#FFF" />
          <Text style={styles.quickActionText}>Meus Médicos Favoritos</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF', 
    paddingHorizontal: 15,
    paddingTop: 32,
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginTop: 8,
    marginBottom: 20,
  },

  // Busca
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F0F0F0', 
    borderRadius: 10, 
    padding: 15, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: '#EEE' 
  },
  searchInput: { 
    flex: 1, 
    fontSize: 16,
    color: '#333',
  },

  scrollContent: { 
    paddingBottom: 50 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginVertical: 15, 
    color: '#333' 
  },

  // Grid de Especialidades
  specialtiesGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
  },
  specialtyCard: {
    width: '30%',
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  specialtyText: { 
    marginTop: 8, 
    fontSize: 12, 
    textAlign: 'center', 
    fontWeight: '500',
    color: '#333',
  },

  // Ações Rápidas
  quickActionButton: { 
    flexDirection: 'row', 
    backgroundColor: '#4CAF50', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 10 
  },
  quickActionText: { 
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginLeft: 10 
  },
});

export default SearchScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AgendamentoStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import LocationModal, { LocationValue } from '../../components/LocationModal';
import uaiMedApi from '../../api/uaiMedApi';

type SearchScreenProps = StackScreenProps<AgendamentoStackParamList, 'Busca'>;

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState<LocationValue>({ uf: '', estado: '', cidade: '' });
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  // Estados para Especialidades
  const [especialidades, setEspecialidades] = useState<{ id: string, nome: string }[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  const [specModalVisible, setSpecModalVisible] = useState(false);

  // Busca especialidades do back-end
  useEffect(() => {
    const fetchSpecialties = async () => {
      setLoadingSpecs(true);
      try {
        // Tentativa de buscar do backend real
        const response = await uaiMedApi.get('/especialidades');
        setEspecialidades(response.data);
      } catch (err) {
        console.warn('Backend /especialidades não encontrado, usando mocks');
        // MOCK solicitado para teste
        setEspecialidades([
          { id: '1', nome: 'Cardiologia' },
          { id: '2', nome: 'Dermatologia' },
          { id: '3', nome: 'Pediatria' },
        ]);
      } finally {
        setLoadingSpecs(false);
      }
    };
    fetchSpecialties();
  }, []);

  const buildParams = () => ({
    ...(location.uf ? { estado: location.uf } : {}),
    ...(location.cidade ? { cidade: location.cidade } : {}),
    ...(selectedSpecialty ? { especialidade: selectedSpecialty } : {}),
    ...(searchQuery.trim() ? { query: searchQuery.trim() } : {}),
  });

  const handleFinalSearch = () => {
    navigation.navigate('Resultados', buildParams());
  };

  const handleLocationConfirm = (loc: LocationValue) => {
    setLocation(loc);
  };

  const hasLocation = !!location.uf || !!location.cidade;

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Agende sua Consulta</Text>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* 1. Busca por Nome/Clínica */}
        <Text style={styles.inputLabel}>O que você procura?</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={22} color="#666" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Ex: Dr. Silva ou Clínica Uai"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>

        {/* 2. Seleção de Especialidade (Dropdown) */}
        <Text style={styles.inputLabel}>Especialidade</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setSpecModalVisible(true)}
        >
          <Ionicons name="medical-outline" size={20} color="#4CAF50" style={{ marginRight: 10 }} />
          <Text style={[styles.dropdownText, !selectedSpecialty && { color: '#999' }]}>
            {selectedSpecialty || 'Selecione uma especialidade'}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#999" />
        </TouchableOpacity>

        {/* 3. Seletor de Localização */}
        <Text style={styles.inputLabel}>Onde?</Text>
        <TouchableOpacity
          style={[styles.locationBar, hasLocation && styles.locationBarActive]}
          onPress={() => setLocationModalVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="location-outline"
            size={20}
            color={hasLocation ? '#2E7D32' : '#4CAF50'}
            style={{ marginRight: 10 }}
          />
          <Text style={[styles.locationText, hasLocation && styles.locationTextActive]}>
            {location.uf ? `${location.cidade ? location.cidade + ', ' : ''}${location.uf}` : 'Qualquer localização'}
          </Text>
          <Ionicons
            name="chevron-down-outline"
            size={18}
            color={hasLocation ? '#2E7D32' : '#999'}
          />
        </TouchableOpacity>

        {/* 4. Botão Buscar (Substituindo Favoritos) */}
        <TouchableOpacity
          style={styles.searchActionButton}
          onPress={handleFinalSearch}
        >
          <Ionicons name="search" size={22} color="#FFF" />
          <Text style={styles.searchActionText}>Buscar Profissionais</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Modal de Especialidades */}
      <Modal visible={specModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Especialidades</Text>
              <TouchableOpacity onPress={() => setSpecModalVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {loadingSpecs ? (
              <ActivityIndicator size="large" color="#4CAF50" style={{ margin: 20 }} />
            ) : (
              <FlatList
                data={especialidades}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.specItem}
                    onPress={() => {
                      setSelectedSpecialty(item.nome);
                      setSpecModalVisible(false);
                    }}
                  >
                    <Text style={styles.specItemText}>{item.nome}</Text>
                    {selectedSpecialty === item.nome && (
                      <Ionicons name="checkmark" size={20} color="#4CAF50" />
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma especialidade encontrada.</Text>}
              />
            )}

            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => { setSelectedSpecialty(null); setSpecModalVisible(false); }}
            >
              <Text style={styles.clearButtonText}>Limpar Filtro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Localização */}
      <LocationModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onConfirm={handleLocationConfirm}
        initialUF={location.uf}
        initialCidade={location.cidade}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111',
    marginBottom: 24,
  },
  scrollContent: { paddingBottom: 40 },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#444',
    marginBottom: 8,
    marginTop: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  locationBarActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#A5D6A7',
  },
  locationText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  locationTextActive: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  searchActionButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 4,
    shadowColor: '#4CAF50',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  searchActionText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 12,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  specItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 20,
  },
  clearButton: {
    marginTop: 10,
    padding: 15,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#F44336',
    fontWeight: '700',
    fontSize: 14,
  }
});

export default SearchScreen;

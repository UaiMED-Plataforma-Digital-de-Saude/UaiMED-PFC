import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AgendamentoStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import LocationModal, { LocationValue } from '../../components/LocationModal';
import EspecialidadeDropdown from '../../components/EspecialidadeDropdown';
import ConvenioDropdown from '../../components/ConvenioDropdown';

type SearchScreenProps = StackScreenProps<AgendamentoStackParamList, 'Busca'>;

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState<LocationValue>({ uf: '', estado: '', cidade: '' });
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  const QUICK_SPECIALTIES = [
    { id: '1', nome: 'Cardiologia', icon: 'heart-outline', color: '#FF5252' },
    { id: '2', nome: 'Dermatologia', icon: 'sparkles-outline', color: '#FF4081' },
    { id: '3', nome: 'Pediatria', icon: 'happy-outline', color: '#448AFF' },
    { id: '4', nome: 'Psicologia', icon: 'chatbubbles-outline', color: '#7C4DFF' },
    { id: '5', nome: 'Ginecologia', icon: 'female-outline', color: '#E91E63' },
    { id: '6', nome: 'Ortopedia', icon: 'body-outline', color: '#FF9800' },
    { id: '7', nome: 'Nutrição', icon: 'nutrition-outline', color: '#4CAF50' },
    { id: '8', nome: 'Oftalmologia', icon: 'eye-outline', color: '#00BCD4' },
  ];

  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedConvenio, setSelectedConvenio] = useState<string | null>(null);

  const PRICE_RANGES: { id: string; label: string; precoMin?: number; precoMax?: number }[] = [
    { id: 'any', label: 'Qualquer valor' },
    { id: 'low', label: 'Até R$ 150', precoMax: 150 },
    { id: 'mid', label: 'R$ 150 a 300', precoMin: 150, precoMax: 300 },
    { id: 'high', label: 'Acima de R$ 300', precoMin: 300 },
  ];
  const [selectedPriceRange, setSelectedPriceRange] = useState('any');

  const buildParams = () => {
    const priceRange = PRICE_RANGES.find(r => r.id === selectedPriceRange);
    return {
      ...(location.uf ? { estado: location.uf } : {}),
      ...(location.cidade ? { cidade: location.cidade } : {}),
      ...(selectedSpecialty ? { especialidade: selectedSpecialty } : {}),
      ...(selectedConvenio ? { convenio: selectedConvenio } : {}),
      ...(searchQuery.trim() ? { query: searchQuery.trim() } : {}),
      ...(priceRange?.precoMin !== undefined ? { precoMin: priceRange.precoMin } : {}),
      ...(priceRange?.precoMax !== undefined ? { precoMax: priceRange.precoMax } : {}),
    };
  };

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
        <EspecialidadeDropdown
          value={selectedSpecialty}
          onChange={setSelectedSpecialty}
          permitirLimpar
        />

        {/* 2.5 Seleção de Convênio (Dropdown) */}
        <Text style={styles.inputLabel}>Convênio</Text>
        <ConvenioDropdown
          value={selectedConvenio}
          onChange={setSelectedConvenio}
          permitirLimpar
        />

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

        {/* 3.5 Faixa de preço */}
        <Text style={styles.inputLabel}>Valor da consulta</Text>
        <View style={styles.priceRow}>
          {PRICE_RANGES.map((range) => {
            const active = selectedPriceRange === range.id;
            return (
              <TouchableOpacity
                key={range.id}
                style={[styles.priceChip, active && styles.priceChipActive]}
                onPress={() => setSelectedPriceRange(range.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.priceChipText, active && styles.priceChipTextActive]}>
                  {range.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 4. Botão Buscar */}
        <TouchableOpacity
          style={styles.searchActionButton}
          onPress={handleFinalSearch}
        >
          <Ionicons name="search" size={22} color="#FFF" />
          <Text style={styles.searchActionText}>Buscar Profissionais</Text>
        </TouchableOpacity>

        {/* 5. Busca Rápida (Mosaico de Especialidades) */}
        <Text style={[styles.inputLabel, { marginTop: 30 }]}>Busca Rápida</Text>
        <View style={styles.quickGrid}>
          {QUICK_SPECIALTIES.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.quickCard}
              onPress={() => {
                setSelectedSpecialty(item.nome);
                navigation.navigate('Resultados', { ...buildParams(), especialidade: item.nome });
              }}
            >
              <View style={[styles.quickIconWrapper, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <Text style={styles.quickText} numberOfLines={1}>{item.nome}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

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
    paddingTop: 16,
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
  priceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  priceChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  priceChipActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#A5D6A7',
  },
  priceChipText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
  },
  priceChipTextActive: {
    color: '#2E7D32',
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
  // Quick Search Styles
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  quickCard: {
    width: '23%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  quickIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#555',
    textAlign: 'center',
  },
});

export default SearchScreen;

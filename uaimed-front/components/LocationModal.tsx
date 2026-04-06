import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ─── 27 estados brasileiros ───────────────────────────────────────────────────
export const ESTADOS_BRASIL = [
  { uf: 'AC', nome: 'Acre' },
  { uf: 'AL', nome: 'Alagoas' },
  { uf: 'AP', nome: 'Amapá' },
  { uf: 'AM', nome: 'Amazonas' },
  { uf: 'BA', nome: 'Bahia' },
  { uf: 'CE', nome: 'Ceará' },
  { uf: 'DF', nome: 'Distrito Federal' },
  { uf: 'ES', nome: 'Espírito Santo' },
  { uf: 'GO', nome: 'Goiás' },
  { uf: 'MA', nome: 'Maranhão' },
  { uf: 'MT', nome: 'Mato Grosso' },
  { uf: 'MS', nome: 'Mato Grosso do Sul' },
  { uf: 'MG', nome: 'Minas Gerais' },
  { uf: 'PA', nome: 'Pará' },
  { uf: 'PB', nome: 'Paraíba' },
  { uf: 'PR', nome: 'Paraná' },
  { uf: 'PE', nome: 'Pernambuco' },
  { uf: 'PI', nome: 'Piauí' },
  { uf: 'RJ', nome: 'Rio de Janeiro' },
  { uf: 'RN', nome: 'Rio Grande do Norte' },
  { uf: 'RS', nome: 'Rio Grande do Sul' },
  { uf: 'RO', nome: 'Rondônia' },
  { uf: 'RR', nome: 'Roraima' },
  { uf: 'SC', nome: 'Santa Catarina' },
  { uf: 'SP', nome: 'São Paulo' },
  { uf: 'SE', nome: 'Sergipe' },
  { uf: 'TO', nome: 'Tocantins' },
];

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface LocationValue {
  uf: string;       // 'MG'
  estado: string;   // 'Minas Gerais'
  cidade: string;   // 'Uberlândia'
}

interface LocationModalProps {
  visible: boolean;
  onClose: () => void;
  /** Chamado ao confirmar. Passa uf vazio e cidade vazia se "limpar" */
  onConfirm: (location: LocationValue) => void;
  initialUF?: string;
  initialCidade?: string;
}

// ─── Componente ───────────────────────────────────────────────────────────────
const LocationModal: React.FC<LocationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  initialUF = '',
  initialCidade = '',
}) => {
  const [selectedUF, setSelectedUF] = useState(initialUF);
  const [cidade, setCidade] = useState(initialCidade);
  const [estadoFilter, setEstadoFilter] = useState('');

  const estadosFiltrados = ESTADOS_BRASIL.filter(
    (e) =>
      e.nome.toLowerCase().includes(estadoFilter.toLowerCase()) ||
      e.uf.toLowerCase().includes(estadoFilter.toLowerCase()),
  );

  const handleConfirm = () => {
    const estadoObj = ESTADOS_BRASIL.find((e) => e.uf === selectedUF);
    onConfirm({
      uf: selectedUF,
      estado: estadoObj?.nome ?? '',
      cidade: cidade.trim(),
    });
    onClose();
  };

  const handleClear = () => {
    setSelectedUF('');
    setCidade('');
    setEstadoFilter('');
    onConfirm({ uf: '', estado: '', cidade: '' });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          {/* Cabeçalho */}
          <View style={styles.header}>
            <Text style={styles.title}>Selecionar Localização</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#555" />
            </TouchableOpacity>
          </View>

          {/* Busca de estado */}
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={16} color="#999" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar estado..."
              value={estadoFilter}
              onChangeText={setEstadoFilter}
              placeholderTextColor="#aaa"
            />
          </View>

          {/* Lista de estados */}
          <Text style={styles.label}>Estado</Text>
          <FlatList
            data={estadosFiltrados}
            keyExtractor={(e) => e.uf}
            style={styles.stateList}
            renderItem={({ item }) => {
              const selected = item.uf === selectedUF;
              return (
                <TouchableOpacity
                  style={[styles.stateItem, selected && styles.stateItemSelected]}
                  onPress={() => setSelectedUF(item.uf)}
                >
                  <Text style={[styles.stateUF, selected && styles.stateTextSelected]}>
                    {item.uf}
                  </Text>
                  <Text style={[styles.stateNome, selected && styles.stateTextSelected]}>
                    {item.nome}
                  </Text>
                  {selected && <Ionicons name="checkmark" size={16} color="#4CAF50" />}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.empty}>Nenhum estado encontrado</Text>
            }
          />

          {/* Campo de cidade */}
          <Text style={styles.label}>Município</Text>
          <View style={styles.cityBox}>
            <Ionicons name="location-outline" size={16} color="#999" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.cityInput}
              placeholder="Ex: Uberlândia"
              value={cidade}
              onChangeText={setCidade}
              placeholderTextColor="#aaa"
              returnKeyType="done"
            />
          </View>

          {/* Botões */}
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
              <Text style={styles.clearText}>Limpar filtro</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 17, fontWeight: '700', color: '#222' },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 12 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 4,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
  stateList: { maxHeight: 180 },
  stateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 2,
  },
  stateItemSelected: { backgroundColor: '#E8F5E9' },
  stateUF: { width: 36, fontSize: 13, fontWeight: '700', color: '#444' },
  stateNome: { flex: 1, fontSize: 14, color: '#444' },
  stateTextSelected: { color: '#2E7D32' },
  empty: { textAlign: 'center', color: '#aaa', marginVertical: 12 },
  cityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 4,
  },
  cityInput: { flex: 1, fontSize: 14, color: '#333' },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 20 },
  clearBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    alignItems: 'center',
  },
  clearText: { color: '#666', fontWeight: '600' },
  confirmBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  confirmText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});

export default LocationModal;


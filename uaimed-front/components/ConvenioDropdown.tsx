import React from 'react';
import {
  ActivityIndicator, FlatList, Modal, StyleSheet, Text,
  TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import uaiMedApi from '../api/uaiMedApi';

export interface ConvenioOption {
  id: string;
  nome: string;
}

interface Props {
  value: string | null;
  onChange: (value: string | null) => void;
  permitirLimpar?: boolean;
  disabled?: boolean;
}

let conveniosCache: ConvenioOption[] | null = null;

const ConvenioDropdown: React.FC<Props> = ({
  value,
  onChange,
  permitirLimpar = false,
  disabled = false,
}) => {
  const [visible, setVisible] = React.useState(false);
  const [convenios, setConvenios] = React.useState<ConvenioOption[]>(
    conveniosCache ?? [],
  );
  const [loading, setLoading] = React.useState(!conveniosCache);
  const [erro, setErro] = React.useState<string | null>(null);

  const carregar = React.useCallback(async () => {
    if (conveniosCache) {
      setConvenios(conveniosCache);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErro(null);
    try {
      const resposta = await uaiMedApi.get<ConvenioOption[]>('/convenios');
      conveniosCache = resposta.data;
      setConvenios(resposta.data);
    } catch {
      setErro('Não foi possível carregar os convênios. Verifique o backend e tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <>
      <TouchableOpacity
        style={[styles.dropdownButton, disabled && styles.disabled]}
        onPress={() => setVisible(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Ionicons name="shield-checkmark-outline" size={20} color="#4CAF50" />
        <Text style={[styles.dropdownText, !value && styles.placeholder]} numberOfLines={1}>
          {value || 'Qualquer convênio'}
        </Text>
        {loading
          ? <ActivityIndicator size="small" color="#4CAF50" />
          : <Ionicons name="chevron-down" size={18} color="#999" />}
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Convênios</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color="#4CAF50" style={styles.loading} />
            ) : erro ? (
              <View style={styles.errorBox}>
                <Ionicons name="cloud-offline-outline" size={32} color="#C62828" />
                <Text style={styles.errorText}>{erro}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={carregar}>
                  <Text style={styles.retryText}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={convenios}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.item}
                    onPress={() => {
                      onChange(item.nome);
                      setVisible(false);
                    }}
                  >
                    <Text style={[styles.itemText, value === item.nome && styles.itemTextSelected]}>
                      {item.nome}
                    </Text>
                    {value === item.nome && <Ionicons name="checkmark" size={21} color="#4CAF50" />}
                  </TouchableOpacity>
                )}
              />
            )}

            {permitirLimpar && value ? (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  onChange(null);
                  setVisible(false);
                }}
              >
                <Text style={styles.clearText}>Limpar filtro</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  dropdownButton: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  disabled: { opacity: 0.55 },
  dropdownText: { flex: 1, fontSize: 16, color: '#333' },
  placeholder: { color: '#999' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111' },
  loading: { marginVertical: 35 },
  item: {
    minHeight: 51,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemText: { flex: 1, fontSize: 15, color: '#333' },
  itemTextSelected: { color: '#2E7D32', fontWeight: '700' },
  errorBox: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 15 },
  errorText: { color: '#7A3333', fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 10 },
  retryButton: { borderRadius: 9, backgroundColor: '#2E7D32', paddingHorizontal: 18, paddingVertical: 10, marginTop: 15 },
  retryText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  clearButton: { alignItems: 'center', paddingTop: 15 },
  clearText: { color: '#D32F2F', fontWeight: '700', fontSize: 14 },
});

export default ConvenioDropdown;

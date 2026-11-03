import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import uaiMedApi from '../../api/uaiMedApi';
import AppModal from '../../components/AppModal';
import { useModal } from '../../hooks/useModal';

interface ConvenioOption {
  id: string;
  nome: string;
}

const MedicoConveniosScreen: React.FC = () => {
  const [catalogo, setCatalogo] = useState<ConvenioOption[]>([]);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const { modal, showModal, hideModal } = useModal();

  useFocusEffect(useCallback(() => {
    let ativo = true;
    setLoading(true);

    Promise.all([
      uaiMedApi.get<ConvenioOption[]>('/convenios'),
      uaiMedApi.get<string[]>('/professionals/me/convenios'),
    ]).then(([catalogoRes, meusRes]) => {
      if (!ativo) return;
      setCatalogo(catalogoRes.data);
      setSelecionados(new Set(meusRes.data));
    }).catch(() => {
      if (ativo) showModal('Erro', 'Não foi possível carregar seus convênios.', { type: 'error' });
    }).finally(() => {
      if (ativo) setLoading(false);
    });

    return () => { ativo = false; };
  }, []));

  const alternar = (nome: string) => {
    setSelecionados((prev) => {
      const novo = new Set(prev);
      if (novo.has(nome)) novo.delete(nome);
      else novo.add(nome);
      return novo;
    });
  };

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      await uaiMedApi.put('/professionals/me/convenios', Array.from(selecionados));
      showModal('Convênios salvos!', 'Os convênios aceitos foram atualizados.', { type: 'success' });
    } catch (e: any) {
      showModal('Erro', e?.response?.data?.error || 'Não foi possível salvar seus convênios.', { type: 'error' });
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Carregando convênios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.hint}>
          Selecione os convênios que você aceita. Pacientes poderão filtrar a busca
          por esses convênios.
        </Text>

        {catalogo.map((item) => {
          const ativo = selecionados.has(item.nome);
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.item, ativo && styles.itemAtivo]}
              onPress={() => alternar(item.nome)}
              activeOpacity={0.7}
            >
              <Text style={[styles.itemText, ativo && styles.itemTextAtivo]}>{item.nome}</Text>
              <Ionicons
                name={ativo ? 'checkbox' : 'square-outline'}
                size={22}
                color={ativo ? '#2E7D32' : '#BBB'}
              />
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[styles.saveBtn, salvando && { opacity: 0.7 }]}
          onPress={handleSalvar}
          disabled={salvando}
        >
          {salvando
            ? <ActivityIndicator size="small" color="#FFF" />
            : <Text style={styles.saveBtnTxt}>Salvar Convênios</Text>}
        </TouchableOpacity>
      </ScrollView>

      <AppModal {...modal} onClose={hideModal} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8F6' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6F8F6' },
  loadingText: { color: '#777', fontSize: 14, marginTop: 10 },
  content: { padding: 16, paddingBottom: 40 },
  hint: { color: '#777', fontSize: 13, lineHeight: 19, marginBottom: 14 },
  item: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFF', borderRadius: 14, padding: 15, marginBottom: 10,
    borderWidth: 1, borderColor: '#E8EAE8',
  },
  itemAtivo: { borderColor: '#2E7D32', backgroundColor: '#F1F8F2' },
  itemText: { fontSize: 15, fontWeight: '600', color: '#222' },
  itemTextAtivo: { color: '#1B5E20' },
  saveBtn: {
    backgroundColor: '#2E7D32', borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 10,
  },
  saveBtnTxt: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});

export default MedicoConveniosScreen;

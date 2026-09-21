import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator, FlatList, Image, RefreshControl,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { MainTabParamList } from '../../navigation/types';
import { MedicoClinica, MinhaClinicaResponse } from '../../types/clinica';
import uaiMedApi from '../../api/uaiMedApi';
import AppModal from '../../components/AppModal';
import { useModal } from '../../hooks/useModal';

type Props = BottomTabScreenProps<MainTabParamList, 'ClinicaMedicos'>;

const MedicoCard: React.FC<{
  medico: MedicoClinica;
  processando: boolean;
  onAction: () => void;
}> = ({ medico, processando, onAction }) => {
  const iniciais = medico.nome.split(' ').filter(Boolean).slice(0, 2)
    .map((parte) => parte[0]).join('').toUpperCase();
  const pendente = medico.statusVinculo === 'pendente';
  const vinculado = medico.statusVinculo === 'aceito' || medico.vinculado;
  const label = pendente ? 'Solicitado' : vinculado ? 'Remover' : 'Solicitar';

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        {medico.avatar
          ? <Image source={{ uri: medico.avatar }} style={styles.avatarImage} />
          : <Text style={styles.avatarText}>{iniciais || 'M'}</Text>}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.nome} numberOfLines={1}>{medico.nome}</Text>
        <Text style={styles.especialidade}>{medico.especialidade}</Text>
        <Text style={styles.crm}>CRM {medico.crm}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={12} color="#999" />
          <Text style={styles.metaText}>{[medico.cidade, medico.estado].filter(Boolean).join(', ')}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.actionButton,
          pendente ? styles.pendingButton : vinculado ? styles.removeButton : styles.addButton,
        ]}
        onPress={onAction}
        disabled={processando || pendente}
        activeOpacity={0.8}
      >
        {processando ? (
          <ActivityIndicator size="small" color={vinculado ? '#C62828' : '#FFF'} />
        ) : (
          <Ionicons
            name={pendente ? 'time-outline' : vinculado ? 'close' : 'paper-plane-outline'}
            size={16}
            color={pendente ? '#8A5A00' : vinculado ? '#C62828' : '#FFF'}
          />
        )}
        <Text style={[
          styles.actionText,
          pendente && styles.pendingText,
          vinculado && styles.removeText,
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const ClinicaMedicosScreen: React.FC<Props> = () => {
  const [medicos, setMedicos] = useState<MedicoClinica[]>([]);
  const [busca, setBusca] = useState('');
  const [totalVinculados, setTotalVinculados] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pesquisou, setPesquisou] = useState(false);
  const [processandoId, setProcessandoId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const { modal, showModal, hideModal } = useModal();

  const carregarResumo = useCallback(async () => {
    const resposta = await uaiMedApi.get<MinhaClinicaResponse>('/clinicas/me');
    setTotalVinculados(resposta.data.resumo.totalMedicos);
  }, []);

  const buscar = useCallback(async (termo = busca, refresh = false) => {
    const query = termo.trim();
    if (!query) {
      setMedicos([]);
      setPesquisou(false);
      setErro(null);
      return;
    }

    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const resposta = await uaiMedApi.get<MedicoClinica[]>('/clinicas/me/medicos', {
        params: { query },
      });
      setMedicos(resposta.data);
      setPesquisou(true);
      setErro(null);
      await carregarResumo();
    } catch (error: any) {
      setErro(error.response?.data?.error ?? 'Não foi possível pesquisar o médico.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [busca, carregarResumo]);

  useFocusEffect(useCallback(() => {
    carregarResumo().catch(() => setErro('Não foi possível carregar a equipe da clínica.'));
  }, [carregarResumo]));

  const executarAcao = async (medico: MedicoClinica) => {
    const vinculado = medico.statusVinculo === 'aceito' || medico.vinculado;
    setProcessandoId(medico.id);
    try {
      if (vinculado) {
        await uaiMedApi.delete(`/clinicas/me/medicos/${medico.id}`);
        setMedicos((atuais) => atuais.map((item) => item.id === medico.id
          ? { ...item, vinculado: false, statusVinculo: null }
          : item));
      } else {
        await uaiMedApi.post('/clinicas/me/medicos', { profissionalId: medico.id });
        setMedicos((atuais) => atuais.map((item) => item.id === medico.id
          ? { ...item, vinculado: false, statusVinculo: 'pendente' }
          : item));
        showModal('Solicitação enviada', `${medico.nome} precisa aceitar o vínculo no perfil médico.`, { type: 'success' });
      }
      await carregarResumo();
    } catch (error: any) {
      showModal('Não foi possível atualizar', error.response?.data?.error ?? 'Tente novamente.', { type: 'error' });
    } finally {
      setProcessandoId(null);
    }
  };

  const confirmarAcao = (medico: MedicoClinica) => {
    const vinculado = medico.statusVinculo === 'aceito' || medico.vinculado;
    showModal(
      vinculado ? 'Remover médico' : 'Enviar solicitação',
      vinculado
        ? `Deseja remover ${medico.nome} da equipe da clínica?`
        : `Deseja solicitar a ${medico.nome} o vínculo com a clínica?`,
      {
        type: 'confirm',
        buttons: [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: vinculado ? 'Remover' : 'Enviar',
            style: vinculado ? 'destructive' : 'default',
            onPress: () => executarAcao(medico),
          },
        ],
      },
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <View style={styles.summaryIcon}>
          <Ionicons name="people" size={24} color="#2E7D32" />
        </View>
        <View>
          <Text style={styles.summaryValue}>{totalVinculados}</Text>
          <Text style={styles.summaryLabel}>médico{totalVinculados === 1 ? '' : 's'} com vínculo aceito</Text>
        </View>
      </View>

      <Text style={styles.instructions}>
        Digite o CPF ou o CRM completo do médico. Por privacidade, não exibimos uma lista geral.
      </Text>
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={20} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="CPF ou CRM completo"
          placeholderTextColor="#AAA"
          value={busca}
          onChangeText={setBusca}
          onSubmitEditing={() => buscar()}
          returnKeyType="search"
          autoCapitalize="characters"
        />
        {busca ? (
          <TouchableOpacity onPress={() => { setBusca(''); setMedicos([]); setPesquisou(false); }}>
            <Ionicons name="close-circle" size={19} color="#AAA" />
          </TouchableOpacity>
        ) : null}
      </View>
      <TouchableOpacity
        style={[styles.searchButton, (!busca.trim() || loading) && styles.disabledButton]}
        onPress={() => buscar()}
        disabled={!busca.trim() || loading}
      >
        {loading
          ? <ActivityIndicator size="small" color="#FFF" />
          : <><Ionicons name="search" size={17} color="#FFF" /><Text style={styles.searchButtonText}>Pesquisar médico</Text></>}
      </TouchableOpacity>

      {erro ? <Text style={styles.errorText}>{erro}</Text> : null}

      <FlatList
        data={medicos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => buscar(busca, true)} tintColor="#2E7D32" />
        }
        renderItem={({ item }) => (
          <MedicoCard
            medico={item}
            processando={processandoId === item.id}
            onAction={() => confirmarAcao(item)}
          />
        )}
        ListEmptyComponent={pesquisou && !loading ? (
          <View style={styles.empty}>
            <Ionicons name="medical-outline" size={48} color="#C8D8C8" />
            <Text style={styles.emptyTitle}>Médico não encontrado</Text>
            <Text style={styles.emptyText}>Confira se o CPF ou CRM foi informado por completo.</Text>
          </View>
        ) : null}
      />
      <AppModal {...modal} onClose={hideModal} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7F5' },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFF', margin: 14, marginBottom: 9, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#E0EAE0' },
  summaryIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F5E9' },
  summaryValue: { color: '#222', fontSize: 20, fontWeight: '800' },
  summaryLabel: { color: '#777', fontSize: 12 },
  instructions: { color: '#687268', fontSize: 12, lineHeight: 17, marginHorizontal: 16, marginBottom: 9 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#FFF', marginHorizontal: 14, paddingHorizontal: 13, borderRadius: 12, borderWidth: 1, borderColor: '#E2E2E2' },
  searchInput: { flex: 1, paddingVertical: 12, color: '#222', fontSize: 14 },
  searchButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: '#2E7D32', marginHorizontal: 14, marginTop: 9, paddingVertical: 11, borderRadius: 11 },
  disabledButton: { opacity: 0.55 },
  searchButtonText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  errorText: { color: '#B71C1C', backgroundColor: '#FFEBEE', marginTop: 10, padding: 9, textAlign: 'center', fontSize: 12 },
  list: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 30 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, padding: 12, marginBottom: 9, borderWidth: 1, borderColor: '#E7E7E7' },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F5E9', overflow: 'hidden' },
  avatarImage: { width: 48, height: 48 },
  avatarText: { color: '#2E7D32', fontWeight: '800', fontSize: 14 },
  cardContent: { flex: 1, marginHorizontal: 11 },
  nome: { color: '#222', fontSize: 14, fontWeight: '700' },
  especialidade: { color: '#2E7D32', fontSize: 12, fontWeight: '600', marginTop: 2 },
  crm: { color: '#888', fontSize: 10, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  metaText: { color: '#999', fontSize: 10, marginLeft: 2 },
  actionButton: { minWidth: 92, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 9 },
  addButton: { backgroundColor: '#2E7D32' },
  pendingButton: { backgroundColor: '#FFF4D6', borderWidth: 1, borderColor: '#F4D58D' },
  removeButton: { backgroundColor: '#FFEBEE', borderWidth: 1, borderColor: '#FFCDD2' },
  actionText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  pendingText: { color: '#8A5A00' },
  removeText: { color: '#C62828' },
  empty: { alignItems: 'center', paddingTop: 45 },
  emptyTitle: { color: '#444', fontSize: 16, fontWeight: '700', marginTop: 12 },
  emptyText: { color: '#999', fontSize: 12, marginTop: 5, textAlign: 'center' },
});

export default ClinicaMedicosScreen;

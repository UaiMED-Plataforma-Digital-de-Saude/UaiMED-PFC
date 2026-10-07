import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import uaiMedApi from '../../api/uaiMedApi';

interface Contato {
  id: string;
  assunto: string;
  mensagem: string;
  status: string;
  criado_em: string;
  usuario: { id: string; nome: string; telefone: string | null };
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  nao_lido: { label: 'Não lido', color: '#E53935' },
  lido: { label: 'Lido', color: '#777' },
};

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const MedicoContatosScreen: React.FC = () => {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [marcandoId, setMarcandoId] = useState<string | null>(null);

  const fetchContatos = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const res = await uaiMedApi.get('/contatos');
      setContatos(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.warn('[MedicoContatos] Erro ao buscar contatos:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchContatos(); }, [fetchContatos]));

  const onRefresh = () => {
    setRefreshing(true);
    fetchContatos(true);
  };

  const marcarComoLido = async (contato: Contato) => {
    if (contato.status === 'lido') return;
    setMarcandoId(contato.id);
    try {
      await uaiMedApi.patch(`/contatos/${contato.id}/lido`);
      setContatos((prev) => prev.map((c) => (c.id === contato.id ? { ...c, status: 'lido' } : c)));
    } catch (e) {
      console.warn('[MedicoContatos] Erro ao marcar como lido:', e);
    } finally {
      setMarcandoId(null);
    }
  };

  const renderItem = ({ item }: { item: Contato }) => {
    const cfg = STATUS_CONFIG[item.status] ?? { label: item.status, color: '#888' };
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => marcarComoLido(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderText}>
            <Text style={styles.remetente} numberOfLines={1}>{item.usuario.nome}</Text>
            <Text style={styles.data}>{formatarData(item.criado_em)}</Text>
          </View>
          {marcandoId === item.id ? (
            <ActivityIndicator size="small" color="#2E7D32" />
          ) : (
            <View style={[styles.statusBadge, { backgroundColor: `${cfg.color}1A` }]}>
              <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
          )}
        </View>

        <Text style={styles.assunto}>{item.assunto}</Text>
        <Text style={styles.mensagem} numberOfLines={3}>{item.mensagem}</Text>

        {item.usuario.telefone ? (
          <TouchableOpacity
            style={styles.btnLigar}
            onPress={() => Linking.openURL(`tel:${item.usuario.telefone}`)}
            activeOpacity={0.8}
          >
            <Ionicons name="call-outline" size={15} color="#2E7D32" />
            <Text style={styles.btnLigarText}>Ligar</Text>
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Carregando contatos...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={contatos}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={contatos.length ? styles.list : styles.emptyList}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E7D32']} />}
      ListEmptyComponent={(
        <View style={styles.empty}>
          <Ionicons name="mail-outline" size={52} color="#C9CFC9" />
          <Text style={styles.emptyTitle}>Nenhum contato recebido</Text>
          <Text style={styles.emptySubtitle}>Mensagens de pacientes aparecerão aqui.</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6F8F6' },
  loadingText: { color: '#777', fontSize: 14, marginTop: 10 },
  list: { padding: 16, paddingBottom: 30, backgroundColor: '#F6F8F6' },
  emptyList: { flexGrow: 1, padding: 16, backgroundColor: '#F6F8F6' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  emptyTitle: { color: '#777', fontSize: 16, fontWeight: '700', marginTop: 12 },
  emptySubtitle: { color: '#A0A0A0', fontSize: 12, marginTop: 5 },

  card: {
    backgroundColor: '#FFF', borderRadius: 14, padding: 15, marginBottom: 12,
    borderWidth: 1, borderColor: '#E8EAE8',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardHeaderText: { flex: 1 },
  remetente: { color: '#252525', fontSize: 15, fontWeight: '800' },
  data: { color: '#999', fontSize: 11, marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  statusText: { fontSize: 11, fontWeight: '800' },

  assunto: { color: '#222', fontSize: 14, fontWeight: '700', marginTop: 10 },
  mensagem: { color: '#666', fontSize: 13, lineHeight: 18, marginTop: 4 },

  btnLigar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginTop: 12, paddingVertical: 9, borderRadius: 8,
    borderWidth: 1.5, borderColor: '#4CAF50', backgroundColor: '#F1FBF1',
  },
  btnLigarText: { color: '#2E7D32', fontSize: 13, fontWeight: '700' },
});

export default MedicoContatosScreen;

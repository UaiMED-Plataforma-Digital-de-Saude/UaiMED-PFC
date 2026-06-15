import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { ConversasStackParamList } from '../../navigation/types';
import uaiMedApi from '../../api/uaiMedApi';
type Props = StackScreenProps<ConversasStackParamList, 'ConversasLista'>;

interface ConversaItem {
  id: string;
  titulo: string;
  nomeOutro: string;
  avatarOutro: string | null;
  ultimaMensagem: { texto: string; criado_em: string } | null;
  naoLidas: number;
  atualizado_em: string;
}

// ─── Avatar com logo UaiMED ───────────────────────────────────────────────────
const AvatarUaiMED: React.FC<{ size?: number }> = ({ size = 50 }) => (
  <View style={[avatarStyles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
    <Image
      source={require('../../assets/logo.png')}
      style={{ width: size * 0.7, height: size * 0.7 }}
      resizeMode="contain"
    />
  </View>
);

const avatarStyles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    borderWidth: 1.5,
    borderColor: '#C8E6C9',
  },
});

// ─── Formata timestamp relativo ───────────────────────────────────────────────
function formatarTempo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const dias = Math.floor(hrs / 24);
  if (dias < 7) return `${dias}d`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

// ─── Item da lista ────────────────────────────────────────────────────────────
const ConversaCard: React.FC<{
  item: ConversaItem;
  onPress: () => void;
}> = ({ item, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
    <AvatarUaiMED />

    <View style={styles.cardBody}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardNome} numberOfLines={1}>{item.nomeOutro}</Text>
        {item.ultimaMensagem && (
          <Text style={styles.cardTempo}>
            {formatarTempo(item.ultimaMensagem.criado_em)}
          </Text>
        )}
      </View>
      <View style={styles.cardFooter}>
        <Text style={[styles.cardUltima, item.naoLidas > 0 && styles.cardUltimaBold]} numberOfLines={1}>
          {item.ultimaMensagem?.texto ?? 'Nenhuma mensagem ainda'}
        </Text>
        {item.naoLidas > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.naoLidas > 9 ? '9+' : item.naoLidas}</Text>
          </View>
        )}
      </View>
    </View>

    <Ionicons name="chevron-forward" size={18} color="#DDD" style={{ marginLeft: 4 }} />
  </TouchableOpacity>
);

// ─── Tela Principal ───────────────────────────────────────────────────────────
const ConversasListaScreen: React.FC<Props> = ({ navigation }) => {
  const [conversas, setConversas] = useState<ConversaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversas = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const res = await uaiMedApi.get('/conversas');
      setConversas(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.warn('Erro ao buscar conversas:', e);
      setConversas([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchConversas();
    }, [fetchConversas])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchConversas(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Carregando conversas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>

      {conversas.length === 0 ? (
        <View style={styles.centered}>
          <View style={styles.emptyIcon}>
            <Ionicons name="chatbubbles-outline" size={56} color="#4CAF50" />
          </View>
          <Text style={styles.emptyTitle}>Nenhuma conversa ainda</Text>
          <Text style={styles.emptyDesc}>
            Inicie uma conversa a partir do perfil de um médico ou clínica.
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.getParent<any>()?.navigate('Agendamentos', { screen: 'Busca' })}
            activeOpacity={0.8}
          >
            <Ionicons name="search-outline" size={18} color="#FFF" />
            <Text style={styles.emptyBtnText}>Buscar Profissionais</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversas}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4CAF50" />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <ConversaCard
              item={item}
              onPress={() =>
                navigation.navigate('ConversaDetalhe', {
                  conversaId: item.id,
                  titulo: item.titulo,
                  nomeOutro: item.nomeOutro,
                })
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },


  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#888' },

  list: { paddingVertical: 0 },
  separator: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 78 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFF',
  },
  cardBody: { flex: 1, marginLeft: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardNome: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', flex: 1, marginRight: 8 },
  cardTempo: { fontSize: 12, color: '#AAA' },
  cardFooter: { flexDirection: 'row', alignItems: 'center' },
  cardUltima: { fontSize: 13, color: '#888', flex: 1 },
  cardUltimaBold: { fontWeight: '600', color: '#333' },

  badge: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginLeft: 6,
  },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },

  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 10,
    elevation: 2,
  },
  emptyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});

export default ConversasListaScreen;

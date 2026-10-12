import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { MainTabParamList } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { isArticleAdmin } from '../../utils/articleAdmin';
import uaiMedApi from '../../api/uaiMedApi';

type Props = BottomTabScreenProps<MainTabParamList, 'AdminArtigos'>;

interface Artigo {
  id: string;
  titulo: string;
  categoria: string;
  criado_em: string;
  autor: { nome: string };
}

const AdminArtigosScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const permitido = isArticleAdmin(user);
  const [artigos, setArtigos] = useState<Artigo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState('');
  const [acessoNegado, setAcessoNegado] = useState(false);

  const carregar = useCallback(async (refresh = false, ativo: () => boolean = () => true) => {
    if (!permitido) return;
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setErro('');
    try {
      const { data } = await uaiMedApi.get<Artigo[]>('/admin/artigos');
      if (!ativo()) return;
      setArtigos(data);
      setAcessoNegado(false);
    } catch (error: any) {
      if (!ativo()) return;
      setAcessoNegado(error?.response?.status === 403);
      setErro(error?.response?.status === 403
        ? 'Sua conta não tem acesso à administração de artigos.'
        : 'Não foi possível carregar os artigos. Tente novamente.');
    } finally {
      if (ativo()) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [permitido]);

  useFocusEffect(useCallback(() => {
    let ativo = true;
    void carregar(false, () => ativo);
    return () => { ativo = false; };
  }, [carregar]));

  if (!permitido) return null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={erro ? [] : artigos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { void carregar(true); }} colors={['#4CAF50']} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.icon}>
              <Ionicons name="shield-checkmark-outline" size={28} color="#388E3C" />
            </View>
            <Text style={styles.title}>Conteúdos de saúde</Text>
            <Text style={styles.subtitle}>Cadastre e edite os artigos publicados no UaiMED.</Text>
            {!acessoNegado && (
              <TouchableOpacity
                style={styles.primaryButton}
                accessibilityRole="button"
                onPress={() => navigation.navigate('ArtigoCadastro', { artigoId: undefined })}
              >
                <Ionicons name="add" size={22} color="#FFF" />
                <Text style={styles.primaryText}>Novo artigo</Text>
              </TouchableOpacity>
            )}
            {!loading && !erro && (
              <Text style={styles.count}>{artigos.length} {artigos.length === 1 ? 'artigo publicado' : 'artigos publicados'}</Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            {loading ? <ActivityIndicator size="large" color="#4CAF50" /> : erro ? (
              <>
                <Text style={styles.emptyText}>{erro}</Text>
                <TouchableOpacity style={styles.retry} onPress={() => { void carregar(); }} accessibilityRole="button">
                  <Text style={styles.link}>Tentar novamente</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Ionicons name="newspaper-outline" size={44} color="#A5D6A7" />
                <Text style={styles.emptyText}>Nenhum artigo publicado. Cadastre o primeiro conteúdo.</Text>
              </>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.category}>{item.categoria}</Text>
            <Text style={styles.articleTitle}>{item.titulo}</Text>
            <Text style={styles.meta}>{item.autor.nome} · {new Date(item.criado_em).toLocaleDateString('pt-BR')}</Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                accessibilityRole="button"
                accessibilityLabel={`Ler ${item.titulo}`}
                onPress={() => navigation.navigate('ArtigoDetalhes', { artigoId: item.id })}
              >
                <Ionicons name="eye-outline" size={18} color="#388E3C" />
                <Text style={styles.link}>Ler artigo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                accessibilityRole="button"
                accessibilityLabel={`Editar ${item.titulo}`}
                onPress={() => navigation.navigate('ArtigoCadastro', { artigoId: item.id })}
              >
                <Ionicons name="pencil-outline" size={18} color="#388E3C" />
                <Text style={styles.link}>Editar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 20, paddingBottom: 32 },
  header: { marginBottom: 20 },
  icon: { width: 54, height: 54, borderRadius: 16, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { fontSize: 24, fontWeight: '800', color: '#222', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', lineHeight: 21, marginBottom: 20 },
  primaryButton: { backgroundColor: '#4CAF50', borderRadius: 12, padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  count: { marginTop: 24, color: '#777', fontSize: 13, fontWeight: '600' },
  card: { padding: 18, borderRadius: 14, backgroundColor: '#FFF', marginBottom: 14, borderWidth: 1, borderColor: '#EEE' },
  category: { color: '#388E3C', fontSize: 11, fontWeight: '700', marginBottom: 8 },
  articleTitle: { color: '#222', fontSize: 17, fontWeight: '700', lineHeight: 24, marginBottom: 8 },
  meta: { color: '#888', fontSize: 12 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 16 },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 8 },
  link: { color: '#388E3C', fontWeight: '700', fontSize: 14 },
  empty: { alignItems: 'center', padding: 24 },
  emptyText: { color: '#777', textAlign: 'center', lineHeight: 22, marginTop: 12 },
  retry: { padding: 14 },
});

export default AdminArtigosScreen;

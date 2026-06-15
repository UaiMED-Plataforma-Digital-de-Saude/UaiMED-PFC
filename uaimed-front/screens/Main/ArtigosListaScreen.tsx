import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Image, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { MainTabParamList } from '../../navigation/types';
import uaiMedApi from '../../api/uaiMedApi';

type Props = BottomTabScreenProps<MainTabParamList, 'Artigos'>;

interface Artigo {
  id: string;
  titulo: string;
  resumo: string | null;
  categoria: string;
  banner: string | null;
  criado_em: string;
  autor: { nome: string; tipo: string };
}

// Mapeamento de categoria → cor e ícone de fallback
const CATEGORIA_CONFIG: Record<string, { cor: string; iconColor: string; icon: string }> = {
  'BEM-ESTAR':      { cor: '#E1F5FE', iconColor: '#03A9F4', icon: 'fitness-outline' },
  'SAÚDE DO SONO':  { cor: '#F3E5F5', iconColor: '#9C27B0', icon: 'moon-outline' },
  'PSICOLOGIA':     { cor: '#E8F5E9', iconColor: '#4CAF50', icon: 'body-outline' },
  'NUTRIÇÃO':       { cor: '#FFF8E1', iconColor: '#FF9800', icon: 'restaurant-outline' },
  'CARDIOLOGIA':    { cor: '#FFEBEE', iconColor: '#E53935', icon: 'heart-outline' },
  'PEDIATRIA':      { cor: '#E8EAF6', iconColor: '#3F51B5', icon: 'people-outline' },
  'ORTOPEDIA':      { cor: '#F3E5F5', iconColor: '#8E24AA', icon: 'body-outline' },
  'DERMATOLOGIA':   { cor: '#FCE4EC', iconColor: '#E91E63', icon: 'color-palette-outline' },
};
const DEFAULT_CFG = { cor: '#F0F7F0', iconColor: '#4CAF50', icon: 'medical-outline' };

function getCfg(categoria: string) {
  return CATEGORIA_CONFIG[categoria?.toUpperCase()] ?? DEFAULT_CFG;
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const ArtigosListaScreen: React.FC<Props> = ({ navigation }) => {
  const [artigos, setArtigos]     = useState<Artigo[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchArtigos = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const res = await uaiMedApi.get('/artigos');
      setArtigos(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.warn('[Artigos] Erro ao buscar:', e);
      setArtigos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchArtigos();
    }, [fetchArtigos]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchArtigos(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Carregando artigos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={artigos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={artigos.length === 0 ? styles.centeredFlex : styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Ionicons name="newspaper-outline" size={56} color="#DDD" />
            <Text style={styles.emptyTitle}>Nenhum artigo publicado</Text>
            <Text style={styles.emptySubtitle}>Seja o primeiro a compartilhar conhecimento!</Text>
          </View>
        }
        renderItem={({ item }) => {
          const cfg = getCfg(item.categoria);
          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ArtigoDetalhes', { artigoId: item.id })}
            >
              {/* Banner — foto real ou cor + ícone */}
              <View style={[styles.banner, { backgroundColor: cfg.cor }]}>
                {item.banner ? (
                  <Image source={{ uri: item.banner }} style={styles.bannerImage} />
                ) : (
                  <Ionicons name={cfg.icon as any} size={48} color={cfg.iconColor} />
                )}
              </View>

              <View style={styles.content}>
                <View style={[styles.badge, { backgroundColor: cfg.cor }]}>
                  <Text style={[styles.badgeText, { color: cfg.iconColor }]}>{item.categoria}</Text>
                </View>
                <Text style={styles.titulo} numberOfLines={2}>{item.titulo}</Text>
                {item.resumo ? (
                  <Text style={styles.resumo} numberOfLines={2}>{item.resumo}</Text>
                ) : null}
                <View style={styles.meta}>
                  <Ionicons name="person-circle-outline" size={14} color="#AAA" />
                  <Text style={styles.metaText}>{item.autor.nome} · {formatarData(item.criado_em)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('ArtigoCadastro')}
      >
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  centeredFlex: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#999' },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#AAAAAA', marginTop: 16 },
  emptySubtitle: { fontSize: 13, color: '#BBBBBB', textAlign: 'center', marginTop: 8, lineHeight: 20 },

  listContent: { padding: 16, paddingBottom: 100 },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  banner: { height: 130, justifyContent: 'center', alignItems: 'center' },
  bannerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  content: { padding: 16 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6, marginBottom: 8,
  },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  titulo: { fontSize: 17, fontWeight: '700', color: '#222', marginBottom: 6, lineHeight: 23 },
  resumo: { fontSize: 13, color: '#666', lineHeight: 19, marginBottom: 8 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 11, color: '#AAA' },

  fab: {
    position: 'absolute', right: 20, bottom: 20,
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center', alignItems: 'center',
    elevation: 6,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35, shadowRadius: 5,
  },
});

export default ArtigosListaScreen;

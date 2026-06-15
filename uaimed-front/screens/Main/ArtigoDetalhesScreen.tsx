import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/types';
import uaiMedApi from '../../api/uaiMedApi';

type Props = BottomTabScreenProps<MainTabParamList, 'ArtigoDetalhes'>;

interface ArtigoDetalhe {
  id: string;
  titulo: string;
  resumo: string | null;
  categoria: string;
  corpo: string;
  banner: string | null;
  publicado: boolean;
  criado_em: string;
  autor: { nome: string; tipo: string };
}

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
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

const ArtigoDetalhesScreen: React.FC<Props> = ({ route }) => {
  const { artigoId } = route.params;
  const [artigo, setArtigo]   = useState<ArtigoDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro]       = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await uaiMedApi.get(`/artigos/${artigoId}`);
        setArtigo(res.data);
      } catch {
        setErro(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [artigoId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </SafeAreaView>
    );
  }

  if (erro || !artigo) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color="#DDD" />
          <Text style={styles.erroText}>Artigo não encontrado.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const cfg = getCfg(artigo.categoria);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={[styles.banner, { backgroundColor: cfg.cor }]}>
          {artigo.banner ? (
            <Image source={{ uri: artigo.banner }} style={styles.bannerImage} />
          ) : (
            <Ionicons name={cfg.icon as any} size={90} color={cfg.iconColor} />
          )}
        </View>

        {/* Conteúdo */}
        <View style={styles.content}>
          <View style={[styles.badge, { backgroundColor: cfg.cor }]}>
            <Text style={[styles.badgeText, { color: cfg.iconColor }]}>{artigo.categoria}</Text>
          </View>

          <Text style={styles.titulo}>{artigo.titulo}</Text>

          <View style={styles.meta}>
            <Ionicons name="person-circle-outline" size={18} color="#AAA" />
            <Text style={styles.metaText}>
              {artigo.autor.nome} · {formatarData(artigo.criado_em)}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.corpo}>{artigo.corpo}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  erroText: { fontSize: 15, color: '#BBB', marginTop: 12 },

  banner: { height: 230, justifyContent: 'center', alignItems: 'center' },
  bannerImage: { width: '100%', height: '100%', resizeMode: 'cover' },

  content: {
    padding: 24,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#FFF',
    marginTop: -30,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, marginBottom: 16,
  },
  badgeText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  titulo: { fontSize: 24, fontWeight: '800', color: '#111', lineHeight: 31, marginBottom: 12 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  metaText: { fontSize: 13, color: '#AAA' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: 20 },
  corpo: { fontSize: 16, color: '#444', lineHeight: 27, textAlign: 'justify' },
});

export default ArtigoDetalhesScreen;

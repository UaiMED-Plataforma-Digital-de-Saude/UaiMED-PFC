import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import uaiMedApi from '../api/uaiMedApi';

interface HomeArtigo {
  id: string;
  titulo: string;
  resumo: string | null;
  categoria: string;
  banner: string | null;
}

const CAT_CFG: Record<string, { bg: string; icon: string; color: string; badgeBg: string }> = {
  'BEM-ESTAR':     { bg: '#E1F5FE', icon: 'fitness-outline',     color: '#03A9F4', badgeBg: '#E1F5FE' },
  'SAÚDE DO SONO': { bg: '#F3E5F5', icon: 'moon-outline',        color: '#9C27B0', badgeBg: '#F3E5F5' },
  'PSICOLOGIA':    { bg: '#E8F5E9', icon: 'body-outline',        color: '#4CAF50', badgeBg: '#E8F5E9' },
  'NUTRIÇÃO':      { bg: '#FFF8E1', icon: 'restaurant-outline',  color: '#FF9800', badgeBg: '#FFF8E1' },
  'CARDIOLOGIA':   { bg: '#FFEBEE', icon: 'heart-outline',       color: '#E53935', badgeBg: '#FFEBEE' },
  'PEDIATRIA':     { bg: '#E8EAF6', icon: 'people-outline',      color: '#3F51B5', badgeBg: '#E8EAF6' },
  'ORTOPEDIA':     { bg: '#F3E5F5', icon: 'body-outline',        color: '#8E24AA', badgeBg: '#F3E5F5' },
  'DERMATOLOGIA':  { bg: '#FCE4EC', icon: 'color-palette-outline', color: '#E91E63', badgeBg: '#FCE4EC' },
};
const DEFAULT_CAT = { bg: '#F0F7F0', icon: 'medical-outline', color: '#4CAF50', badgeBg: '#F0F7F0' };
function getCat(cat: string) { return CAT_CFG[cat?.toUpperCase()] ?? DEFAULT_CAT; }

interface ArtigosDestaqueProps {
  onPressArtigo: (id: string) => void;
  limit?: number;
  title?: string;
}

const ArtigosDestaque: React.FC<ArtigosDestaqueProps> = ({ onPressArtigo, limit = 2, title = 'Artigos recentes' }) => {
  const [artigos, setArtigos] = useState<HomeArtigo[]>([]);

  // A API já devolve os artigos do mais recente para o mais antigo.
  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      uaiMedApi.get('/artigos').then((res) => {
        if (!ativo) return;
        const lista = Array.isArray(res.data) ? res.data : [];
        setArtigos(lista.slice(0, limit));
      }).catch((erro) => {
        console.warn('[ArtigosDestaque] Erro ao buscar artigos recentes:', erro);
      });

      return () => { ativo = false; };
    }, [limit]),
  );

  if (artigos.length === 0) return null;

  return (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.articlesContainer}>
        {artigos.map((artigo) => {
          const cfg = getCat(artigo.categoria);
          return (
            <TouchableOpacity
              key={artigo.id}
              style={styles.largeArticleCard}
              activeOpacity={0.9}
              onPress={() => onPressArtigo(artigo.id)}
            >
              <View style={[styles.articleBanner, { backgroundColor: cfg.bg }]}>
                {artigo.banner ? (
                  <Image source={{ uri: artigo.banner }} style={styles.articleBannerImage} />
                ) : (
                  <Ionicons name={cfg.icon as any} size={48} color={cfg.color} />
                )}
              </View>
              <View style={styles.articleContent}>
                <View style={[styles.articleBadge, { backgroundColor: cfg.badgeBg }]}>
                  <Text style={[styles.articleBadgeText, { color: cfg.color }]}>
                    {artigo.categoria}
                  </Text>
                </View>
                <Text style={styles.largeArticleTitle} numberOfLines={2}>
                  {artigo.titulo}
                </Text>
                {artigo.resumo ? (
                  <Text style={styles.largeArticleSub} numberOfLines={2}>
                    {artigo.resumo}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 10,
    marginHorizontal: 4,
    color: '#111',
  },
  articlesContainer: {
    paddingHorizontal: 4,
    marginTop: 4,
  },
  largeArticleCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  articleBanner: {
    height: 140,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  articleBannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  articleContent: {
    padding: 16,
  },
  articleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E1F5FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  articleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#03A9F4',
    letterSpacing: 0.5,
  },
  largeArticleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 6,
  },
  largeArticleSub: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default ArtigosDestaque;

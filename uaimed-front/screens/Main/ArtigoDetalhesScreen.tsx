import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/types';

type Props = BottomTabScreenProps<MainTabParamList, 'ArtigoDetalhes'>;

const ArtigoDetalhesScreen: React.FC<Props> = ({ route, navigation }) => {
  const { artigoId } = route.params;

  // Mock de dados baseado no ID
  const artigo = {
    titulo: artigoId === '1' ? 'Dicas para uma vida saudável' : 'A importância do sono de qualidade',
    categoria: artigoId === '1' ? 'BEM-ESTAR' : 'SAÚDE DO SONO',
    autor: 'Equipe UaiMED',
    data: '24 de Maio, 2024',
    cor: artigoId === '1' ? '#E1F5FE' : '#F3E5F5',
    iconColor: artigoId === '1' ? '#03A9F4' : '#9C27B0',
    conteudo: `Manter uma vida saudável vai muito além de apenas evitar doenças. Trata-se de um equilíbrio entre corpo e mente.\n\nNeste artigo, exploramos como pequenas mudanças na rotina podem gerar grandes impactos na sua longevidade e disposição.\n\n1. Alimentação Balanceada\nConsumir alimentos naturais e reduzir processados é o primeiro passo. A hidratação constante também é fundamental.\n\n2. Atividade Física\nNão é necessário ser um atleta. Caminhadas diárias de 30 minutos já reduzem drasticamente riscos cardiovasculares.\n\n3. Saúde Mental\nReserve um tempo para o lazer e para desconectar-se das telas antes de dormir.\n\nConclusão\nA constância é mais importante que a intensidade. Comece hoje mesmo!`
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={[styles.banner, { backgroundColor: artigo.cor }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Ionicons
            name={artigoId === '1' ? "fitness-outline" : "moon-outline"}
            size={80}
            color={artigo.iconColor}
          />
        </View>

        {/* Conteúdo */}
        <View style={styles.content}>
          <View style={[styles.badge, { backgroundColor: artigo.cor }]}>
            <Text style={[styles.badgeText, { color: artigo.iconColor }]}>{artigo.categoria}</Text>
          </View>

          <Text style={styles.titulo}>{artigo.titulo}</Text>

          <View style={styles.meta}>
            <Ionicons name="person-circle-outline" size={20} color="#888" />
            <Text style={styles.metaText}>{artigo.autor} • {artigo.data}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.corpo}>{artigo.conteudo}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  banner: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  },
  content: {
    padding: 24,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#FFF',
    marginTop: -30,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  badgeText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  titulo: { fontSize: 26, fontWeight: '800', color: '#111', lineHeight: 32, marginBottom: 12 },
  meta: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  metaText: { fontSize: 14, color: '#888', marginLeft: 8 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: 20 },
  corpo: { fontSize: 16, color: '#444', lineHeight: 26, textAlign: 'justify' }
});

export default ArtigoDetalhesScreen;

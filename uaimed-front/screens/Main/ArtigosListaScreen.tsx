import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/types';
import { useFocusEffect } from '@react-navigation/native';

type Props = BottomTabScreenProps<MainTabParamList, 'Artigos'>;

const MOCK_ARTIGOS = [
  {
    id: '1',
    titulo: 'Dicas para uma vida saudável',
    resumo: 'Descubra os principais pilares da alimentação e dos exercícios diários para maximizar sua energia.',
    categoria: 'BEM-ESTAR',
    cor: '#E1F5FE',
    iconColor: '#03A9F4',
    icon: 'fitness-outline'
  },
  {
    id: '2',
    titulo: 'A importância do sono de qualidade',
    resumo: 'Como dormir melhor, render mais durante o dia e evitar problemas crônicos de saúde a longo prazo.',
    categoria: 'SAÚDE DO SONO',
    cor: '#F3E5F5',
    iconColor: '#9C27B0',
    icon: 'moon-outline'
  },
  {
    id: '3',
    titulo: 'Saúde Mental no Trabalho',
    resumo: 'Estratégias para manter o equilíbrio emocional e a produtividade em ambientes corporativos sob pressão.',
    categoria: 'PSICOLOGIA',
    cor: '#E8F5E9',
    iconColor: '#4CAF50',
    icon: 'body-outline'
  }
];

const ArtigosListaScreen: React.FC<Props> = ({ navigation }) => {
  // Intercepta o botão físico de voltar do Android → vai para Home
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        navigation.navigate('Home');
        return true;
      });
      return () => subscription.remove();
    }, [navigation])
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={MOCK_ARTIGOS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ArtigoDetalhes', { artigoId: item.id })}
          >
            <View style={[styles.banner, { backgroundColor: item.cor }]}>
              <Ionicons name={item.icon as any} size={40} color={item.iconColor} />
            </View>
            <View style={styles.content}>
              <View style={[styles.badge, { backgroundColor: item.cor }]}>
                <Text style={[styles.badgeText, { color: item.iconColor }]}>{item.categoria}</Text>
              </View>
              <Text style={styles.titulo}>{item.titulo}</Text>
              <Text style={styles.resumo} numberOfLines={2}>{item.resumo}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Botão Flutuante para Novo Artigo */}
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
  listContent: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  banner: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: 16 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  titulo: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 8 },
  resumo: { fontSize: 14, color: '#666', lineHeight: 20 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  }
});

export default ArtigosListaScreen;

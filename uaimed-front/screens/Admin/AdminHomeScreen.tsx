import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { isArticleAdmin } from '../../utils/articleAdmin';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

const AdminHomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  if (!isArticleAdmin(user)) return null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={16} color="#BDE8C9" />
            <Text style={styles.badgeText}>ADMINISTRADOR</Text>
          </View>
          <Text style={styles.title}>Painel administrativo</Text>
          <Text style={styles.subtitle}>Olá, {user?.nome}. Gerencie os artigos e os destaques da home de pacientes.</Text>
        </View>

        <Text style={styles.sectionTitle}>Gestão de conteúdo</Text>
        <TouchableOpacity style={styles.card} accessibilityRole="button" onPress={() => navigation.navigate('AdminDestaques')}>
          <View style={styles.icon}><Ionicons name="star-outline" size={26} color="#388E3C" /></View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Destaques da home</Text>
            <Text style={styles.cardDescription}>Escolha os profissionais e as clínicas em destaque.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#A4B0A7" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryCard}
          accessibilityRole="button"
          onPress={() => navigation.navigate('ArtigoCadastro', { artigoId: undefined })}
        >
          <View style={styles.icon}><Ionicons name="add-circle-outline" size={28} color="#388E3C" /></View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Cadastrar artigo</Text>
            <Text style={styles.cardDescription}>Publique um novo conteúdo de saúde.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#388E3C" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} accessibilityRole="button" onPress={() => navigation.navigate('AdminArtigos')}>
          <View style={styles.icon}><Ionicons name="newspaper-outline" size={26} color="#388E3C" /></View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Gerenciar artigos</Text>
            <Text style={styles.cardDescription}>Consulte e edite os artigos publicados.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#A4B0A7" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} accessibilityRole="button" onPress={() => navigation.navigate('Artigos')}>
          <View style={styles.icon}><Ionicons name="eye-outline" size={26} color="#388E3C" /></View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Ver publicações</Text>
            <Text style={styles.cardDescription}>Veja os conteúdos disponíveis aos leitores.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#A4B0A7" />
        </TouchableOpacity>

        <View style={styles.note}>
          <Ionicons name="lock-closed-outline" size={19} color="#52745F" />
          <Text style={styles.noteText}>A publicação e a edição de artigos são exclusivas desta conta administrativa.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7F5' },
  content: { padding: 20, paddingBottom: 32 },
  hero: { backgroundColor: '#214B35', borderRadius: 20, padding: 24, marginBottom: 28 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 18 },
  badgeText: { color: '#BDE8C9', fontSize: 11, fontWeight: '700', letterSpacing: 1.3 },
  title: { color: '#FFF', fontSize: 27, lineHeight: 34, fontWeight: '800', marginBottom: 12 },
  subtitle: { color: '#D2E4D8', fontSize: 14, lineHeight: 22 },
  sectionTitle: { color: '#273E30', fontSize: 18, fontWeight: '700', marginBottom: 14 },
  primaryCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 16, backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#B9DABB', marginBottom: 12 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 16, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E4EBE6', marginBottom: 12 },
  icon: { backgroundColor: '#F0F7F1', width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardText: { flex: 1, paddingHorizontal: 14 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#273E30', marginBottom: 5 },
  cardDescription: { fontSize: 13, color: '#728078', lineHeight: 19 },
  note: { flexDirection: 'row', gap: 10, marginTop: 18, padding: 16, backgroundColor: '#EAF0EC', borderRadius: 12 },
  noteText: { flex: 1, fontSize: 12, lineHeight: 19, color: '#52745F' },
});

export default AdminHomeScreen;

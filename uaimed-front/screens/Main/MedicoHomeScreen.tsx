import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

interface AtalhoProps {
  icon: keyof typeof Ionicons.glyphMap;
  titulo: string;
  descricao: string;
  onPress: () => void;
}

const Atalho: React.FC<AtalhoProps> = ({ icon, titulo, descricao, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.iconBox}>
      <Ionicons name={icon} size={24} color="#2E7D32" />
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{titulo}</Text>
      <Text style={styles.cardDescription}>{descricao}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#A5A5A5" />
  </TouchableOpacity>
);

const MedicoHomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const primeiroNome = user?.nome?.split(' ')[0] ?? 'Médico';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="medical" size={34} color="#FFF" />
        </View>
        <View style={styles.heroText}>
          <Text style={styles.welcome}>Olá, Dr(a). {primeiroNome}</Text>
          <Text style={styles.subtitle}>Você entrou na área do médico.</Text>
        </View>
      </View>

      <View style={styles.profileCard}>
        <Text style={styles.profileLabel}>Perfil profissional</Text>
        <Text style={styles.profileValue}>
          {user?.profissional?.especialidade || 'Especialidade não informada'}
        </Text>
        <Text style={styles.crm}>CRM: {user?.profissional?.crm || 'não informado'}</Text>
      </View>

      <Text style={styles.sectionTitle}>Acesso rápido</Text>

      <Atalho
        icon="calendar-outline"
        titulo="Minha agenda"
        descricao="Consulte os próximos atendimentos."
        onPress={() => navigation.navigate('MedicoAgenda')}
      />
      <Atalho
        icon="person-outline"
        titulo="Meu perfil"
        descricao="Confira seus dados pessoais e profissionais."
        onPress={() => navigation.navigate('Perfil')}
      />
      <Atalho
        icon="newspaper-outline"
        titulo="Artigos de saúde"
        descricao="Publique e acompanhe seus conteúdos."
        onPress={() => navigation.navigate('Artigos')}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8F6' },
  content: { padding: 18, paddingBottom: 40 },
  hero: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#2E7D32', borderRadius: 18, padding: 20,
  },
  heroIcon: {
    width: 58, height: 58, borderRadius: 29,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  heroText: { flex: 1, marginLeft: 14 },
  welcome: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.82)', fontSize: 14, marginTop: 4 },
  profileCard: {
    backgroundColor: '#FFF', borderRadius: 14, padding: 17, marginTop: 16,
    borderWidth: 1, borderColor: '#E4ECE4',
  },
  profileLabel: { color: '#7A7A7A', fontSize: 12, fontWeight: '600' },
  profileValue: { color: '#222', fontSize: 18, fontWeight: '700', marginTop: 5 },
  crm: { color: '#666', fontSize: 13, marginTop: 5 },
  sectionTitle: { color: '#222', fontSize: 18, fontWeight: '800', marginTop: 24, marginBottom: 12 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: 14, padding: 15, marginBottom: 11,
    borderWidth: 1, borderColor: '#E8E8E8',
  },
  iconBox: {
    width: 46, height: 46, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F5E9',
  },
  cardContent: { flex: 1, marginHorizontal: 13 },
  cardTitle: { color: '#252525', fontSize: 15, fontWeight: '700' },
  cardDescription: { color: '#777', fontSize: 12, marginTop: 3 },
});

export default MedicoHomeScreen;

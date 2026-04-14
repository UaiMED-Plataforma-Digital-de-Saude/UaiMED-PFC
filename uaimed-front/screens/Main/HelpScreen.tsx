import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/types';

type HelpScreenProps = BottomTabScreenProps<MainTabParamList, 'Ajuda'>;

const HelpScreen: React.FC<HelpScreenProps> = ({ navigation }) => {
  const handleContact = (type: string) => {
    if (type === 'email') {
      Linking.openURL('mailto:suporte@uaimed.com.br');
    } else if (type === 'whatsapp') {
      Linking.openURL('https://wa.me/5500000000000');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="help-circle-outline" size={60} color="#4CAF50" />
        <Text style={styles.title}>Como podemos ajudar?</Text>
        <Text style={styles.subtitle}>Selecione um dos canais abaixo para tirar suas dúvidas ou relatar problemas.</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.card} onPress={() => handleContact('email')}>
          <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="mail-outline" size={24} color="#2196F3" />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>E-mail de Suporte</Text>
            <Text style={styles.cardDesc}>suporte@uaimed.com.br</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => handleContact('whatsapp')}>
          <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="logo-whatsapp" size={24} color="#4CAF50" />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>WhatsApp</Text>
            <Text style={styles.cardDesc}>Fale com um atendente agora</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => {}}>
          <View style={[styles.iconBox, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="document-text-outline" size={24} color="#FF9800" />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Termos de Uso</Text>
            <Text style={styles.cardDesc}>Leia nossas diretrizes</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>UaiMED Versão 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  title: { fontSize: 22, fontWeight: '700', color: '#333', marginTop: 15 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8, paddingHorizontal: 20 },
  section: { gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconBox: { width: 45, height: 45, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  cardDesc: { fontSize: 13, color: '#888', marginTop: 2 },
  footer: { marginTop: 40, alignItems: 'center' },
  version: { fontSize: 12, color: '#AAA' },
});

export default HelpScreen;

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/types';
import AppModal from '../../components/AppModal';
import { useModal } from '../../hooks/useModal';

/**
 * Tela de Seleção de Tipo de Usuário
 * Permite usuário escolher entre Paciente, Médico ou Clínica
 * Deve ser acessada antes da tela de Cadastro
 */
type Props = StackScreenProps<AuthStackParamList, 'TipoSelecao'>;

interface TipoUsuario {
  id: 'paciente' | 'medico' | 'clinica';
  nome: string;
  descricao: string;
  icone: string;
  cor: string;
  beneficios: string[];
}

const TIPOS_USUARIO: TipoUsuario[] = [
  {
    id: 'paciente',
    nome: 'Sou Paciente',
    descricao: 'Agende consultas e receba atendimento médico',
    icone: 'person-circle-outline',
    cor: '#4CAF50',
    beneficios: [
      'Agendar consultas',
      'Histórico de consultas',
      'Avaliação de atendimento',
      'Notificações de lembretes',
    ],
  },
  {
    id: 'medico',
    nome: 'Sou Médico',
    descricao: 'Gerencie sua agenda e atenda pacientes',
    icone: 'medical-outline',
    cor: '#4B73B2',
    beneficios: [
      'Gerenciar agenda',
      'Visualizar agendamentos',
      'Análise de avaliações',
      'Perfil profissional',
    ],
  },
  {
    id: 'clinica',
    nome: 'Sou uma Clínica',
    descricao: 'Administre sua clínica e médicos',
    icone: 'hospital-box-outline',
    cor: '#FF9800',
    beneficios: [
      'Gerenciar médicos',
      'Relatórios e análises',
      'Gestão de pacientes',
      'Configurações da clínica',
    ],
  },
];

const TipoSelecaoScreen: React.FC<Props> = ({ navigation }) => {
  const [tipoSelecionado, setTipoSelecionado] = useState<string | null>(null);
  const { modal, showModal, hideModal } = useModal();

  const handleProxima = () => {
    if (!tipoSelecionado) {
      showModal('Seleção obrigatória', 'Por favor, selecione um tipo de usuário para continuar.', { type: 'warning' });
      return;
    }
    navigation.navigate('Cadastro', {
      tipoUsuario: tipoSelecionado as 'paciente' | 'medico' | 'clinica',
    });
  };

  const handleVoltar = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="layers-outline" size={48} color="#4CAF50" />
          <Text style={styles.headerTitle}>Tipo de Cadastro</Text>
          <Text style={styles.headerSubtitle}>
            Escolha qual melhor descreve você
          </Text>
        </View>

        {/* Cards de Tipo */}
        <View style={styles.cardsContainer}>
          {TIPOS_USUARIO.map((tipo) => (
            <TouchableOpacity
              key={tipo.id}
              style={[
                styles.card,
                tipoSelecionado === tipo.id && styles.cardSelected,
                { borderTopColor: tipo.cor },
              ]}
              onPress={() => setTipoSelecionado(tipo.id)}
            >
              {/* Checkbox */}
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.checkbox,
                    tipoSelecionado === tipo.id && styles.checkboxChecked,
                    { borderColor: tipo.cor, backgroundColor: tipoSelecionado === tipo.id ? tipo.cor : 'transparent' },
                  ]}
                >
                  {tipoSelecionado === tipo.id && (
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  )}
                </View>

                {/* Ícone e Título */}
                <View style={styles.cardTitleContainer}>
                  <Text style={[styles.cardTitle, { color: tipo.cor }]}>
                    {tipo.nome}
                  </Text>
                </View>
              </View>

              {/* Descrição */}
              <Text style={styles.cardDescription}>{tipo.descricao}</Text>

              {/* Benefícios */}
              <View style={styles.beneficiosContainer}>
                <Text style={styles.beneficiosTitle}>Você terá acesso a:</Text>
                {tipo.beneficios.map((beneficio, index) => (
                  <View key={index} style={styles.beneficioItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={tipo.cor}
                    />
                    <Text style={styles.beneficioText}>{beneficio}</Text>
                  </View>
                ))}
              </View>

              {/* Ícone Grande do Tipo */}
              <View style={styles.cardIconContainer}>
                <Ionicons
                  name={tipo.icone as any}
                  size={64}
                  color={tipo.cor}
                  style={styles.cardIcon}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Informação */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#2196F3" />
          <Text style={styles.infoText}>
            Você pode alterar o tipo de conta após o cadastro inicial nas configurações
          </Text>
        </View>
      </ScrollView>

      {/* Botões */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={handleVoltar}
        >
          <Ionicons name="arrow-back" size={20} color="#666" />
          <Text style={styles.buttonSecondaryText}>Voltar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.buttonPrimary,
            !tipoSelecionado && styles.buttonDisabled,
          ]}
          onPress={handleProxima}
          disabled={!tipoSelecionado}
        >
          <Text style={styles.buttonPrimaryText}>Próximo</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
      <AppModal {...modal} onClose={hideModal} />
    </SafeAreaView>
  );
};

export default TipoSelecaoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderTopWidth: 4,
    borderWidth: 2,
    borderColor: '#F0F0F0',
  },
  cardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F0F7F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    marginLeft: 40,
  },
  beneficiosContainer: {
    marginLeft: 40,
    marginBottom: 12,
  },
  beneficiosTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  beneficioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  beneficioText: {
    fontSize: 13,
    color: '#666',
  },
  cardIconContainer: {
    alignItems: 'flex-end',
    marginTop: 12,
  },
  cardIcon: {
    opacity: 0.3,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 100,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1565C0',
    lineHeight: 18,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    gap: 12,
  },
  buttonSecondary: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonSecondaryText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonPrimary: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    elevation: 3,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  buttonPrimaryText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});


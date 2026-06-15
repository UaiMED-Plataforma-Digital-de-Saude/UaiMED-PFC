import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { AgendamentoStackParamList } from '../../navigation/types';
import uaiMedApi from '../../api/uaiMedApi';
import AppModal from '../../components/AppModal';
import { useModal } from '../../hooks/useModal';

/**
 * Tela de Avaliação de Consulta
 * Permite paciente avaliar atendimento médico após consulta
 */
type Props = StackScreenProps<AgendamentoStackParamList, 'Avaliacao'>;

interface AvaliacaoFormData {
  notaAtendimento: number;
  notaPuntualidade: number;
  notaClinica: number;
  notaComuni: number;
  voltariaClinica: 'sim' | 'nao' | 'talvez' | null;
  recomendaMedico: 'sim' | 'nao' | 'talvez' | null;
  comentario: string;
  melhorias: string;
}

export const AvaliacaoScreen: React.FC<Props> = ({ route, navigation }) => {
  const { medicoId } = route.params ?? { medicoId: undefined };
  const [form, setForm] = useState<AvaliacaoFormData>({
    notaAtendimento: 0,
    notaPuntualidade: 0,
    notaClinica: 0,
    notaComuni: 0,
    voltariaClinica: null,
    recomendaMedico: null,
    comentario: '',
    melhorias: '',
  });

  const [loading, setLoading] = useState(false);
  const { modal, showModal, hideModal } = useModal();

  // Renderiza estrelas para avaliação
  const renderStars = (nota: number, onPress: (value: number) => void) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onPress(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= nota ? 'star' : 'star-outline'}
              size={32}
              color={star <= nota ? '#FFB800' : '#DDD'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Renderiza botões de resposta sim/não/talvez
  const renderOptions = (
    value: 'sim' | 'nao' | 'talvez' | null,
    onPress: (value: 'sim' | 'nao' | 'talvez') => void,
  ) => {
    return (
      <View style={styles.optionsContainer}>
        {(['sim', 'nao', 'talvez'] as const).map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              value === option && styles.optionButtonActive,
            ]}
            onPress={() => onPress(option)}
          >
            <Text
              style={[
                styles.optionText,
                value === option && styles.optionTextActive,
              ]}
            >
              {option === 'sim' ? '✓ Sim' : option === 'nao' ? '✗ Não' : '? Talvez'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleSubmit = async () => {
    if (
      form.notaAtendimento === 0 ||
      form.notaPuntualidade === 0 ||
      form.notaClinica === 0 ||
      form.notaComuni === 0 ||
      !form.voltariaClinica ||
      !form.recomendaMedico
    ) {
      showModal('Atenção', 'Por favor, responda todas as perguntas obrigatórias!', { type: 'warning' });
      return;
    }

    if (form.comentario.trim().length === 0) {
      showModal('Atenção', 'Por favor, adicione um comentário sobre sua experiência!', { type: 'warning' });
      return;
    }

    if (!medicoId) {
      showModal('Erro', 'ID do profissional não foi fornecido.', { type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const notaMedia = Math.round(
        (form.notaAtendimento + form.notaPuntualidade + form.notaClinica + form.notaComuni) / 4,
      );

      await uaiMedApi.post('/avaliacoes', {
        profissionalId: medicoId,
        nota: notaMedia,
        comentario: form.comentario,
      });

      showModal(
        'Avaliação Enviada! 🌟',
        'Obrigado por avaliar seu atendimento!\nSua opinião é muito importante para melhorarmos nossos serviços.',
        {
          type: 'success',
          buttons: [
            {
              text: 'Ir para Início',
              onPress: () => navigation.getParent<any>()?.navigate('Home'),
            },
          ],
        },
      );
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Falha ao enviar avaliação. Tente novamente.';
      showModal('Erro ao Enviar', msg, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView behavior="padding" style={styles.keyboardAvoid}>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {/* Seção 1: Qualidade do Atendimento */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="person" size={18} color="#4CAF50" /> Qualidade do Atendimento
            </Text>
            <Text style={styles.sectionDescription}>
              Como foi a qualidade do atendimento médico?
            </Text>
            {renderStars(form.notaAtendimento, (value) =>
              setForm({ ...form, notaAtendimento: value }),
            )}
            <Text style={styles.ratingLabel}>
              {form.notaAtendimento > 0 && `${form.notaAtendimento} de 5 estrelas`}
            </Text>
          </View>

          {/* Seção 2: Pontualidade */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="time" size={18} color="#4CAF50" /> Pontualidade
            </Text>
            <Text style={styles.sectionDescription}>
              O médico começou a consulta no horário?
            </Text>
            {renderStars(form.notaPuntualidade, (value) =>
              setForm({ ...form, notaPuntualidade: value }),
            )}
            <Text style={styles.ratingLabel}>
              {form.notaPuntualidade > 0 && `${form.notaPuntualidade} de 5 estrelas`}
            </Text>
          </View>

          {/* Seção 3: Infraestrutura */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="medkit-outline" size={18} color="#4CAF50" /> Infraestrutura da Clínica
            </Text>
            <Text style={styles.sectionDescription}>
              Como você avalia as instalações e limpeza da clínica?
            </Text>
            {renderStars(form.notaClinica, (value) =>
              setForm({ ...form, notaClinica: value }),
            )}
            <Text style={styles.ratingLabel}>
              {form.notaClinica > 0 && `${form.notaClinica} de 5 estrelas`}
            </Text>
          </View>

          {/* Seção 4: Comunicação */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="chatbubbles" size={18} color="#4CAF50" /> Comunicação
            </Text>
            <Text style={styles.sectionDescription}>
              O médico explicou bem seu diagnóstico e tratamento?
            </Text>
            {renderStars(form.notaComuni, (value) =>
              setForm({ ...form, notaComuni: value }),
            )}
            <Text style={styles.ratingLabel}>
              {form.notaComuni > 0 && `${form.notaComuni} de 5 estrelas`}
            </Text>
          </View>

          {/* Seção 5: Voltaria */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#4CAF50" /> Voltaria
              à Clínica?
            </Text>
            <Text style={styles.sectionDescription}>
              Você voltaria a fazer uma consulta nessa clínica?
            </Text>
            {renderOptions(form.voltariaClinica, (value) =>
              setForm({ ...form, voltariaClinica: value }),
            )}
          </View>

          {/* Seção 6: Recomendaria */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="thumbs-up-outline" size={18} color="#4CAF50" /> Recomendaria o
              Médico?
            </Text>
            <Text style={styles.sectionDescription}>
              Você recomendaria esse médico a amigos e familiares?
            </Text>
            {renderOptions(form.recomendaMedico, (value) =>
              setForm({ ...form, recomendaMedico: value }),
            )}
          </View>

          {/* Seção 7: Comentário */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="create-outline" size={18} color="#4CAF50" /> Sua Experiência
            </Text>
            <Text style={styles.sectionDescription}>
              Conte-nos sobre sua experiência (obrigatório)
            </Text>
            <TextInput
              style={styles.textAreaLarge}
              placeholder="Descreva sua experiência na consulta..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={form.comentario}
              onChangeText={(text) => setForm({ ...form, comentario: text })}
              maxLength={500}
            />
            <Text style={styles.charCounter}>
              {form.comentario.length}/500 caracteres
            </Text>
          </View>

          {/* Seção 8: Sugestões */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="bulb-outline" size={18} color="#FFB800" /> Sugestões de Melhoria
            </Text>
            <Text style={styles.sectionDescription}>
              Tem alguma sugestão para melhorarmos? (opcional)
            </Text>
            <TextInput
              style={styles.textAreaSmall}
              placeholder="Suas sugestões..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              value={form.melhorias}
              onChangeText={(text) => setForm({ ...form, melhorias: text })}
              maxLength={300}
            />
            <Text style={styles.charCounter}>
              {form.melhorias.length}/300 caracteres
            </Text>
          </View>

          {/* Botão Enviar */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#FFF" />
                <Text style={styles.submitButtonText}>Enviar Avaliação</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Botão Cancelar */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <View style={styles.spacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      <AppModal {...modal} onClose={hideModal} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 28,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    flexDirection: 'row',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  starButton: {
    padding: 8,
  },
  ratingLabel: {
    textAlign: 'center',
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 12,
    marginTop: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  optionButtonActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#F0F7F0',
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  optionTextActive: {
    color: '#4CAF50',
  },
  textAreaLarge: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
    backgroundColor: '#F9F9F9',
  },
  textAreaSmall: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
    backgroundColor: '#F9F9F9',
  },
  charCounter: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    textAlign: 'right',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 12,
    elevation: 3,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DDD',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    height: 20,
  },
});

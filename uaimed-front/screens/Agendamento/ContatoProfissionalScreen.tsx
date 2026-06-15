import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { AgendamentoStackParamList } from '../../navigation/types';
import { useContatos } from '../../hooks/useContatos';
import AppModal from '../../components/AppModal';
import { useModal } from '../../hooks/useModal';

type Props = StackScreenProps<AgendamentoStackParamList, 'ContatoProfissional'>;

const ContatoProfissionalScreen: React.FC<Props> = ({ route, navigation }) => {
  const { medicoId } = route.params ?? { medicoId: undefined };
  const { enviarContato, loading } = useContatos();
  const [assunto, setAssunto] = useState('');
  const [mensagem, setMensagem] = useState('');
  const { modal, showModal, hideModal } = useModal();

  const handleEnviar = async () => {
    if (!assunto.trim() || !mensagem.trim()) {
      showModal('Campos obrigatórios', 'Preencha assunto e mensagem.', { type: 'warning' });
      return;
    }
    if (!medicoId) {
      showModal('Erro', 'ID do profissional não foi fornecido.', { type: 'error' });
      return;
    }
    const resultado = await enviarContato({ medicoId, assunto, mensagem });
    if (resultado) {
      showModal('Enviado!', 'Sua mensagem foi enviada com sucesso. O profissional/clínica será notificado.', {
        type: 'success',
        buttons: [{ text: 'OK', onPress: () => navigation.goBack() }],
      });
    } else {
      showModal('Erro', 'Falha ao enviar mensagem. Tente novamente.', { type: 'error' });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.subtitle}>Envie uma mensagem rápida para o profissional ou clínica.</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Assunto</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex.: Dúvida sobre preparo para exame"
              value={assunto}
              onChangeText={setAssunto}
              editable={!loading}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Mensagem</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descreva sua dúvida ou mensagem..."
              value={mensagem}
              onChangeText={setMensagem}
              multiline
              numberOfLines={6}
              editable={!loading}
            />
          </View>

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleEnviar} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Enviar Mensagem</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancel} onPress={() => navigation.goBack()} disabled={loading}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      <AppModal {...modal} onClose={hideModal} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { padding: 16 },
  subtitle: { fontSize: 13, color: '#666', marginBottom: 16 },
  field: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, color: '#333' },
  input: { borderWidth: 1, borderColor: '#EEE', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#FAFAFA' },
  textArea: { minHeight: 120, textAlignVertical: 'top' },
  button: { backgroundColor: '#4CAF50', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 14 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFF', fontWeight: '700' },
  cancel: { marginTop: 12, alignItems: 'center' },
  cancelText: { color: '#666' },
});

export default ContatoProfissionalScreen;

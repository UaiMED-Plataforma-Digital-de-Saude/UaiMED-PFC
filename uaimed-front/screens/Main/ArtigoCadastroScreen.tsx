import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/types';

type Props = BottomTabScreenProps<MainTabParamList, 'ArtigoCadastro'>;

const ArtigoCadastroScreen: React.FC<Props> = ({ navigation }) => {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [corpo, setCorpo] = useState('');
  const [imagem, setImagem] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para escolher a imagem.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImagem(result.assets[0].uri);
    }
  };

  const handleSalvar = () => {
    if (!titulo || !categoria || !corpo) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Aqui entraria a lógica de envio para o back-end
    Alert.alert('Sucesso', 'Artigo enviado para análise e publicação!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Novo Artigo</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Upload de Imagem */}
        <TouchableOpacity style={styles.imageUpload} onPress={pickImage} activeOpacity={0.7}>
          {imagem ? (
            <Image source={{ uri: imagem }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={40} color="#BBB" />
              <Text style={styles.imagePlaceholderText}>Adicionar Banner do Artigo</Text>
            </View>
          )}
          {imagem && (
            <View style={styles.editBadge}>
              <Ionicons name="pencil" size={16} color="#FFF" />
            </View>
          )}
        </TouchableOpacity>

        {/* Formulário */}
        <View style={styles.form}>
          <Text style={styles.label}>Título do Artigo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 5 dicas para melhorar o sono"
            value={titulo}
            onChangeText={setTitulo}
          />

          <Text style={styles.label}>Categoria *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Bem-estar, Saúde Mental, Nutrição"
            value={categoria}
            onChangeText={setCategoria}
          />

          <Text style={styles.label}>Corpo do Artigo *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Escreva aqui o conteúdo completo do seu artigo..."
            value={corpo}
            onChangeText={setCorpo}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSalvar}>
            <Text style={styles.saveButtonText}>Publicar Artigo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  scrollContent: { paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#FFF'
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  backButton: { padding: 8 },
  imageUpload: {
    height: 200,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEE',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative'
  },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { alignItems: 'center' },
  imagePlaceholderText: { color: '#888', marginTop: 8, fontSize: 14, fontWeight: '500' },
  editBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#4CAF50',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  form: { paddingHorizontal: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#444', marginBottom: 8 },
  input: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: 20,
  },
  textArea: { height: 180, paddingTop: 16 },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
  },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});

export default ArtigoCadastroScreen;

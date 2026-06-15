import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Image, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/types';
import uaiMedApi from '../../api/uaiMedApi';
import AppModal from '../../components/AppModal';
import { useModal } from '../../hooks/useModal';

type Props = BottomTabScreenProps<MainTabParamList, 'ArtigoCadastro'>;

const CATEGORIAS = [
  'BEM-ESTAR', 'SAÚDE DO SONO', 'PSICOLOGIA', 'NUTRIÇÃO',
  'CARDIOLOGIA', 'PEDIATRIA', 'ORTOPEDIA', 'DERMATOLOGIA',
];

const ArtigoCadastroScreen: React.FC<Props> = ({ navigation }) => {
  const [titulo, setTitulo]       = useState('');
  const [resumo, setResumo]       = useState('');
  const [categoria, setCategoria] = useState('');
  const [corpo, setCorpo]         = useState('');
  const [banner, setBanner]       = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);

  const { modal, showModal, hideModal } = useModal();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showModal('Permissão necessária', 'Autorize o acesso à galeria nas configurações do dispositivo.', { type: 'warning' });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]?.base64) {
      setBanner(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handlePublicar = async () => {
    if (!titulo.trim() || !categoria || !corpo.trim()) {
      showModal('Campos obrigatórios', 'Preencha título, categoria e o corpo do artigo.', { type: 'warning' });
      return;
    }
    setLoading(true);
    try {
      await uaiMedApi.post('/artigos', {
        titulo:    titulo.trim(),
        resumo:    resumo.trim() || undefined,
        categoria,
        corpo:     corpo.trim(),
        banner:    banner ?? undefined,
      });
      showModal('Artigo publicado!', 'Seu artigo foi publicado com sucesso.', {
        type: 'success',
        buttons: [{ text: 'Ver Artigos', onPress: () => navigation.navigate('Artigos') }],
      });
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'Não foi possível publicar o artigo.';
      showModal('Erro', msg, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Banner */}
          <TouchableOpacity style={styles.bannerUpload} onPress={pickImage} activeOpacity={0.75}>
            {banner ? (
              <Image source={{ uri: banner }} style={styles.bannerPreview} />
            ) : (
              <View style={styles.bannerPlaceholder}>
                <Ionicons name="image-outline" size={40} color="#BBB" />
                <Text style={styles.bannerPlaceholderText}>Adicionar banner do artigo</Text>
                <Text style={styles.bannerPlaceholderSub}>Opcional · proporção 16:9</Text>
              </View>
            )}
            {banner && (
              <View style={styles.bannerEditBadge}>
                <Ionicons name="pencil" size={15} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.form}>
            {/* Título */}
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 5 dicas para melhorar o sono"
              value={titulo}
              onChangeText={setTitulo}
              maxLength={120}
            />

            {/* Resumo */}
            <Text style={styles.label}>Resumo <Text style={styles.opcional}>(opcional)</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Uma frase que aparece na listagem de artigos..."
              value={resumo}
              onChangeText={setResumo}
              maxLength={200}
            />

            {/* Categoria */}
            <Text style={styles.label}>Categoria *</Text>
            <View style={styles.categoriasGrid}>
              {CATEGORIAS.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catBtn, categoria === cat && styles.catBtnActive]}
                  onPress={() => setCategoria(cat)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.catBtnText, categoria === cat && styles.catBtnTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Corpo */}
            <Text style={styles.label}>Conteúdo *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Escreva aqui o conteúdo completo do artigo..."
              value={corpo}
              onChangeText={setCorpo}
              multiline
              numberOfLines={12}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{corpo.length} caracteres</Text>

            {/* Publicar */}
            <TouchableOpacity
              style={[styles.btnPublicar, loading && { opacity: 0.7 }]}
              onPress={handlePublicar}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="send-outline" size={18} color="#FFF" />
                  <Text style={styles.btnPublicarText}>Publicar Artigo</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AppModal {...modal} onClose={hideModal} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF' },
  scrollContent: { paddingBottom: 48 },

  // Banner
  bannerUpload: {
    height: 190,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  bannerPlaceholder: { alignItems: 'center', gap: 6 },
  bannerPlaceholderText: { color: '#888', fontSize: 14, fontWeight: '600' },
  bannerPlaceholderSub: { color: '#BBB', fontSize: 12 },
  bannerEditBadge: {
    position: 'absolute', bottom: 12, right: 12,
    backgroundColor: '#4CAF50',
    width: 34, height: 34, borderRadius: 17,
    justifyContent: 'center', alignItems: 'center',
    elevation: 4,
  },

  // Formulário
  form: { paddingHorizontal: 16, paddingTop: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#444', marginBottom: 8, marginTop: 4 },
  opcional: { color: '#BBB', fontWeight: '500' },
  input: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: 16,
  },
  textArea: { height: 200, paddingTop: 14, marginBottom: 4 },
  charCount: { fontSize: 11, color: '#BBB', textAlign: 'right', marginBottom: 16 },

  // Categorias
  categoriasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  catBtn: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#DDD',
    backgroundColor: '#FAFAFA',
  },
  catBtnActive: { borderColor: '#4CAF50', backgroundColor: '#F0F7F0' },
  catBtnText: { fontSize: 12, fontWeight: '600', color: '#888' },
  catBtnTextActive: { color: '#4CAF50' },

  // Botão publicar
  btnPublicar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 12, paddingVertical: 15,
    marginTop: 4,
    elevation: 3,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4,
  },
  btnPublicarText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default ArtigoCadastroScreen;

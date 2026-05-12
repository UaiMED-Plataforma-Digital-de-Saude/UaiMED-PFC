import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { ConversasStackParamList } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import uaiMedApi from '../../api/uaiMedApi';

type Props = StackScreenProps<ConversasStackParamList, 'ConversaDetalhe'>;

interface Mensagem {
  id: string;
  texto: string;
  remetenteId: string;
  remetente: { id: string; nome: string; avatar: string | null };
  lida: boolean;
  criado_em: string;
}

// ─── Formata hora da mensagem ─────────────────────────────────────────────────
function formatarHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
function formatarDia(iso: string): string {
  const d = new Date(iso);
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);

  if (d.toDateString() === hoje.toDateString()) return 'Hoje';
  if (d.toDateString() === ontem.toDateString()) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
}

// ─── Balão de Mensagem ────────────────────────────────────────────────────────
const BolinhaMensagem: React.FC<{
  item: Mensagem;
  isOwn: boolean;
}> = ({ item, isOwn }) => (
  <View style={[bubbleStyles.container, isOwn ? bubbleStyles.own : bubbleStyles.other]}>
    <View style={[bubbleStyles.bubble, isOwn ? bubbleStyles.bubbleOwn : bubbleStyles.bubbleOther]}>
      <Text style={[bubbleStyles.text, isOwn && bubbleStyles.textOwn]}>{item.texto}</Text>
      <View style={bubbleStyles.footer}>
        <Text style={[bubbleStyles.hora, isOwn && bubbleStyles.horaOwn]}>{formatarHora(item.criado_em)}</Text>
        {isOwn && (
          <Ionicons
            name={item.lida ? 'checkmark-done' : 'checkmark'}
            size={13}
            color={item.lida ? '#90CAF9' : 'rgba(255,255,255,0.6)'}
            style={{ marginLeft: 3 }}
          />
        )}
      </View>
    </View>
  </View>
);

const bubbleStyles = StyleSheet.create({
  container: { marginVertical: 2, paddingHorizontal: 12 },
  own: { alignItems: 'flex-end' },
  other: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  bubbleOwn: {
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  text: { fontSize: 15, color: '#222', lineHeight: 21 },
  textOwn: { color: '#FFF' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 },
  hora: { fontSize: 11, color: '#999' },
  horaOwn: { color: 'rgba(255,255,255,0.7)' },
});

// ─── Separador de Dia ─────────────────────────────────────────────────────────
const DividerDia: React.FC<{ dia: string }> = ({ dia }) => (
  <View style={dayStyles.container}>
    <View style={dayStyles.line} />
    <Text style={dayStyles.text}>{dia}</Text>
    <View style={dayStyles.line} />
  </View>
);
const dayStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginVertical: 12, paddingHorizontal: 16 },
  line: { flex: 1, height: 1, backgroundColor: '#EEE' },
  text: { marginHorizontal: 10, fontSize: 12, color: '#AAA', fontWeight: '600' },
});

// ─── Tela Principal ───────────────────────────────────────────────────────────
const ConversaDetalhesScreen: React.FC<Props> = ({ route, navigation }) => {
  const { conversaId, nomeOutro } = route.params;
  const { user } = useAuth();
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMensagens = useCallback(async () => {
    try {
      const res = await uaiMedApi.get(`/conversas/${conversaId}/mensagens`);
      setMensagens(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.warn('Erro ao buscar mensagens:', e);
    } finally {
      setLoading(false);
    }
  }, [conversaId]);

  // Polling leve a cada 5s para simular recebimento de mensagens
  useFocusEffect(
    useCallback(() => {
      fetchMensagens();
      pollingRef.current = setInterval(fetchMensagens, 5000);
      return () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
      };
    }, [fetchMensagens])
  );

  useEffect(() => {
    if (mensagens.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [mensagens.length]);

  const handleEnviar = async () => {
    if (!texto.trim() || enviando) return;
    const textoTemp = texto.trim();
    setTexto('');
    setEnviando(true);

    // Otimista: adiciona mensagem imediatamente
    const temp: Mensagem = {
      id: `temp-${Date.now()}`,
      texto: textoTemp,
      remetenteId: user!.id,
      remetente: { id: user!.id, nome: user!.nome, avatar: null },
      lida: false,
      criado_em: new Date().toISOString(),
    };
    setMensagens((prev) => [...prev, temp]);

    try {
      await uaiMedApi.post(`/conversas/${conversaId}/mensagens`, { texto: textoTemp });
      fetchMensagens();
    } catch (e) {
      console.warn('Erro ao enviar mensagem:', e);
      // Remove mensagem temporária em caso de erro
      setMensagens((prev) => prev.filter((m) => m.id !== temp.id));
      setTexto(textoTemp);
    } finally {
      setEnviando(false);
    }
  };

  // Agrupa mensagens por dia para o separador
  interface ListItem {
    type: 'day' | 'msg';
    key: string;
    dia?: string;
    msg?: Mensagem;
  }
  const listaComDias: ListItem[] = [];
  let ultimoDia = '';
  for (const m of mensagens) {
    const dia = formatarDia(m.criado_em);
    if (dia !== ultimoDia) {
      listaComDias.push({ type: 'day', key: `day-${m.id}`, dia });
      ultimoDia = dia;
    }
    listaComDias.push({ type: 'msg', key: m.id, msg: m });
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* ── Cabeçalho ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>
              {nomeOutro.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerNome} numberOfLines={1}>{nomeOutro}</Text>
            <Text style={styles.headerStatus}>Online</Text>
          </View>
        </View>

        {/* ── Lista de Mensagens ── */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#4CAF50" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={listaComDias}
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item }) => {
              if (item.type === 'day') {
                return <DividerDia dia={item.dia!} />;
              }
              const msg = item.msg!;
              const isOwn = msg.remetenteId === user?.id;
              return <BolinhaMensagem item={msg} isOwn={isOwn} />;
            }}
            ListEmptyComponent={
              <View style={styles.emptyMsg}>
                <Ionicons name="chatbubble-ellipses-outline" size={40} color="#DDD" />
                <Text style={styles.emptyMsgText}>Nenhuma mensagem ainda.{'\n'}Diga olá! 👋</Text>
              </View>
            }
          />
        )}

        {/* ── Campo de digitação ── */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem..."
            placeholderTextColor="#AAA"
            value={texto}
            onChangeText={setTexto}
            multiline
            maxLength={500}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={handleEnviar}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!texto.trim() || enviando) && styles.sendBtnDisabled]}
            onPress={handleEnviar}
            disabled={!texto.trim() || enviando}
            activeOpacity={0.8}
          >
            {enviando ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F0' },

  // Cabeçalho
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    gap: 10,
  },
  backBtn: { padding: 4 },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  headerNome: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  headerStatus: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 1 },

  // Lista
  listContent: { paddingVertical: 12, paddingBottom: 8 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  emptyMsg: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80, gap: 12 },
  emptyMsgText: { fontSize: 14, color: '#BBB', textAlign: 'center', lineHeight: 22 },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#FAFAFA',
    maxHeight: 120,
    color: '#222',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  sendBtnDisabled: { backgroundColor: '#A5D6A7', elevation: 0, shadowOpacity: 0 },
});

export default ConversaDetalhesScreen;

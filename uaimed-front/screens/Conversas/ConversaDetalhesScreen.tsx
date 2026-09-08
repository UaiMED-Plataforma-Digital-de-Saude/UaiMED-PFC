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
  RefreshControl,
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
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const carregouRef = useRef(false);
  const sequenciaRequisicaoRef = useRef(0);
  const ultimaRequisicaoAplicadaRef = useRef(0);

  const fetchMensagens = useCallback(async (mostrarLoading = false) => {
    const requisicao = ++sequenciaRequisicaoRef.current;
    if (mostrarLoading && !carregouRef.current) setLoading(true);
    try {
      const res = await uaiMedApi.get(`/conversas/${conversaId}/mensagens`);
      if (requisicao >= ultimaRequisicaoAplicadaRef.current) {
        ultimaRequisicaoAplicadaRef.current = requisicao;
        setMensagens(Array.isArray(res.data) ? res.data : []);
      }
      carregouRef.current = true;
      setErro(null);
    } catch (e) {
      console.warn('Erro ao buscar mensagens:', e);
      if (!carregouRef.current) {
        setErro('Não foi possível carregar esta conversa.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [conversaId]);

  // Atualiza enquanto a conversa estiver visível. O polling pode ser trocado por
  // WebSocket no futuro sem alterar o contrato atual da API.
  useFocusEffect(
    useCallback(() => {
      fetchMensagens(true);
      const polling = setInterval(() => fetchMensagens(false), 3000);
      return () => clearInterval(polling);
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
    setErro(null);

    try {
      const res = await uaiMedApi.post<Mensagem>(
        `/conversas/${conversaId}/mensagens`,
        { texto: textoTemp },
      );
      setMensagens((prev) => prev.some((m) => m.id === res.data.id)
        ? prev
        : [...prev, res.data]);
      await fetchMensagens(false);
    } catch (e) {
      console.warn('Erro ao enviar mensagem:', e);
      setTexto(textoTemp);
      setErro('A mensagem não foi enviada. Verifique sua conexão e tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMensagens(false);
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
    <SafeAreaView style={styles.container} edges={['top']}>
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
            <Text style={styles.headerStatus}>Mensagens atualizadas automaticamente</Text>
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
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4CAF50" />
            }
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
        {erro ? (
          <View style={styles.errorBar}>
            <Ionicons name="alert-circle-outline" size={16} color="#B71C1C" />
            <Text style={styles.errorText}>{erro}</Text>
          </View>
        ) : null}
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
  errorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  errorText: { flex: 1, color: '#B71C1C', fontSize: 12 },

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

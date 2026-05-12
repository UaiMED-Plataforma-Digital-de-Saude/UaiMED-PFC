import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/types';

type HelpScreenProps = BottomTabScreenProps<MainTabParamList, 'Ajuda'>;

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Sender = 'bot' | 'user';

interface Mensagem {
  id: string;
  sender: Sender;
  texto: string;
  timestamp: Date;
}

interface OpcaoRapida {
  id: string;
  label: string;
  icone: keyof typeof Ionicons.glyphMap;
}

// ─── Script do Bot ────────────────────────────────────────────────────────────
const SAUDACAO_INICIAL =
  'Olá! Sou o **Assistente UaiMED** 👋\n\nEstou aqui para te ajudar com dúvidas sobre nossa plataforma. Como posso te ajudar hoje?';

const OPCOES: OpcaoRapida[] = [
  { id: 'agendar',    label: 'Como agendar uma consulta?',    icone: 'calendar-outline' },
  { id: 'cancelar',   label: 'Cancelar ou remarcar consulta', icone: 'close-circle-outline' },
  { id: 'pagamento',  label: 'Problemas com pagamento',       icone: 'card-outline' },
  { id: 'pix',        label: 'Como funciona o PIX?',          icone: 'scan-outline' },
  { id: 'conta',      label: 'Minha conta e dados pessoais',  icone: 'person-outline' },
  { id: 'avaliacao',  label: 'Como avaliar uma consulta?',    icone: 'star-outline' },
  { id: 'atendente',  label: 'Falar com um atendente',        icone: 'headset-outline' },
];

const RESPOSTAS: Record<string, string> = {
  agendar:
    '📅 **Agendamento de Consultas**\n\n' +
    '1. Acesse a aba **Consultas** no menu inferior.\n' +
    '2. Use a busca para encontrar um médico ou especialidade.\n' +
    '3. Escolha o profissional e clique em **Agendar**.\n' +
    '4. Selecione um dia e horário disponíveis.\n' +
    '5. Confirme e realize o pagamento.\n\n' +
    'Pronto! Você receberá uma confirmação por e-mail. 🎉',

  cancelar:
    '🔄 **Cancelamento e Remarcação**\n\n' +
    'Para cancelar ou remarcar:\n\n' +
    '1. Vá em **Meu Perfil → Minhas Consultas**.\n' +
    '2. Localize o agendamento desejado.\n' +
    '3. Toque em **Cancelar** ou **Remarcar**.\n\n' +
    '⚠️ Cancelamentos com menos de 24h de antecedência podem estar sujeitos a taxas conforme a política do profissional.',

  pagamento:
    '💳 **Problemas com Pagamento**\n\n' +
    'Aceitamos:\n' +
    '• **PIX** — aprovação imediata\n' +
    '• **Cartão de Crédito/Débito** — aprovação em segundos\n' +
    '• **Boleto Bancário** — aprovação em até 2 dias úteis\n\n' +
    'Se o pagamento não foi reconhecido, aguarde alguns minutos e verifique em **Meu Perfil → Meus Pagamentos**.\n\n' +
    'Persistindo o problema, fale com nosso suporte.',

  pix:
    '⚡ **Pagamento via PIX**\n\n' +
    '1. Escolha **PIX** na tela de pagamento.\n' +
    '2. Escaneie o **QR Code** exibido com o app do seu banco.\n' +
    '3. Ou copie a **Chave PIX** e cole no seu app bancário.\n' +
    '4. O pagamento é confirmado em **instantes**!\n\n' +
    'O QR Code expira em **10 minutos**. Caso expire, basta gerar um novo. 😊',

  conta:
    '👤 **Minha Conta e Dados**\n\n' +
    'Acesse **Meu Perfil** para:\n\n' +
    '• Ver e editar suas informações pessoais\n' +
    '• Alterar sua senha\n' +
    '• Configurar notificações\n' +
    '• Gerenciar dados bancários (para médicos/clínicas)\n\n' +
    'Seus dados são protegidos com criptografia e nunca são compartilhados sem sua autorização.',

  avaliacao:
    '⭐ **Avaliar uma Consulta**\n\n' +
    'Após o atendimento, você pode avaliar o profissional:\n\n' +
    '1. Vá em **Minhas Consultas**.\n' +
    '2. Localize a consulta realizada.\n' +
    '3. Toque em **Avaliar**.\n' +
    '4. Dê notas em 4 critérios e deixe um comentário.\n\n' +
    'Suas avaliações são fundamentais para a qualidade da plataforma! 🌟',

  atendente:
    '👨‍💼 **Atendimento Humano**\n\n' +
    'Prezado(a) usuário(a),\n\n' +
    'Estamos registrando a sua solicitação de atendimento personalizado. ' +
    'Em breve, um de nossos **atendentes especializados** entrará em contato com você ' +
    'pelo e-mail cadastrado em sua conta.\n\n' +
    'Nosso horário de atendimento é:\n' +
    '🕗 Segunda a Sexta — 08h às 18h\n' +
    '🕗 Sábado — 08h às 12h\n\n' +
    'Agradecemos pela sua paciência e compreensão.\n\n' +
    '— **Equipe de Suporte UaiMED** 💚',
};

const USUARIO_LABELS: Record<string, string> = {
  agendar:   'Como agendar uma consulta?',
  cancelar:  'Cancelar ou remarcar consulta',
  pagamento: 'Problemas com pagamento',
  pix:       'Como funciona o PIX?',
  conta:     'Minha conta e dados pessoais',
  avaliacao: 'Como avaliar uma consulta?',
  atendente: 'Quero falar com um atendente',
};

// ─── Componente de Balão de Mensagem ─────────────────────────────────────────
const Balao: React.FC<{ msg: Mensagem }> = ({ msg }) => {
  const isBot = msg.sender === 'bot';

  // Parse **bold** text
  const renderTexto = (texto: string) => {
    const parts = texto.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <Text key={i} style={{ fontWeight: '700' }}>{part.slice(2, -2)}</Text>;
      }
      return <Text key={i}>{part}</Text>;
    });
  };

  return (
    <View style={[balaoStyles.row, isBot ? balaoStyles.rowBot : balaoStyles.rowUser]}>
      {isBot && (
        <View style={balaoStyles.avatar}>
          <Image
            source={require('../../assets/logo.png')}
            style={balaoStyles.avatarLogo}
            resizeMode="contain"
          />
        </View>
      )}
      <View style={[balaoStyles.bubble, isBot ? balaoStyles.bubbleBot : balaoStyles.bubbleUser]}>
        <Text style={[balaoStyles.texto, isBot ? balaoStyles.textoBot : balaoStyles.textoUser]}>
          {renderTexto(msg.texto)}
        </Text>
        <Text style={[balaoStyles.hora, isBot && balaoStyles.horaBot]}>
          {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
};

const balaoStyles = StyleSheet.create({
  row: { flexDirection: 'row', marginVertical: 4, paddingHorizontal: 12 },
  rowBot: { alignItems: 'flex-end', justifyContent: 'flex-start' },
  rowUser: { justifyContent: 'flex-end' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
    flexShrink: 0,
    borderWidth: 1.5,
    borderColor: '#C8E6C9',
  },
  avatarLogo: {
    width: 22,
    height: 22,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  bubbleBot: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  bubbleUser: {
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
  },
  texto: { fontSize: 14, lineHeight: 21 },
  textoBot: { color: '#222' },
  textoUser: { color: '#FFF' },
  hora: { fontSize: 10, color: '#AAA', marginTop: 4, alignSelf: 'flex-end' },
  horaBot: { color: '#BBB' },
});

// ─── Chip de Opção Rápida ─────────────────────────────────────────────────────
const Chip: React.FC<{ opcao: OpcaoRapida; onPress: () => void }> = ({ opcao, onPress }) => (
  <TouchableOpacity style={chipStyles.chip} onPress={onPress} activeOpacity={0.75}>
    <Ionicons name={opcao.icone} size={15} color="#4CAF50" style={{ marginRight: 6 }} />
    <Text style={chipStyles.texto}>{opcao.label}</Text>
  </TouchableOpacity>
);

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#C8E6C9',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  texto: { fontSize: 13, color: '#2E7D32', fontWeight: '600', flex: 1 },
});

// ─── Tela Principal ───────────────────────────────────────────────────────────
const HelpScreen: React.FC<HelpScreenProps> = ({ navigation }) => {
  const scrollRef = useRef<ScrollView>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [opcoesMostradas, setOpcoesMostradas] = useState(true);
  const [digitando, setDigitando] = useState(false);
  const [atendenteSolicitado, setAtendenteSolicitado] = useState(false);

  // Mensagem inicial do bot
  useEffect(() => {
    setTimeout(() => {
      adicionarMensagemBot(SAUDACAO_INICIAL);
    }, 400);
  }, []);

  const adicionarMensagemBot = (texto: string) => {
    setMensagens((prev) => [
      ...prev,
      { id: `bot-${Date.now()}`, sender: 'bot', texto, timestamp: new Date() },
    ]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const adicionarMensagemUsuario = (texto: string) => {
    setMensagens((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, sender: 'user', texto, timestamp: new Date() },
    ]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleOpcao = (opcao: OpcaoRapida) => {
    if (digitando) return;

    // Oculta chips e adiciona mensagem do usuário
    setOpcoesMostradas(false);
    adicionarMensagemUsuario(USUARIO_LABELS[opcao.id]);

    if (opcao.id === 'atendente') setAtendenteSolicitado(true);

    // Simula digitação do bot
    setDigitando(true);
    setTimeout(() => {
      setDigitando(false);
      adicionarMensagemBot(RESPOSTAS[opcao.id]);
      // Mostra novamente as opções (exceto se foi atendente)
      if (opcao.id !== 'atendente') {
        setTimeout(() => {
          adicionarMensagemBot('Posso te ajudar com mais alguma coisa? 😊');
          setOpcoesMostradas(true);
        }, 600);
      } else {
        // Após atendente: mostra apenas contato direto
        setTimeout(() => {
          setOpcoesMostradas(false);
        }, 300);
      }
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>

      {/* ── Assistente info bar ── */}
      <View style={styles.assistenteBar}>
        <View style={styles.assistenteAvatar}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.assistenteAvatarLogo}
            resizeMode="contain"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.assistenteNome}>Assistente UaiMED</Text>
          <View style={styles.assistenteOnline}>
            <View style={styles.onlineDot} />
            <Text style={styles.assistenteStatus}>Online agora</Text>
          </View>
        </View>
        <View style={styles.assistenteBadge}>
          <Text style={styles.assistenteBadgeText}>Suporte</Text>
        </View>
      </View>

      {/* ── Mensagens ── */}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {mensagens.map((msg) => (
          <Balao key={msg.id} msg={msg} />
        ))}

        {/* Indicador de digitação */}
        {digitando && (
          <View style={[balaoStyles.row, balaoStyles.rowBot]}>
            <View style={balaoStyles.avatar}>
              <Image
                source={require('../../assets/logo.png')}
                style={balaoStyles.avatarLogo}
                resizeMode="contain"
              />
            </View>
            <View style={[balaoStyles.bubble, balaoStyles.bubbleBot, styles.typingBubble]}>
              <ActivityIndicator size="small" color="#4CAF50" />
            </View>
          </View>
        )}

        {/* ── Opções rápidas ── */}
        {opcoesMostradas && !digitando && (
          <View style={styles.chipsContainer}>
            {OPCOES.map((op) => (
              <Chip key={op.id} opcao={op} onPress={() => handleOpcao(op)} />
            ))}
          </View>
        )}

        {/* ── Pós-atendente: Botões de contato direto ── */}
        {atendenteSolicitado && !digitando && (
          <View style={styles.contatoCard}>
            <Text style={styles.contatoTitulo}>Canais de Contato Direto</Text>

            <TouchableOpacity
              style={[styles.contatoBtn, { backgroundColor: '#E3F2FD' }]}
              onPress={() => Linking.openURL('mailto:suporte@uaimed.com.br')}
              activeOpacity={0.8}
            >
              <Ionicons name="mail-outline" size={20} color="#2196F3" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.contatoBtnTitulo, { color: '#1565C0' }]}>E-mail</Text>
                <Text style={styles.contatoBtnDesc}>suporte@uaimed.com.br</Text>
              </View>
              <Ionicons name="open-outline" size={16} color="#90CAF9" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contatoBtn, { backgroundColor: '#E8F5E9', marginTop: 8 }]}
              onPress={() => Linking.openURL('https://wa.me/5500000000000')}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#4CAF50" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.contatoBtnTitulo, { color: '#2E7D32' }]}>WhatsApp</Text>
                <Text style={styles.contatoBtnDesc}>Seg–Sex: 08h–18h | Sáb: 08h–12h</Text>
              </View>
              <Ionicons name="open-outline" size={16} color="#A5D6A7" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.reiniciarBtn}
              onPress={() => {
                setMensagens([]);
                setOpcoesMostradas(false);
                setAtendenteSolicitado(false);
                setTimeout(() => {
                  adicionarMensagemBot(SAUDACAO_INICIAL);
                  setOpcoesMostradas(true);
                }, 400);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh-outline" size={16} color="#888" />
              <Text style={styles.reiniciarText}>Voltar ao início do atendimento</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ── Rodapé ── */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F0' },

  // Barra do assistente (abaixo do header principal)
  assistenteBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  assistenteAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    overflow: 'hidden',
  },
  assistenteAvatarLogo: { width: 36, height: 36 },
  assistenteNome: { color: '#FFF', fontWeight: '700', fontSize: 17 },
  assistenteOnline: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#B9F6CA' },
  assistenteStatus: { color: 'rgba(255,255,255,0.9)', fontSize: 13 },
  assistenteBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  assistenteBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },

  // Mensagens
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 16, paddingBottom: 8 },
  typingBubble: { paddingVertical: 12, paddingHorizontal: 16 },

  // Chips
  chipsContainer: {
    marginTop: 12,
    marginHorizontal: 52,
    marginBottom: 4,
  },

  // Contato direto
  contatoCard: {
    margin: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  contatoTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  contatoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
  },
  contatoBtnTitulo: { fontSize: 14, fontWeight: '700' },
  contatoBtnDesc: { fontSize: 12, color: '#777', marginTop: 2 },
  reiniciarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  reiniciarText: { fontSize: 13, color: '#888' },
});

export default HelpScreen;

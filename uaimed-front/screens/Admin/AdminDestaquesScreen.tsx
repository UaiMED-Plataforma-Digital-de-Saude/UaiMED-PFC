import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { isArticleAdmin } from '../../utils/articleAdmin';
import { useModal } from '../../hooks/useModal';
import AppModal from '../../components/AppModal';
import uaiMedApi from '../../api/uaiMedApi';

interface Opcao {
  id: string;
  nome: string;
  email: string;
  cidade: string | null;
  estado: string | null;
  especialidade?: string;
  crm?: string;
  cnpj?: string | null;
  destaque: boolean;
}
interface Catalogo { profissionais: Opcao[]; clinicas: Opcao[] }
type Grupo = keyof Catalogo;
const chave = (p: Set<string>, c: Set<string>) => JSON.stringify([[...p].sort(), [...c].sort()]);
const normalizar = (valor: string) => valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const AdminDestaquesScreen: React.FC = () => {
  const { user } = useAuth();
  const permitido = isArticleAdmin(user);
  const { modal, showModal, hideModal } = useModal();
  const [catalogo, setCatalogo] = useState<Catalogo>({ profissionais: [], clinicas: [] });
  const [grupo, setGrupo] = useState<Grupo>('profissionais');
  const [busca, setBusca] = useState('');
  const [profissionais, setProfissionais] = useState<Set<string>>(new Set());
  const [clinicas, setClinicas] = useState<Set<string>>(new Set());
  const [chaveSalva, setChaveSalva] = useState(chave(new Set(), new Set()));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const alterado = chave(profissionais, clinicas) !== chaveSalva;
  const alteradoRef = useRef(false);
  useEffect(() => { alteradoRef.current = alterado; }, [alterado]);

  const carregar = useCallback(async (refresh = false, ativo: () => boolean = () => true) => {
    if (!permitido) return;
    if (refresh) setRefreshing(true); else setLoading(true);
    setErro('');
    try {
      const { data } = await uaiMedApi.get<Catalogo>('/admin/destaques');
      if (!ativo()) return;
      const p = new Set(data.profissionais.filter(item => item.destaque).map(item => item.id));
      const c = new Set(data.clinicas.filter(item => item.destaque).map(item => item.id));
      setCatalogo(data); setProfissionais(p); setClinicas(c); setChaveSalva(chave(p, c));
    } catch (error: any) {
      if (ativo()) setErro(error?.response?.data?.error || 'Não foi possível carregar os cadastros. Tente novamente.');
    } finally {
      if (ativo()) { setLoading(false); setRefreshing(false); }
    }
  }, [permitido]);

  useFocusEffect(useCallback(() => {
    let ativo = true;
    if (!alteradoRef.current) void carregar(false, () => ativo);
    return () => { ativo = false; };
  }, [carregar]));

  const salvar = async () => {
    if (!permitido || salvando || loading || !alterado) return;
    setSalvando(true);
    try {
      await uaiMedApi.put('/admin/destaques', { profissionalIds: [...profissionais], clinicaIds: [...clinicas] });
      setChaveSalva(chave(profissionais, clinicas));
      showModal('Destaques atualizados', 'A home de pacientes exibirá os selecionados, respeitando o filtro de cidade e estado.', { type: 'success' });
    } catch (error: any) {
      showModal('Não foi possível salvar', error?.response?.data?.error || 'Tente novamente. Suas escolhas foram mantidas.', { type: 'error' });
    } finally { setSalvando(false); }
  };

  const recarregar = () => {
    if (salvando) return;
    if (!alterado) { void carregar(true); return; }
    showModal('Descartar alterações?', 'Recarregar a lista substituirá suas escolhas ainda não salvas.', {
      type: 'confirm', buttons: [{ text: 'Cancelar', style: 'cancel' }, { text: 'Recarregar', onPress: () => { void carregar(true); } }],
    });
  };
  const selecionados = grupo === 'profissionais' ? profissionais : clinicas;
  const filtrados = useMemo(() => {
    const termo = normalizar(busca.trim());
    return catalogo[grupo].filter(item => normalizar([item.nome, item.email, item.especialidade, item.crm, item.cnpj, item.cidade, item.estado].filter(Boolean).join(' ')).includes(termo));
  }, [catalogo, grupo, busca]);

  if (!permitido) return null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={loading || erro ? [] : filtrados}
        extraData={selecionados}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={recarregar} colors={['#388E3C']} enabled={!salvando} />}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Escolha quem aparece na home</Text>
            <Text style={styles.description}>Marque os profissionais e as clínicas e salve a seleção. Apenas cadastros ativos podem aparecer em destaque.</Text>
            <View style={styles.tabs}>
              {(['profissionais', 'clinicas'] as Grupo[]).map(item => (
                <TouchableOpacity
                  key={item} accessibilityRole="tab" accessibilityState={{ selected: grupo === item }}
                  style={[styles.tab, grupo === item && styles.tabActive]}
                  onPress={() => { setGrupo(item); setBusca(''); }}
                >
                  <Text style={[styles.tabText, grupo === item && styles.tabActiveText]}>
                    {item === 'profissionais' ? 'Profissionais' : 'Clínicas'} ({item === 'profissionais' ? profissionais.size : clinicas.size})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.search}>
              <Ionicons name="search-outline" size={20} color="#87968B" />
              <TextInput
                style={styles.searchInput} value={busca} onChangeText={setBusca}
                placeholder={grupo === 'profissionais' ? 'Nome, especialidade, CRM ou cidade' : 'Nome, CNPJ ou cidade'}
                accessibilityLabel="Buscar cadastros para destaque" autoCapitalize="none"
              />
            </View>
            {!loading && !erro && <Text style={styles.count}>{filtrados.length} {grupo === 'profissionais' ? 'profissionais' : 'clínicas'} na lista · {selecionados.size} em destaque</Text>}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            {loading ? <ActivityIndicator color="#388E3C" size="large" /> : erro ? (
              <>
                <Text style={styles.emptyText}>{erro}</Text>
                <TouchableOpacity style={styles.retry} accessibilityRole="button" onPress={recarregar}>
                  <Text style={styles.link}>Tentar novamente</Text>
                </TouchableOpacity>
              </>
            ) : <Text style={styles.emptyText}>{busca.trim() ? 'Nenhum cadastro corresponde à busca.' : 'Nenhum cadastro ativo disponível.'}</Text>}
          </View>
        }
        renderItem={({ item }) => {
          const marcado = selecionados.has(item.id);
          return (
            <TouchableOpacity
              style={[styles.row, marcado && styles.rowSelected]}
              accessibilityRole="checkbox" accessibilityState={{ checked: marcado, disabled: salvando || refreshing }}
              accessibilityLabel={`${item.nome}${item.especialidade ? `, ${item.especialidade}` : ''}`}
              disabled={salvando || refreshing}
              onPress={() => {
                const atualizar = grupo === 'profissionais' ? setProfissionais : setClinicas;
                atualizar(atual => { const proximo = new Set(atual); if (proximo.has(item.id)) proximo.delete(item.id); else proximo.add(item.id); return proximo; });
              }}
            >
              <Ionicons name={marcado ? 'checkbox' : 'square-outline'} size={26} color={marcado ? '#388E3C' : '#AFBDB3'} />
              <View style={styles.rowInfo}>
                <Text style={styles.name}>{item.nome}</Text>
                {item.especialidade && <Text style={styles.detail}>{item.especialidade} · {item.crm}</Text>}
                <Text style={styles.detail}>{[item.cidade, item.estado].filter(Boolean).join(', ') || 'Localização não informada'}</Text>
                <Text style={styles.email}>{item.email}</Text>
              </View>
              {marcado && <Ionicons name="star" color="#C19C32" size={17} />}
            </TouchableOpacity>
          );
        }}
      />
      <View style={styles.footer}>
        <Text style={styles.footerText}>{loading ? 'Carregando seleção' : erro ? 'Carregamento pendente' : alterado ? 'Você tem alterações para salvar' : 'Seleção salva'} · {profissionais.size} profissionais e {clinicas.size} clínicas</Text>
        <TouchableOpacity
          style={[styles.save, (!alterado || loading || refreshing || !!erro || salvando) && styles.disabled]}
          accessibilityRole="button" onPress={salvar} disabled={!alterado || loading || refreshing || !!erro || salvando}
        >
          {salvando ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveText}>Salvar destaques</Text>}
        </TouchableOpacity>
      </View>
      <AppModal {...modal} onClose={hideModal} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7F5' },
  content: { padding: 20 },
  title: { color: '#273E30', fontSize: 23, fontWeight: '800', lineHeight: 30, marginBottom: 10 },
  description: { color: '#728078', fontSize: 13, lineHeight: 21, marginBottom: 20 },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 13, borderRadius: 10, backgroundColor: '#E8EEEA' },
  tabActive: { backgroundColor: '#388E3C' },
  tabText: { color: '#52745F', fontSize: 13, fontWeight: '700' },
  tabActiveText: { color: '#FFF' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#DEE6E0', borderRadius: 12, backgroundColor: '#FFF', paddingHorizontal: 12 },
  searchInput: { flex: 1, minHeight: 48, color: '#273E30', fontSize: 13 },
  count: { fontSize: 12, color: '#728078', marginVertical: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E4EBE6', marginBottom: 10 },
  rowSelected: { borderColor: '#9EC8A2', backgroundColor: '#F1F9F2' },
  rowInfo: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#273E30', marginBottom: 5 },
  detail: { fontSize: 12, color: '#728078', lineHeight: 19 },
  email: { fontSize: 11, color: '#8B9B90', marginTop: 4 },
  empty: { paddingVertical: 32, alignItems: 'center' },
  emptyText: { color: '#728078', textAlign: 'center', lineHeight: 21 },
  retry: { padding: 14 },
  link: { color: '#388E3C', fontWeight: '700' },
  footer: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#E4EBE6' },
  footerText: { fontSize: 11, color: '#728078', textAlign: 'center', marginBottom: 10 },
  save: { minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: '#388E3C', borderRadius: 12 },
  saveText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.5 },
});

export default AdminDestaquesScreen;

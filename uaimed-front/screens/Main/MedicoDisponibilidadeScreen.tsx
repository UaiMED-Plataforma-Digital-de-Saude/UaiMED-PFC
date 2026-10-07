import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator, ScrollView, StyleSheet, Switch,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import uaiMedApi from '../../api/uaiMedApi';
import AppModal from '../../components/AppModal';
import { useModal } from '../../hooks/useModal';

interface DiaDisponibilidade {
  diaSemana: number;
  ativo: boolean;
  horaInicio: string;
  horaFim: string;
}

const NOMES_DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const MedicoDisponibilidadeScreen: React.FC = () => {
  const [dias, setDias] = useState<DiaDisponibilidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const { modal, showModal, hideModal } = useModal();

  useFocusEffect(useCallback(() => {
    let ativo = true;
    setLoading(true);

    uaiMedApi.get('/professionals/me/disponibilidade').then((res) => {
      if (ativo) setDias(res.data);
    }).catch(() => {
      showModal('Erro', 'Não foi possível carregar sua disponibilidade.', { type: 'error' });
    }).finally(() => {
      if (ativo) setLoading(false);
    });

    return () => { ativo = false; };
  }, []));

  const atualizarDia = (diaSemana: number, campo: keyof DiaDisponibilidade, valor: string | boolean) => {
    setDias((prev) => prev.map((d) => (d.diaSemana === diaSemana ? { ...d, [campo]: valor } : d)));
  };

  const handleSalvar = async () => {
    for (const dia of dias) {
      if (!dia.ativo) continue;
      if (!HORA_REGEX.test(dia.horaInicio) || !HORA_REGEX.test(dia.horaFim)) {
        showModal('Horário inválido', `Verifique os horários de ${NOMES_DIAS[dia.diaSemana]} (use o formato HH:mm).`, { type: 'warning' });
        return;
      }
      if (dia.horaInicio >= dia.horaFim) {
        showModal('Horário inválido', `Em ${NOMES_DIAS[dia.diaSemana]}, o horário de início deve ser antes do fim.`, { type: 'warning' });
        return;
      }
    }

    setSalvando(true);
    try {
      await uaiMedApi.put('/professionals/me/disponibilidade', dias);
      showModal('Disponibilidade salva!', 'Seus horários de atendimento foram atualizados.', { type: 'success' });
    } catch (e: any) {
      showModal('Erro', e?.response?.data?.error || 'Não foi possível salvar sua disponibilidade.', { type: 'error' });
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Carregando disponibilidade...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.hint}>
          Defina os dias e horários em que você atende. Pacientes só verão horários
          disponíveis dentro dessa janela.
        </Text>

        {dias.map((dia) => (
          <View key={dia.diaSemana} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.diaLabel}>{NOMES_DIAS[dia.diaSemana]}</Text>
              <Switch
                value={dia.ativo}
                onValueChange={(v) => atualizarDia(dia.diaSemana, 'ativo', v)}
                trackColor={{ true: '#4CAF50' }}
              />
            </View>

            {dia.ativo && (
              <View style={styles.horasRow}>
                <View style={styles.horaField}>
                  <Text style={styles.horaLabel}>Início</Text>
                  <TextInput
                    style={styles.horaInput}
                    value={dia.horaInicio}
                    onChangeText={(v) => atualizarDia(dia.diaSemana, 'horaInicio', v)}
                    placeholder="08:00"
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                  />
                </View>
                <View style={styles.horaField}>
                  <Text style={styles.horaLabel}>Fim</Text>
                  <TextInput
                    style={styles.horaInput}
                    value={dia.horaFim}
                    onChangeText={(v) => atualizarDia(dia.diaSemana, 'horaFim', v)}
                    placeholder="17:00"
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                  />
                </View>
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={[styles.saveBtn, salvando && { opacity: 0.7 }]}
          onPress={handleSalvar}
          disabled={salvando}
        >
          {salvando
            ? <ActivityIndicator size="small" color="#FFF" />
            : <Text style={styles.saveBtnTxt}>Salvar Disponibilidade</Text>}
        </TouchableOpacity>
      </ScrollView>

      <AppModal {...modal} onClose={hideModal} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8F6' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6F8F6' },
  loadingText: { color: '#777', fontSize: 14, marginTop: 10 },
  content: { padding: 16, paddingBottom: 40 },
  hint: { color: '#777', fontSize: 13, lineHeight: 19, marginBottom: 14 },
  card: {
    backgroundColor: '#FFF', borderRadius: 14, padding: 15, marginBottom: 10,
    borderWidth: 1, borderColor: '#E8EAE8',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  diaLabel: { fontSize: 15, fontWeight: '700', color: '#222' },
  horasRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  horaField: { flex: 1 },
  horaLabel: { fontSize: 11, color: '#999', fontWeight: '700', marginBottom: 4, textTransform: 'uppercase' },
  horaInput: {
    borderWidth: 1, borderColor: '#EBEBEB', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: '#FAFAFA', fontSize: 15, color: '#333', textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: '#2E7D32', borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 10,
  },
  saveBtnTxt: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});

export default MedicoDisponibilidadeScreen;

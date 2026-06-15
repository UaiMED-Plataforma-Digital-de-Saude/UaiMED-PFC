import React from 'react';
import { View, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { AgendamentoStackParamList } from './types';

// Importe as telas
import SearchScreen from '../screens/Agendamento/SearchScreen';
import { AvaliacaoScreen } from '../screens/Agendamento/AvaliacaoScreen';
import { HistoricoAvaliacoesScreen } from '../screens/Agendamento/HistoricoAvaliacoesScreen';
import ContatoProfissionalScreen from '../screens/Agendamento/ContatoProfissionalScreen';
import PagamentoScreen from '../screens/Agendamento/PagamentoScreen';
import ResultadosScreen from '../screens/Agendamento/ResultadosScreen';
import MedicoDetalhesScreen from '../screens/Agendamento/MedicoDetalhesScreen';
import SelecaoHorarioScreen from '../screens/Agendamento/SelecaoHorarioScreen';
import SelecaoHorariosDiaScreen from '../screens/Agendamento/SelecaoHorariosDiaScreen';
import ConfirmacaoScreen from '../screens/Agendamento/ConfirmacaoScreen';
import MeusPagamentosScreen from '../screens/Agendamento/MeusPagamentosScreen';
import MinhasConsultasScreen from '../screens/Agendamento/MinhasConsultasScreen';
import ClinicaPerfilScreen from '../screens/Agendamento/ClinicaPerfilScreen';

const Stack = createStackNavigator<AgendamentoStackParamList>();

const AgendamentoStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Busca"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#EEE',
        },
        headerTintColor: '#333',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 17,
          color: '#333',
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="Busca"
        component={SearchScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Resultados"
        component={ResultadosScreen}
        options={{ title: 'Resultados' }}
      />

      <Stack.Screen
        name="DetalhesMedico"
        component={MedicoDetalhesScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="ClinicaPerfil"
        component={ClinicaPerfilScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="SelecaoHorario"
        component={SelecaoHorarioScreen}
        options={{ title: 'Selecione a Data' }}
      />

      <Stack.Screen
        name="SelecaoHorariosDia"
        component={SelecaoHorariosDiaScreen}
        options={({ route }) => ({
          headerTitle: () => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontWeight: '700', fontSize: 16, color: '#333' }}>
                Horários Disponíveis
              </Text>
              {route.params?.displayDate ? (
                <Text style={{ fontSize: 12, color: '#888', marginTop: 1, textTransform: 'capitalize' }}>
                  {route.params.displayDate}
                </Text>
              ) : null}
            </View>
          ),
        })}
      />

      <Stack.Screen
        name="Confirmacao"
        component={ConfirmacaoScreen}
        options={{ title: 'Confirmação' }}
      />

      <Stack.Screen
        name="Pagamento"
        component={PagamentoScreen}
        options={{ title: 'Pagamento' }}
      />

      <Stack.Screen
        name="Avaliacao"
        component={AvaliacaoScreen}
        options={{ title: 'Avalie sua Consulta' }}
      />

      <Stack.Screen
        name="HistoricoAvaliacoes"
        component={HistoricoAvaliacoesScreen}
        options={{ title: 'Meus Feedbacks' }}
      />

      <Stack.Screen
        name="ContatoProfissional"
        component={ContatoProfissionalScreen}
        options={{ title: 'Contato' }}
      />

      <Stack.Screen
        name="MeusPagamentos"
        component={MeusPagamentosScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="MinhasConsultas"
        component={MinhasConsultasScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AgendamentoStack;

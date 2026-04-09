import React from 'react';
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

const Stack = createStackNavigator<AgendamentoStackParamList>();

/**
 * AgendamentoStack
 * Pilha de navegação para o fluxo de agendamento de consultas e avaliações
 */
const AgendamentoStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Busca"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#FFF',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerBackTitle: 'Voltar',
      }}
    >
      <Stack.Screen
        name="Busca"
        component={SearchScreen}
        options={{
          title: 'Nova Consulta',
          headerShown: false, // SearchScreen tem seu próprio layout
        }}
      />
      <Stack.Screen
        name="Avaliacao"
        component={AvaliacaoScreen}
        options={{
          title: 'Avalie sua Consulta',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="HistoricoAvaliacoes"
        component={HistoricoAvaliacoesScreen}
        options={{
          title: 'Meus Feedbacks',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ContatoProfissional"
        component={ContatoProfissionalScreen}
        options={{ title: 'Contato', headerShown: false }}
      />
      <Stack.Screen
        name="Pagamento"
        component={PagamentoScreen}
        options={{ title: 'Pagamento', headerShown: false }}
      />
      {/* TODO: Adicionar as outras telas do fluxo de agendamento */}
      
      <Stack.Screen
        name="Resultados"
        component={ResultadosScreen}
        options={{ title: 'Resultados' }}
      />
      <Stack.Screen
        name="DetalhesMedico"
        component={MedicoDetalhesScreen}
        options={{ title: 'Dados do Médico' }}
      />
      <Stack.Screen
        name="SelecaoHorario"
        component={SelecaoHorarioScreen}
        options={{ title: 'Selecione a Data' }}
      />
      <Stack.Screen
        name="SelecaoHorariosDia"
        component={SelecaoHorariosDiaScreen}
        options={{ title: 'Horários Disponíveis', headerShown: false }}
      />
      <Stack.Screen
        name="Confirmacao"
        component={ConfirmacaoScreen}
        options={{ title: 'Confirmação' }}
      />
     
    </Stack.Navigator>
  );
};

export default AgendamentoStack;

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { CommonActions } from '@react-navigation/native';

// Importe as telas
import HomeScreen from '../screens/Main/HomeScreen';
import AgendamentoStack from './AgendamentoStack';
import PerfilScreen from '../screens/Main/PerfilScreen';
import MedicoAgendaScreen from '../screens/Main/MedicoAgendaScreen';
import ClinicDashboard from '../screens/Admin/ClinicDashboard';

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Oculta um item da bottom tab bar sem removê-lo do navegador.
 * Isso evita o anti-pattern de renderização condicional de <Tab.Screen>,
 * que causava o erro "Maximum update depth exceeded".
 */
const hiddenTab = { display: 'none' as const, width: 0, height: 0, overflow: 'hidden' as const };

/**
 * Navegador Principal com Abas (Bottom Tabs)
 * Diferencia abas conforme `user.tipo` (paciente, medico, clinica)
 */
const MainTabNavigator: React.FC = () => {
  const { user } = useAuth();

  const isPaciente = user?.tipo === 'paciente';
  const isMedico   = user?.tipo === 'medico';
  const isClinica  = user?.tipo === 'clinica';

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          switch (route.name) {
            case 'Home':         iconName = 'home-outline';       break;
            case 'Agendamentos': iconName = 'calendar-outline';   break;
            case 'MedicoAgenda': iconName = 'calendar-outline';   break;
            case 'ClinicDashboard': iconName = 'bar-chart-outline'; break;
            case 'Perfil':       iconName = 'person-outline';     break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabel: route.name,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />

      {/* Paciente: fluxo de agendamento — oculto para outros tipos.
          tabPress listener: ao tocar na aba, reseta o stack para Busca (SearchScreen).
          Navegação programática via atalhos (MinhasConsultas, MeusPagamentos) NÃO
          dispara tabPress, então abre a tela correta normalmente. */}
      <Tab.Screen
        name="Agendamentos"
        component={AgendamentoStack}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            // Navega para Agendamentos e reseta o stack interno para Busca
            navigation.dispatch(
              CommonActions.navigate({
                name: 'Agendamentos',
                params: { screen: 'Busca' },
              })
            );
          },
        })}
        options={{
          title: 'Agendamentos',
          tabBarItemStyle: isPaciente ? undefined : hiddenTab,
        }}
      />

      {/* Médico: agenda específica — oculto para outros tipos */}
      <Tab.Screen
        name="MedicoAgenda"
        component={MedicoAgendaScreen}
        options={{
          title: 'Minha Agenda',
          tabBarItemStyle: isMedico ? undefined : hiddenTab,
        }}
      />

      {/* Clínica: dashboard — oculto para outros tipos */}
      <Tab.Screen
        name="ClinicDashboard"
        component={ClinicDashboard}
        options={{
          title: 'Dashboard',
          tabBarItemStyle: isClinica ? undefined : hiddenTab,
        }}
      />

      {/* Perfil sempre disponível */}
      <Tab.Screen name="Perfil" component={PerfilScreen} options={{ title: 'Meu Perfil' }} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;

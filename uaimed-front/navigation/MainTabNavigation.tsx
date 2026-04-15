import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { CommonActions } from '@react-navigation/native';
import { TouchableOpacity, Alert, View, Image } from 'react-native';

// Importe as telas
import HomeScreen from '../screens/Main/HomeScreen';
import AgendamentoStack from './AgendamentoStack';
import PerfilScreen from '../screens/Main/PerfilScreen';
import MedicoAgendaScreen from '../screens/Main/MedicoAgendaScreen';
import ClinicDashboard from '../screens/Admin/ClinicDashboard';
import HelpScreen from '../screens/Main/HelpScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Oculta um item da bottom tab bar sem removê-lo do navegador.
 */
const hiddenTab = { display: 'none' as const, width: 0, height: 0, overflow: 'hidden' as const };

/**
 * Navegador Principal com Abas (Bottom Tabs)
 * Home agora centralizada no meio da barra.
 */
const MainTabNavigator: React.FC = () => {
  const { user } = useAuth();

  const isPaciente = user?.tipo === 'paciente';
  const isMedico   = user?.tipo === 'medico';
  const isClinica  = user?.tipo === 'clinica';

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route, navigation }) => ({
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#999',
        headerShown: true, // Habilitado para mostrar o botão de ajuda em todas as telas
        headerTitleAlign: 'center',
        headerTitle: () => (
          <Image
            source={require('../assets/logo.png')}
            style={{ width: 100, height: 35 }}
            resizeMode="contain"
          />
        ),
        headerStyle: {
          backgroundColor: '#FFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#EEE',
        },
        headerLeft: () => (
          <TouchableOpacity
            style={{ marginLeft: 16 }}
            onPress={() => {
              // Dispara um evento para abrir o menu na Home
              navigation.navigate('Home', { openMenu: true });
            }}
          >
            <Ionicons name="menu" size={26} color="#333" />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Agendamentos', { screen: 'Busca' });
              }}
            >
              <Ionicons name="search-outline" size={26} color="#333" />
            </TouchableOpacity>
          </View>
        ),
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          switch (route.name) {
            case 'Home':         iconName = 'home';               break; // Home preenchida quando ativa?
            case 'Agendamentos': iconName = 'calendar-outline';   break;
            case 'MedicoAgenda': iconName = 'calendar-outline';   break;
            case 'ClinicDashboard': iconName = 'bar-chart-outline'; break;
            case 'Perfil':       iconName = 'person-outline';     break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabel: route.name === 'Home' ? '' : route.name, // Remove label da home para destaque central
      })}
    >
      {/* Lado Esquerdo: Agendamentos / Agenda */}
      <Tab.Screen
        name="Agendamentos"
        component={AgendamentoStack}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.dispatch(
              CommonActions.navigate({
                name: 'Agendamentos',
                params: { screen: 'Busca' },
              })
            );
          },
        })}
        options={{
          title: 'Consultas',
          tabBarItemStyle: isPaciente ? undefined : hiddenTab,
        }}
      />

      <Tab.Screen
        name="MedicoAgenda"
        component={MedicoAgendaScreen}
        options={{
          title: 'Agenda',
          tabBarItemStyle: isMedico ? undefined : hiddenTab,
        }}
      />

      <Tab.Screen
        name="ClinicDashboard"
        component={ClinicDashboard}
        options={{
          title: 'Gestão',
          tabBarItemStyle: isClinica ? undefined : hiddenTab,
        }}
      />

      {/* CENTRO: HOME */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'UaiMED',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size + 10} color={color} /> // Home maior no meio
          ),
        }}
      />

      {/* Lado Direito: Perfil */}
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{ title: 'Meu Perfil' }}
      />

      <Tab.Screen
        name="Ajuda"
        component={HelpScreen}
        options={{
          title: 'Ajuda e Suporte',
          tabBarItemStyle: hiddenTab,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;

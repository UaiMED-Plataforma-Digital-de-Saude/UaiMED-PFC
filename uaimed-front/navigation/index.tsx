// src/navigation/index.tsx (ATUALIZADO)

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList } from './types';

import AuthNavigator from './AuthStack';
import MainTabNavigator from './MainTabNavigation'; // Corrigido o import
import LgpdConsentGateScreen from '../screens/Auth/LgpdConsentGateScreen';

const RootStack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { signed, loading, user } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  // Conta logada mas sem consentimento LGPD vigente — bloqueia o app até o
  // aceite, sem navegador (mesmo padrão da tela de loading acima). Precisa do
  // próprio SafeAreaProvider: dentro do Navigator ele vem de graça (o stack
  // navigator injeta um), mas essa tela é renderizada fora dele.
  if (signed && user?.precisaConsentimentoLgpd) {
    return (
      <SafeAreaProvider>
        <LgpdConsentGateScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {signed ? (
          // ✅ Se autenticado, mostra o fluxo principal (Main Tabs)
          <RootStack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          // 🔒 Se NÃO autenticado, mostra o fluxo de login/cadastro
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

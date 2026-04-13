import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from './types'; // Importa a tipagem

// Importe suas telas
import LoginScreen from '../screens/Auth/LoginScreen';
import TipoSelecaoScreen from '../screens/Auth/TipoSelecaoScreen';
import CadastroScreen from '../screens/Auth/CadastroScreen';
import RecuperarSenhaScreen from '../screens/Auth/RecuperarSenhaScreen';
import EmailEnviadoScreen from '../screens/Auth/EmailEnviadoScreen';

// Cria o Navigator com a tipagem
const AuthStack = createStackNavigator<AuthStackParamList>();

/**
 * Navegador de Autenticação (Login, Cadastro, Recuperação)
 */
const AuthNavigator: React.FC = () => {
  return (
    <AuthStack.Navigator
      initialRouteName="Login" // A primeira tela a ser exibida
      screenOptions={{
        headerShown: false, // Oculta o cabeçalho padrão em todas as telas
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="TipoSelecao" component={TipoSelecaoScreen} />
      <AuthStack.Screen name="Cadastro" component={CadastroScreen} />
      <AuthStack.Screen name="RecuperarSenha" component={RecuperarSenhaScreen} />
      <AuthStack.Screen name="EmailEnviado" component={EmailEnviadoScreen} />
    </AuthStack.Navigator>
  );
};

export default AuthNavigator;

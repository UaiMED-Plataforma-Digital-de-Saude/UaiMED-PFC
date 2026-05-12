import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ConversasStackParamList } from './types';
import ConversasListaScreen from '../screens/Conversas/ConversasListaScreen';
import ConversaDetalhesScreen from '../screens/Conversas/ConversaDetalhesScreen';

const Stack = createStackNavigator<ConversasStackParamList>();

const ConversasStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ConversasLista" component={ConversasListaScreen} />
      <Stack.Screen name="ConversaDetalhe" component={ConversaDetalhesScreen} />
    </Stack.Navigator>
  );
};

export default ConversasStack;

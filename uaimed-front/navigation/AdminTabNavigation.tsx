import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from './types';
import { useAuth } from '../hooks/useAuth';
import { isArticleAdmin } from '../utils/articleAdmin';
import AdminHomeScreen from '../screens/Admin/AdminHomeScreen';
import AdminPerfilScreen from '../screens/Admin/AdminPerfilScreen';
import AdminArtigosScreen from '../screens/Admin/AdminArtigosScreen';
import AdminDestaquesScreen from '../screens/Admin/AdminDestaquesScreen';
import ArtigoCadastroScreen from '../screens/Admin/ArtigoCadastroScreen';
import ArtigosListaScreen from '../screens/Main/ArtigosListaScreen';
import ArtigoDetalhesScreen from '../screens/Main/ArtigoDetalhesScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const hiddenTab = { display: 'none' as const, width: 0, height: 0, overflow: 'hidden' as const };

const AdminTabNavigator: React.FC = () => {
  const { user } = useAuth();
  if (!isArticleAdmin(user)) return null;

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: '#FFF', borderBottomColor: '#E7ECE8', borderBottomWidth: 1 },
        headerTintColor: '#214B35',
        tabBarActiveTintColor: '#388E3C',
        tabBarInactiveTintColor: '#89958D',
        tabBarIcon: ({ focused, color, size }) => {
          const icon: keyof typeof Ionicons.glyphMap = route.name === 'Home'
            ? focused ? 'grid' : 'grid-outline'
            : route.name === 'AdminArtigos'
              ? focused ? 'newspaper' : 'newspaper-outline'
              : route.name === 'AdminDestaques'
                ? focused ? 'star' : 'star-outline'
                : focused ? 'shield-checkmark' : 'shield-checkmark-outline';
          return <Ionicons name={icon} color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={AdminHomeScreen} options={{ title: 'Administração UaiMED', tabBarLabel: 'Início' }} />
      <Tab.Screen name="AdminArtigos" component={AdminArtigosScreen} options={{ title: 'Administração de artigos', tabBarLabel: 'Artigos' }} />
      <Tab.Screen name="AdminDestaques" component={AdminDestaquesScreen} options={{ title: 'Destaques da home', tabBarLabel: 'Destaques' }} />
      <Tab.Screen name="Perfil" component={AdminPerfilScreen} options={{ title: 'Conta administrativa', tabBarLabel: 'Meu perfil' }} />
      <Tab.Screen
        name="ArtigoCadastro"
        component={ArtigoCadastroScreen}
        options={({ navigation, route }) => ({
          title: route.params?.artigoId ? 'Editar artigo' : 'Novo artigo',
          tabBarItemStyle: hiddenTab,
          headerLeft: () => (
            <TouchableOpacity
              style={{ padding: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Voltar à administração de artigos"
              onPress={() => navigation.navigate('AdminArtigos')}
            >
              <Ionicons name="arrow-back" size={24} color="#214B35" />
            </TouchableOpacity>
          ),
        })}
      />
      <Tab.Screen
        name="Artigos"
        component={ArtigosListaScreen}
        options={({ navigation }) => ({
          title: 'Artigos publicados', tabBarItemStyle: hiddenTab,
          headerLeft: () => (
            <TouchableOpacity style={{ padding: 12 }} accessibilityRole="button" accessibilityLabel="Voltar ao início" onPress={() => navigation.navigate('Home')}>
              <Ionicons name="arrow-back" size={24} color="#214B35" />
            </TouchableOpacity>
          ),
        })}
      />
      <Tab.Screen
        name="ArtigoDetalhes"
        component={ArtigoDetalhesScreen}
        options={({ navigation }) => ({
          title: 'Leitura do artigo', tabBarItemStyle: hiddenTab,
          headerLeft: () => (
            <TouchableOpacity style={{ padding: 12 }} accessibilityRole="button" accessibilityLabel="Voltar aos artigos" onPress={() => navigation.navigate('AdminArtigos')}>
              <Ionicons name="arrow-back" size={24} color="#214B35" />
            </TouchableOpacity>
          ),
        })}
      />
    </Tab.Navigator>
  );
};

export default AdminTabNavigator;

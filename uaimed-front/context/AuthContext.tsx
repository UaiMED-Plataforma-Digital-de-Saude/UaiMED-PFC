import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import uaiMedApi from '../api/uaiMedApi';
import CONFIG from '../config';

// ===== TIPOS E INTERFACES =====

/**
 * Interface para o usuário autenticado
 */
export interface User {
  id: string;
  nome: string;
  email: string;
  cpf?: string;
  cnpj?: string;
  telefone?: string;
  tipo: 'paciente' | 'medico' | 'clinica';
  profissional?: {
    id: string;
    especialidade?: string;
    crm?: string;
  } | null;
}

/**
 * Interface para a resposta da API de login
 */
interface LoginResponse {
  user: User;
  token: string;
}

/**
 * Interface para os dados do contexto de autenticação
 */
export interface AuthContextData {
  user: User | null;
  loading: boolean;
  signed: boolean;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
}

// ===== CONTEXTO =====

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// ===== PROVIDER =====

/**
 * Provider de Autenticação
 * Gerencia o estado de login/logout e persistência de dados
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Efeito para carregar token e usuário armazenados ao iniciar a app
   * Verifica se existe sessão anterior salva no AsyncStorage
   */
  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(CONFIG.STORAGE_KEYS.token);
        const storedUser = await AsyncStorage.getItem(CONFIG.STORAGE_KEYS.user);

        if (storedToken && storedUser) {
          // Se houver token salvo, restaura a sessão
          setUser(JSON.parse(storedUser));
          
          // Configura o header de autorização na API
          uaiMedApi.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error('Erro ao carregar dados do AsyncStorage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStorageData();
  }, []);

  /**
   * Função de Login — estabilizada com useCallback para evitar re-renders desnecessários
   */
  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await uaiMedApi.post<LoginResponse>('/sessions', {
        email,
        password,
      });

      const { user: userData, token: authToken } = response.data;

      setUser(userData);

      await AsyncStorage.setItem(CONFIG.STORAGE_KEYS.token, authToken);
      await AsyncStorage.setItem(CONFIG.STORAGE_KEYS.user, JSON.stringify(userData));

      uaiMedApi.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

    } catch (error: any) {
      let errorMessage = 'Credenciais inválidas ou erro de conexão.';
      let errorDetails = '';

      if (error.response?.status === 401) {
        errorMessage = 'E-mail ou senha incorretos.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Usuário não encontrado.';
      } else if (error.message === 'Network Error' || !error.response) {
        errorMessage = 'Erro de conexão com o servidor.';
        errorDetails = `\n\nDica: Verifique se:\n- Seu backend está rodando\n- A URL em src/config/index.ts está correta\n- Você está na mesma rede\n\nDetalhes: ${error.message}`;
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Servidor recusou a conexão.';
        errorDetails = `\nVerifique se o backend está rodando em ${CONFIG.API.development}`;
      } else if (error.code === 'ENOTFOUND') {
        errorMessage = 'Servidor não encontrado.';
        errorDetails = '\nVerifique a URL em src/config/index.ts';
      }

      Alert.alert('Erro no Login', errorMessage + errorDetails);
      console.error('Erro de login completo:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config?.baseURL,
      });

    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Função de Logout — estabilizada com useCallback
   */
  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(CONFIG.STORAGE_KEYS.token);
      await AsyncStorage.removeItem(CONFIG.STORAGE_KEYS.user);

      setUser(null);

      delete uaiMedApi.defaults.headers.common['Authorization'];

    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }, []);

  // useMemo garante que o objeto de contexto só é recriado quando user/loading muda
  const value = useMemo<AuthContextData>(() => ({
    signed: !!user,
    user,
    loading,
    signIn,
    signOut,
  }), [user, loading, signIn, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

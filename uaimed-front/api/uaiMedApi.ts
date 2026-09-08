import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG, { getApiBaseUrl, logNetwork, logError } from '../config/index';

// 2. Cria a instância do Axios com URL dinâmica
const API_BASE_URL = getApiBaseUrl();
console.log(`🔗 [uaiMedApi] API Base URL configurada: ${API_BASE_URL}`);
console.log(`🌐 [uaiMedApi] Ambiente: ${CONFIG.ENVIRONMENT}`);
console.log(`📋 [uaiMedApi] URLs disponíveis:`, {
  development: CONFIG.API.development,
  android: CONFIG.API.android,
  ios: CONFIG.API.ios,
});

const uaiMedApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Timeout aumentado para 15 segundos
});

// 3. Interceptor de Requisição: Adiciona o Token e atualiza URL se necessário
uaiMedApi.interceptors.request.use(
  async (config) => {
    // Garante que a baseURL está correta (pode ter mudado)
    const currentBaseUrl = getApiBaseUrl();
    if (config.baseURL !== currentBaseUrl) {
      config.baseURL = currentBaseUrl;
      console.log(`🔄 BaseURL atualizada para: ${currentBaseUrl}`);
    }
    
    logNetwork(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    // Busca o token salvo no AsyncStorage
    const token = await AsyncStorage.getItem(CONFIG.STORAGE_KEYS.token);

    // Se o token existir, ele é anexado ao cabeçalho 'Authorization'
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    logError('Erro em requisição:', error);
    return Promise.reject(error);
  }
);

// 4. Interceptor de Resposta (Opcional, mas recomendado para erros)
uaiMedApi.interceptors.response.use(
    (response) => {
        logNetwork(`✅ ${response.status}`, response.data);
        return response;
    },
    (error) => {
        // Log detalhado do erro
        const errorDetails = {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          data: error.response?.data,       // ← corpo do erro do backend
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          fullURL: `${error.config?.baseURL}${error.config?.url}`,
        };
        
        console.error('❌ Erro de rede completo:', errorDetails);
        
        // Tratamento específico para Network Error
        if (error.message === 'Network Error' || error.code === 'NETWORK_ERROR' || !error.response) {
          console.error('🔴 ERRO DE CONEXÃO DETECTADO');
          console.error(`   URL tentada: ${errorDetails.fullURL}`);
          console.error(`   Base URL: ${errorDetails.baseURL}`);
          console.error(`   Verifique se o backend está rodando em: ${errorDetails.baseURL?.replace('/api', '')}`);
          console.error(`   Para Android Simulator, deve ser: http://10.0.2.2:3333/api`);
        }
        
        // Tratamento para token expirado ou inválido (código 401)
        if (error.response && error.response.status === 401) {
            logError('Sessão expirada (401) — limpando credenciais');
            // Limpa token e usuário do storage para forçar novo login
            AsyncStorage.multiRemove([CONFIG.STORAGE_KEYS.token, CONFIG.STORAGE_KEYS.user]).catch(() => {});
        }
        
        logError('Erro em resposta:', errorDetails);
        return Promise.reject(error);
    }
);

export default uaiMedApi;

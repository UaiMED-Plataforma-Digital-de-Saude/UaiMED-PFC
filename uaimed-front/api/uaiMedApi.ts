import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG, { getApiBaseUrl, logNetwork, logError } from '../config/index';
import { emitForceLogout } from './authEvents';

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

// Instância sem interceptors: evita que um 401 na própria chamada de refresh
// dispare outra tentativa de refresh (recursão).
const refreshClient: AxiosInstance = axios.create({ timeout: 15000 });

// Enquanto um refresh está em andamento, outras requisições que caiam em 401
// entram nesta fila em vez de disparar um novo refresh cada uma.
let isRefreshing = false;
let refreshSubscribers: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function subscribeTokenRefresh(resolve: (token: string) => void, reject: (err: unknown) => void) {
  refreshSubscribers.push({ resolve, reject });
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((s) => s.resolve(token));
  refreshSubscribers = [];
}

function onRefreshFailed(err: unknown) {
  refreshSubscribers.forEach((s) => s.reject(err));
  refreshSubscribers = [];
}

async function clearAuthStorage() {
  await AsyncStorage.multiRemove([
    CONFIG.STORAGE_KEYS.token,
    CONFIG.STORAGE_KEYS.refreshToken,
    CONFIG.STORAGE_KEYS.user,
  ]).catch(() => {});
}

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
    async (error) => {
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

        if (error.response && error.response.status === 401) {
            const originalRequest = error.config;

            // Já tentamos renovar uma vez para essa requisição e ainda assim
            // veio 401 — evita loop infinito.
            if (originalRequest?._retry) {
                await clearAuthStorage();
                emitForceLogout();
                logError('Erro em resposta:', errorDetails);
                return Promise.reject(error);
            }

            const refreshToken = await AsyncStorage.getItem(CONFIG.STORAGE_KEYS.refreshToken);

            if (!refreshToken) {
                logError('Sessão expirada (401) — sem refresh token, limpando credenciais');
                await clearAuthStorage();
                emitForceLogout();
                logError('Erro em resposta:', errorDetails);
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            if (isRefreshing) {
                let newToken: string;
                try {
                    newToken = await new Promise<string>((resolve, reject) => {
                        subscribeTokenRefresh(resolve, reject);
                    });
                } catch (refreshError) {
                    return Promise.reject(error);
                }
                // Retry fora do try/catch: se falhar por motivo próprio, o erro
                // real deve propagar em vez de ser confundido com falha de refresh.
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return uaiMedApi(originalRequest);
            }

            isRefreshing = true;
            let newToken: string;
            try {
                const baseURL = getApiBaseUrl();
                const refreshResponse = await refreshClient.post(
                    `${baseURL}${CONFIG.ENDPOINTS.refreshToken}`,
                    { refreshToken }
                );
                newToken = refreshResponse.data.token;

                await AsyncStorage.setItem(CONFIG.STORAGE_KEYS.token, newToken);
                uaiMedApi.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

                isRefreshing = false;
                onRefreshed(newToken);
            } catch (refreshError) {
                isRefreshing = false;
                onRefreshFailed(refreshError);
                logError('Falha ao renovar token — encerrando sessão', refreshError);
                await clearAuthStorage();
                emitForceLogout();
                logError('Erro em resposta:', errorDetails);
                return Promise.reject(error);
            }
            // Retry fora do try/catch — mesmo motivo do branch acima.
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return uaiMedApi(originalRequest);
        }

        logError('Erro em resposta:', errorDetails);
        return Promise.reject(error);
    }
);

export default uaiMedApi;

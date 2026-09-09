/**
 * Configuração Global da Aplicação
 * 
 * Este arquivo centraliza todas as configurações de ambiente
 * para facilitar manutenção e mudanças entre dev/staging/prod
 */

import { Platform } from 'react-native';

export const CONFIG = {
  // ============================================
  // AMBIENTE ATIVO
  // ============================================
  // Altere para: 'development', 'staging', 'production'
  ENVIRONMENT: 'development' as 'development' | 'staging' | 'production',

  // ============================================
  // URLs DA API POR AMBIENTE
  // ============================================
  API: {
    // Desenvolvimento local (navegador/web)
    development: 'http://localhost:3333/api',
    
    // Android Simulator - usa 10.0.2.2 que aponta para localhost da máquina host
    android: 'http://10.0.2.2:3333/api',
    
    // iOS Simulator - pode usar localhost normalmente
    ios: 'http://localhost:3333/api',
    
    // Desenvolvimento remoto (dispositivo físico)
    // Altere para o IP da sua máquina (ipconfig no Windows)
    developmentRemote: 'http://192.168.1.100:3333/api',
    
    // Staging (pré-produção)
    staging: 'https://staging-api.uaimed.com/api',
    
    // Produção
    production: 'https://api.uaimed.com/api',
  },

  // ============================================
  // CONFIGURAÇÕES DE DEBUG
  // ============================================
  DEBUG: {
    // Exibir logs de API?
    enableNetworkLogs: true,
    
    // Exibir detalhes de erros?
    enableErrorDetails: true,
    
    // Simular erros de rede?
    simulateNetworkError: false,
    
    // Delay simulado para requisições (ms)
    networkDelay: 0,
  },

  // ============================================
  // TIMEOUTS
  // ============================================
  TIMEOUTS: {
    apiRequest: 10000,      // 10 segundos para requisição HTTP
    sessionRefresh: 55 * 60 * 1000, // 55 minutos para refresh de token
  },

  // ============================================
  // STORAGE KEYS (AsyncStorage)
  // ============================================
  STORAGE_KEYS: {
    token: '@UaiMED:token',
    refreshToken: '@UaiMED:refreshToken',
    user: '@UaiMED:user',
    theme: '@UaiMED:theme',
    language: '@UaiMED:language',
  },

  // ============================================
  // ENDPOINTS (sufixos após baseURL)
  // ============================================
  ENDPOINTS: {
    // Autenticação
    login: '/sessions',
    refreshToken: '/sessions/refresh',
    signup: '/usuarios',
    recoveryPassword: '/recuperar-senha',
    
    // Contatos
    contacts: '/contatos',
    
    // Pagamentos
    payments: '/pagamentos',
    validateCoupon: '/cupons/validar',
    
    // Avaliações
    ratings: '/avaliacoes',
    ratingsByMedico: (medicoId: string) => `/avaliacoes/medico/${medicoId}`,
    ratingAverage: (medicoId: string) => `/avaliacoes/medico/${medicoId}/media`,
    
    // Agendamentos
    appointments: '/agendamentos',
    
    // Profissionais
    professionals: '/profissionais',
    professionalsBySpecialty: (specialty: string) => `/profissionais?especialidade=${specialty}`,
  },

  // ============================================
  // VALIDAÇÕES
  // ============================================
  VALIDATION: {
    minPasswordLength: 6,
    maxPasswordLength: 128,
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phoneRegex: /^\(?([0-9]{2})\)?[\s.-]?([0-9]{4,5})[\s.-]?([0-9]{4})$/,
    cpfRegex: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  },

  // ============================================
  // CORES DO DESIGN SYSTEM
  // ============================================
  COLORS: {
    primary: '#4CAF50',
    secondary: '#2196F3',
    danger: '#D9534F',
    warning: '#FFC107',
    success: '#5CB85C',
    info: '#5BC0DE',
    light: '#F5F5F5',
    dark: '#333333',
    border: '#EEEEEE',
  },

  // ============================================
  // OUTRAS CONFIGURAÇÕES
  // ============================================
  APP_NAME: 'UaiMED',
  APP_VERSION: '1.0.0',
  SUPPORT_EMAIL: 'suporte@uaimed.com',
};

/**
 * Obtém a URL base da API para o ambiente ativo
 * Detecta automaticamente a plataforma (Android/iOS/Web)
 */
export function getApiBaseUrl(): string {
  const env = CONFIG.ENVIRONMENT;
  
  // Para produção e staging, sempre usa a URL específica
  if (env === 'production') {
    return CONFIG.API.production;
  }
  
  if (env === 'staging') {
    return CONFIG.API.staging;
  }
  
  // Para development, detecta a plataforma
  if (env === 'development') {
    console.log(`📱 Plataforma detectada: ${Platform.OS}`);

    if (Platform.OS === 'android') {
      console.log(`✅ Usando URL Android: ${CONFIG.API.android}`);
      return CONFIG.API.android;
    }

    if (Platform.OS === 'ios') {
      console.log(`✅ Usando URL iOS: ${CONFIG.API.ios}`);
      return CONFIG.API.ios;
    }

    if (Platform.OS === 'web') {
      console.log(`✅ Usando URL Web: ${CONFIG.API.development}`);
      return CONFIG.API.development;
    }

    console.log(`⚠️ Plataforma desconhecida (${Platform.OS}), usando development`);
    return CONFIG.API.development;
  }
  
  // Fallback
  console.log(`⚠️ Ambiente desconhecido, usando development: ${CONFIG.API.development}`);
  return CONFIG.API.development;
}

/**
 * Obtém um endpoint completo (baseURL + endpoint)
 */
export function getEndpoint(endpoint: string): string {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${endpoint}`;
}

/**
 * Helper para logs de API (respeita DEBUG.enableNetworkLogs)
 */
export function logNetwork(message: string, data?: any): void {
  if (CONFIG.DEBUG.enableNetworkLogs) {
    console.log(`📡 [${new Date().toLocaleTimeString()}] ${message}`, data || '');
  }
}

/**
 * Helper para logs de erro (respeita DEBUG.enableErrorDetails)
 */
export function logError(message: string, error?: any): void {
  if (CONFIG.DEBUG.enableErrorDetails) {
    console.error(`❌ [${new Date().toLocaleTimeString()}] ${message}`, error || '');
  }
}

export default CONFIG;

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Armazena os tokens de sessão (JWT) no Keychain/Keystore nativo em vez de
 * AsyncStorage (texto puro em disco) — recomendado pra um app de saúde.
 * expo-secure-store não tem implementação web (não existe Keychain/Keystore
 * no navegador), então cai pra AsyncStorage nesse caso.
 */
const useSecureStore = Platform.OS !== 'web';

// SecureStore só aceita chaves em [A-Za-z0-9.\-_] — por isso são chaves
// próprias, diferentes das usadas no AsyncStorage (CONFIG.STORAGE_KEYS).
export const SECURE_STORAGE_KEYS = {
  token: 'uaimed_token',
  refreshToken: 'uaimed_refresh_token',
} as const;

export async function getSecureItem(key: string): Promise<string | null> {
  return useSecureStore ? SecureStore.getItemAsync(key) : AsyncStorage.getItem(key);
}

export async function setSecureItem(key: string, value: string): Promise<void> {
  if (useSecureStore) await SecureStore.setItemAsync(key, value);
  else await AsyncStorage.setItem(key, value);
}

export async function removeSecureItem(key: string): Promise<void> {
  if (useSecureStore) await SecureStore.deleteItemAsync(key);
  else await AsyncStorage.removeItem(key);
}

import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AppNavigator from './navigation';
import { AuthProvider } from './context/AuthContext';


/**
 * Detecta se o app está rodando no Expo Go.
 * Push notifications remotas foram removidas do Expo Go no SDK 53+.
 * Use um development build para ativá-las.
 */
const isExpoGo =
  (Constants.appOwnership === 'expo') ||
  ((Constants as any).executionEnvironment === 'storeClient');

/**
 * Configura o handler global de notificações LOCAIS.
 * Isso funciona tanto no Expo Go quanto em development/production builds.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const App: React.FC = () => {
  useEffect(() => {
    const setupNotifications = async () => {
      // Canal Android — funciona para notificações locais mesmo no Expo Go
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }

      // Push notifications remotas só funcionam em development build ou production
      if (isExpoGo) {
        console.info(
          '[Notifications] Expo Go detectado — push notifications remotas desabilitadas.\n' +
          'Use um development build para ativar notificações completas.\n' +
          'Saiba mais: https://docs.expo.dev/develop/development-builds/introduction/'
        );
        return;
      }

      // Em desenvolvimento ou produção, solicita permissão de push
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.warn('[Notifications] Permissão de notificação negada pelo usuário.');
        }
      } catch (e) {
        console.warn('[Notifications] Erro ao solicitar permissão:', e);
      }
    };

    setupNotifications();
  }, []);

  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
};

export default App;

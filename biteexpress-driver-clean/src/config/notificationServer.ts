import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Configuração do servidor de notificações
 * 
 * A URL do servidor pode ser configurada dinamicamente:
 * 1. Via variável de ambiente EXPO_PUBLIC_NOTIFICATION_SERVER_URL
 * 2. Via AsyncStorage (chave: 'notification_server_url')
 * 3. Valor padrão (fallback)
 */

// Valor padrão (fallback) - pode ser alterado aqui ou via variável de ambiente
// NOTA: Configure o IP do servidor na tela de Perfil > Servidor de Notificações
// Para emulador Android, use: http://10.0.2.2:3000
// Para dispositivo físico, use o IP do computador (ex: http://10.7.1.144:3000)
const DEFAULT_SERVER_URL = __DEV__
  ? 'http://10.0.2.2:3000' // Emulador Android (padrão)
  : 'http://192.168.1.100:3000'; // APK - Configure na app ou altere aqui

// Chave para guardar no AsyncStorage
const STORAGE_KEY = 'notification_server_url';

/**
 * Obtém a URL do servidor de notificações
 * Prioridade: Variável de ambiente > AsyncStorage > Valor padrão
 * 
 * NOTA: O servidor já sabe seu próprio IP e o expõe no endpoint /discover
 * A app não precisa descobrir IPs - apenas usa a URL configurada
 */
export const getNotificationServerUrl = async (): Promise<string> => {
  // 1. Verifica variável de ambiente (mais prioritária)
  if (process.env.EXPO_PUBLIC_NOTIFICATION_SERVER_URL) {
    const url = process.env.EXPO_PUBLIC_NOTIFICATION_SERVER_URL;
    console.log(`📡 Usando URL de variável de ambiente: ${url}`);
    return url;
  }

  // 2. Tenta ler do AsyncStorage
  try {
    const storedUrl = await AsyncStorage.getItem(STORAGE_KEY);
    if (storedUrl) {
      console.log(`📡 Usando URL do AsyncStorage: ${storedUrl}`);
      return storedUrl;
    }
  } catch (error) {
    console.warn('Erro ao ler URL do servidor do AsyncStorage:', error);
  }

  // 3. Usa valor padrão
  console.log(`📡 Usando URL padrão: ${DEFAULT_SERVER_URL}`);
  console.log(`⚠️ NOTA: Se estiver no Expo Go em dispositivo físico, precisa configurar o IP do computador!`);
  return DEFAULT_SERVER_URL;
};

/**
 * Define a URL do servidor de notificações
 * 
 * Para descobrir o IP do servidor:
 * 1. Inicie o servidor (ele mostra o IP na consola)
 * 2. Ou acesse http://SEU_IP:3000/discover no navegador
 * 3. Use esse IP aqui
 */
export const setNotificationServerUrl = async (url: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, url);
  } catch (error) {
    console.error('Erro ao guardar URL do servidor:', error);
    throw error;
  }
};

// Para compatibilidade com código existente (usa valor padrão inicialmente)
// O código que usa NOTIFICATION_SERVER_URL deve ser atualizado para usar getNotificationServerUrl()
export const NOTIFICATION_SERVER_URL = DEFAULT_SERVER_URL;

// Intervalo de polling em milissegundos (2 segundos)
export const POLLING_INTERVAL = 2000;


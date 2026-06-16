import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'control_server_url';

const DEFAULT_SERVER_URL = __DEV__
  ? 'http://10.0.2.2:3000'
  : 'http://192.168.1.100:3000';

export async function getServerUrl(): Promise<string> {
  const env = process.env.EXPO_PUBLIC_NOTIFICATION_SERVER_URL;
  if (env) return env;

  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
  } catch (error) {
    console.warn('Erro ao ler URL do servidor:', error);
  }

  return DEFAULT_SERVER_URL;
}

export async function setServerUrl(url: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, url);
}

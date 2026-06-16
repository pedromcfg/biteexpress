import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { io } from 'socket.io-client';
import { SOCKET_NOTIFICATION_EVENT } from '@biteexpress/shared';
import { getServerUrl, setServerUrl } from '@config/notificationServer';
import {
  fetchCues,
  fetchDiscover,
  fetchMessages,
  resetCues,
  sendCue,
  sendCustomMessage,
  sendMessageIndex
} from '@api/serverApi';

/** Aceita IP local com porta (http://10.0.0.1:3000) ou URL cloud (https://app.up.railway.app). */
const SERVER_URL_PATTERN = /^https?:\/\/[\w.-]+(:\d+)?(\/.*)?$/;

export default function App() {
  const [serverUrl, setServerUrlState] = useState('');
  const [draftServerUrl, setDraftServerUrl] = useState('');
  const [discoverText, setDiscoverText] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [cueEntries, setCueEntries] = useState<[string, { body?: string }][]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [socketStatus, setSocketStatus] = useState('desligado');
  const [lastEvent, setLastEvent] = useState('sem eventos');

  const canSend = useMemo(() => SERVER_URL_PATTERN.test(serverUrl), [serverUrl]);

  const refreshMetadata = async (url: string) => {
    const [msgs, cues, discover] = await Promise.all([
      fetchMessages(url),
      fetchCues(url),
      fetchDiscover(url)
    ]);
    setMessages(msgs);
    setCueEntries(Object.entries(cues));
    setDiscoverText(`${discover.url} (${discover.ip})`);
  };

  useEffect(() => {
    const bootstrap = async () => {
      const url = await getServerUrl();
      setServerUrlState(url);
      setDraftServerUrl(url);
      try {
        await refreshMetadata(url);
      } catch (error) {
        console.warn(error);
      }
    };
    void bootstrap();
  }, []);

  useEffect(() => {
    if (!canSend) return;

    const socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true
    });

    socket.on('connect', () => {
      setSocketStatus('ligado');
    });

    socket.on('disconnect', () => {
      setSocketStatus('desligado');
    });

    socket.on(SOCKET_NOTIFICATION_EVENT, (payload: unknown) => {
      try {
        const text =
          typeof payload === 'object' && payload && 'cueKey' in payload
            ? String((payload as { cueKey?: unknown }).cueKey || 'evento')
            : 'evento';
        setLastEvent(`recebido: ${text}`);
      } catch {
        setLastEvent('recebido: evento');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [serverUrl, canSend]);

  const withBusy = async (fn: () => Promise<void>, successLabel: string) => {
    if (!canSend) {
      Alert.alert('Servidor inválido', 'Configura primeiro a URL do servidor.');
      return;
    }
    setBusy(true);
    try {
      await fn();
      setLastEvent(successLabel);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      Alert.alert('Erro', message);
    } finally {
      setBusy(false);
    }
  };

  const saveServer = async () => {
    const value = draftServerUrl.trim();
    if (!SERVER_URL_PATTERN.test(value)) {
      Alert.alert(
        'Formato inválido',
        'Local: http://192.168.1.45:3000\nCloud: https://o-teu-servidor.up.railway.app'
      );
      return;
    }
    await setServerUrl(value);
    setServerUrlState(value);
    await withBusy(() => refreshMetadata(value), 'metadados atualizados');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>BiteExpress Control</Text>
        <Text style={styles.subtitle}>App Android para disparar cues para a app Driver.</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Servidor</Text>
          <TextInput
            style={styles.input}
            value={draftServerUrl}
            onChangeText={setDraftServerUrl}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="http://192.168.1.45:3000"
            placeholderTextColor="#6B7280"
          />
          <Pressable style={styles.primaryButton} onPress={() => void saveServer()} disabled={busy}>
            <Text style={styles.buttonText}>Guardar URL e atualizar</Text>
          </Pressable>
          <Text style={styles.meta}>Atual: {serverUrl || 'não definido'}</Text>
          <Text style={styles.meta}>Discover: {discoverText || 'indisponível'}</Text>
          <Text style={styles.meta}>Socket: {socketStatus}</Text>
          <Text style={styles.meta}>Último: {lastEvent}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mensagem custom</Text>
          <TextInput
            style={styles.input}
            value={customMessage}
            onChangeText={setCustomMessage}
            placeholder="Escreve uma mensagem para a app driver"
            placeholderTextColor="#6B7280"
          />
          <Pressable
            style={styles.primaryButton}
            disabled={busy || !customMessage.trim()}
            onPress={() =>
              void withBusy(async () => {
                await sendCustomMessage(serverUrl, customMessage.trim());
                setCustomMessage('');
              }, 'mensagem custom enviada')
            }
          >
            <Text style={styles.buttonText}>Enviar mensagem custom</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mensagens pré-definidas</Text>
          {messages.map((message, index) => (
            <Pressable
              key={`${index}-${message}`}
              style={styles.secondaryButton}
              disabled={busy}
              onPress={() =>
                void withBusy(() => sendMessageIndex(serverUrl, index), `mensagem ${index} enviada`)
              }
            >
              <Text style={styles.secondaryButtonText}>{message}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Cues do guião</Text>
          {cueEntries.map(([cueKey, cue]) => (
            <Pressable
              key={cueKey}
              style={styles.secondaryButton}
              disabled={busy}
              onPress={() => void withBusy(() => sendCue(serverUrl, cueKey), `cue ${cueKey} enviada`)}
            >
              <Text style={styles.secondaryButtonText}>
                {cueKey} {cue.body ? `- ${cue.body}` : ''}
              </Text>
            </Pressable>
          ))}

          <Pressable
            style={[styles.primaryButton, styles.dangerButton]}
            disabled={busy}
            onPress={() => void withBusy(() => resetCues(serverUrl), 'reset enviado')}
          >
            <Text style={styles.buttonText}>Reset cues (novo take)</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#020617'
  },
  container: {
    padding: 16,
    gap: 12
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700'
  },
  subtitle: {
    color: '#94A3B8',
    marginBottom: 8
  },
  card: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    gap: 8
  },
  sectionTitle: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600'
  },
  input: {
    backgroundColor: '#111827',
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10
  },
  dangerButton: {
    backgroundColor: '#DC2626'
  },
  secondaryButton: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 10
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  secondaryButtonText: {
    color: '#E2E8F0'
  },
  meta: {
    color: '#94A3B8',
    fontSize: 12
  }
});

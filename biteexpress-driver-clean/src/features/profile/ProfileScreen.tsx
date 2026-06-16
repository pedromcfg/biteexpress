import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Modal, StyleSheet } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@features/auth/AuthContext';
import { useAppState } from '@store/AppStateContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getNotificationServerUrl, setNotificationServerUrl } from '@config/notificationServer';

/** Aceita IP local com porta (http://10.0.0.1:3000) ou URL cloud (https://app.up.railway.app). */
const SERVER_URL_PATTERN = /^https?:\/\/[\w.-]+(:\d+)?(\/.*)?$/;

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const { online, orders } = useAppState();
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [serverUrl, setServerUrl] = useState('');
  const [currentServerUrl, setCurrentServerUrl] = useState('');

  const discoverQuery = useQuery({
    queryKey: ['discover', currentServerUrl] as const,
    queryFn: async () => {
      const base = currentServerUrl.trim().replace(/\/$/, '');
      const response = await fetch(`${base}/discover`);
      if (!response.ok) {
        throw new Error(`discover ${response.status}`);
      }
      const json: unknown = await response.json();
      if (
        !json ||
        typeof json !== 'object' ||
        typeof (json as { url?: unknown }).url !== 'string' ||
        typeof (json as { ip?: unknown }).ip !== 'string'
      ) {
        throw new Error('discover formato inválido');
      }
      const { url, ip } = json as { url: string; ip: string };
      return { url, ip };
    },
    enabled: showServerConfig && SERVER_URL_PATTERN.test(currentServerUrl.trim()),
    staleTime: 15_000
  });

  const totalDelivered = orders.filter((o) => o.status === 'delivered').length + 128;
  const acceptanceRate = 96;
  const rating = 4.9;

  // Carrega o IP atual do servidor
  useEffect(() => {
    const loadCurrentUrl = async () => {
      const url = await getNotificationServerUrl();
      setCurrentServerUrl(url);
    };
    loadCurrentUrl();
  }, []);

  const handleSaveServerUrl = async () => {
    if (!serverUrl.trim()) {
      Alert.alert('Erro', 'Por favor, insira o IP do servidor');
      return;
    }

    // Valida formato básico: aceita IP local (http://IP:3000) ou URL cloud (https://app.up.railway.app)
    if (!SERVER_URL_PATTERN.test(serverUrl.trim())) {
      Alert.alert(
        'Erro',
        'Formato inválido.\nLocal: http://10.7.1.144:3000\nCloud: https://o-teu-servidor.up.railway.app'
      );
      return;
    }

    try {
      await setNotificationServerUrl(serverUrl.trim());
      setCurrentServerUrl(serverUrl.trim());
      await queryClient.invalidateQueries({ queryKey: ['notifications', 'fallback'] });
      await queryClient.invalidateQueries({ queryKey: ['discover'] });
      setShowServerConfig(false);
      setServerUrl('');
      Alert.alert('Sucesso', 'IP do servidor configurado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível guardar a configuração');
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#020617', paddingTop: 40 }}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '600' }}>
          Perfil do condutor
        </Text>
        <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>
          Vê as tuas métricas, configurações e encerra a sessão.
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#020617',
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: '#1F2937'
          }}
        >
          <View
            style={{
              height: 48,
              width: 48,
              borderRadius: 999,
              backgroundColor: 'rgba(34,197,94,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12
            }}
          >
            <MaterialCommunityIcons name="account" size={26} color="#22C55E" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>
              {user?.name ?? 'Condutor BiteExpress'}
            </Text>
            <Text style={{ color: '#9CA3AF', fontSize: 12 }}>{user?.email}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <View
                style={{
                  height: 6,
                  width: 6,
                  borderRadius: 999,
                  marginRight: 8,
                  backgroundColor: online ? '#34D399' : '#6B7280'
                }}
              />
              <Text style={{ fontSize: 11, color: '#D1D5DB' }}>
                {online ? 'Online para receber pedidos' : 'Offline no momento'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
        <Text style={{ color: '#D1D5DB', fontSize: 12, marginBottom: 8 }}>As tuas métricas</Text>

        <View style={{ flexDirection: 'row' }}>
          <View
            style={{
              flex: 1,
              backgroundColor: '#020617',
              borderRadius: 16,
              padding: 16,
              marginRight: 8,
              borderWidth: 1,
              borderColor: '#1F2937'
            }}
          >
            <Text style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 4 }}>
              Avaliação média
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="star" size={18} color="#FACC15" />
              <Text
                style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '600', marginLeft: 4 }}
              >
                {rating.toFixed(1)}
              </Text>
            </View>
            <Text style={{ color: '#6B7280', fontSize: 11, marginTop: 4 }}>
              Baseado nas últimas entregas
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: '#020617',
              borderRadius: 16,
              padding: 16,
              marginLeft: 8,
              borderWidth: 1,
              borderColor: '#1F2937'
            }}
          >
            <Text style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 4 }}>
              Entregas concluídas
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '600' }}>
              {totalDelivered}
            </Text>
            <Text style={{ color: '#6B7280', fontSize: 11, marginTop: 4 }}>
              Desde o início na plataforma
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: '#020617',
              borderRadius: 16,
              padding: 16,
              marginRight: 8,
              borderWidth: 1,
              borderColor: '#1F2937'
            }}
          >
            <Text style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 4 }}>
              Taxa de aceitação
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '600' }}>
              {acceptanceRate}%
            </Text>
            <Text style={{ color: '#6B7280', fontSize: 11, marginTop: 4 }}>
              Mantenha acima de 85% para boas oportunidades.
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: '#020617',
              borderRadius: 16,
              padding: 16,
              marginLeft: 8,
              borderWidth: 1,
              borderColor: '#1F2937'
            }}
          >
            <Text style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 4 }}>
              Tempo médio por entrega
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '600' }}>23 min</Text>
            <Text style={{ color: '#6B7280', fontSize: 11, marginTop: 4 }}>Últimos 7 dias</Text>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
        <Text style={{ color: '#D1D5DB', fontSize: 12, marginBottom: 8 }}>
          Configurações rápidas
        </Text>

        <View
          style={{
            backgroundColor: '#020617',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#1F2937'
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: '#1F2937'
            }}
          >
            <MaterialCommunityIcons name="bell-ring-outline" size={20} color="#E5E7EB" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 14 }}>Notificações</Text>
              <Text style={{ color: '#6B7280', fontSize: 11 }}>
                Sons, alertas de atraso e lembretes de pedidos.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: '#1F2937'
            }}
          >
            <MaterialCommunityIcons name="shield-check-outline" size={20} color="#E5E7EB" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 14 }}>Segurança</Text>
              <Text style={{ color: '#6B7280', fontSize: 11 }}>
                Dicas de entrega segura e suporte em situações de risco.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12
            }}
          >
            <MaterialCommunityIcons name="cog-outline" size={20} color="#E5E7EB" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 14 }}>Preferências da conta</Text>
              <Text style={{ color: '#6B7280', fontSize: 11 }}>
                Idioma, forma de recebimento e dados pessoais.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setServerUrl(currentServerUrl);
              setShowServerConfig(true);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginTop: 8
            }}
          >
            <MaterialCommunityIcons name="server-network" size={20} color="#E5E7EB" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 14 }}>Servidor de Notificações</Text>
              <Text style={{ color: '#6B7280', fontSize: 11 }} numberOfLines={1}>
                {currentServerUrl || 'Não configurado'}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
        <TouchableOpacity
          onPress={logout}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#DC2626',
            borderRadius: 16,
            paddingVertical: 12
          }}
        >
          <MaterialCommunityIcons name="logout" size={18} color="#FEF2F2" />
          <Text
            style={{
              color: '#FFFFFF',
              fontWeight: '600',
              fontSize: 14,
              marginLeft: 8
            }}
          >
            Sair da conta
          </Text>
        </TouchableOpacity>

        <Text
          style={{
            color: '#4B5563',
            fontSize: 11,
            textAlign: 'center',
            marginTop: 12
          }}
        >
          Versão 1.0 • BiteExpress Driver
        </Text>
      </View>

      {/* Modal de configuração do servidor */}
      <Modal
        visible={showServerConfig}
        transparent
        animationType="slide"
        onRequestClose={() => setShowServerConfig(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Configurar Servidor</Text>
            <Text style={styles.modalSubtitle}>
              Insira o IP do computador onde o servidor está a rodar
            </Text>
            <Text style={styles.modalHint}>
              O servidor mostra o IP na consola quando inicia
            </Text>

            {discoverQuery.isFetching ? (
              <Text style={[styles.modalHint, { marginTop: 4 }]}>A verificar /discover…</Text>
            ) : null}
            {discoverQuery.data ? (
              <Text style={[styles.modalHint, { marginTop: 4, color: '#86EFAC' }]}>
                Servidor: {discoverQuery.data.url}
              </Text>
            ) : null}
            {discoverQuery.isError ? (
              <Text style={[styles.modalHint, { marginTop: 4, color: '#FCA5A5' }]}>
                Não foi possível ler /discover neste URL.
              </Text>
            ) : null}

            <TextInput
              style={styles.input}
              placeholder="http://10.7.1.144:3000"
              placeholderTextColor="#6B7280"
              value={serverUrl}
              onChangeText={setServerUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setShowServerConfig(false);
                  setServerUrl('');
                }}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveServerUrl}
                style={[styles.modalButton, styles.saveButton]}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8
  },
  modalSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 4
  },
  modalHint: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 20,
    fontStyle: 'italic'
  },
  input: {
    backgroundColor: '#020617',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#374151',
    fontSize: 14,
    marginBottom: 20
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4B5563'
  },
  saveButton: {
    backgroundColor: '#16A34A'
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14
  }
});



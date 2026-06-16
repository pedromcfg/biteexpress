import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { useAuth } from './AuthContext';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('driver@biteexpress.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    try {
      setLoading(true);
      await login(email.trim(), password);
    } catch (e: any) {
      setError(e.message || 'Erro ao iniciar sessão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#020617', paddingHorizontal: 24 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'stretch' }}>
        <View
          style={{
            alignItems: 'center',
            marginBottom: 24
          }}
        >
          <Image
            source={require('../../logo/logo.png')}
            style={{
              width: 120,
              height: 120,
              marginBottom: 12,
              resizeMode: 'contain'
            }}
          />
          <Text style={{ fontSize: 24, fontWeight: '600', color: '#ffffff', marginBottom: 4 }}>
            BiteExpress Driver
          </Text>
        </View>
        <Text style={{ color: '#9CA3AF', marginBottom: 24, textAlign: 'center' }}>
          Entra para começar a entregar com segurança.
        </Text>

        <View style={{ gap: 16 }}>
          <View>
            <Text style={{ color: '#D1D5DB', marginBottom: 4 }}>Email</Text>
            <TextInput
              style={{
                backgroundColor: '#020617',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 10,
                color: '#ffffff',
                borderWidth: 1,
                borderColor: '#1F2937'
              }}
              placeholder="seu@email.com"
              placeholderTextColor="#6B7280"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View>
            <Text style={{ color: '#D1D5DB', marginBottom: 4 }}>Senha</Text>
            <TextInput
              style={{
                backgroundColor: '#020617',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 10,
                color: '#ffffff',
                borderWidth: 1,
                borderColor: '#1F2937'
              }}
              placeholder="••••••••"
              placeholderTextColor="#6B7280"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {error && <Text style={{ color: '#F87171', marginTop: 8 }}>{error}</Text>}

          <TouchableOpacity
            disabled={loading}
            onPress={onSubmit}
            style={{
              marginTop: 16,
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: loading ? '#15803D' : '#16A34A'
            }}
          >
            <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 16 }}>
              {loading ? 'A entrar...' : 'Entrar como condutor'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

    </KeyboardAvoidingView>
  );
};



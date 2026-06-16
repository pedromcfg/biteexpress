# Configuração Dinâmica do Servidor de Notificações

A URL do servidor de notificações agora é **dinâmica** e pode ser configurada de 3 formas:

## 📦 Instalação

Primeiro, instale o AsyncStorage:
```bash
npm install @react-native-async-storage/async-storage
```

## 🔧 Formas de Configurar

### 1. Variável de Ambiente (Recomendado)

Crie um arquivo `.env` na raiz do projeto:
```
EXPO_PUBLIC_NOTIFICATION_SERVER_URL=http://192.168.1.78:3000
```

**Vantagens:**
- Não precisa alterar código
- Fácil de mudar entre ambientes
- Funciona em desenvolvimento e produção

### 2. AsyncStorage (Dinâmico na App)

No código da app, você pode definir o IP programaticamente:

```typescript
import { setNotificationServerUrl } from '@config/notificationServer';

// Definir o IP (ex: numa tela de configurações)
await setNotificationServerUrl('http://192.168.1.78:3000');
```

**Vantagens:**
- Pode criar uma tela de configurações na app
- O usuário pode mudar o IP sem reinstalar
- Persiste entre sessões

### 3. Valor Padrão (Fallback)

Se nenhuma das opções acima for usada, será usado o valor padrão definido em `notificationServer.ts`:

```typescript
const DEFAULT_SERVER_URL = __DEV__
  ? 'http://10.0.2.2:3000' // Emulador Android
  : 'http://192.168.1.78:3000'; // Dispositivo físico
```

## 📊 Prioridade

A ordem de prioridade é:
1. **Variável de ambiente** (mais prioritária)
2. **AsyncStorage** (se não houver variável de ambiente)
3. **Valor padrão** (fallback)

## 💡 Exemplo de Uso

```typescript
import { getNotificationServerUrl } from '@config/notificationServer';

// Obter a URL atual
const serverUrl = await getNotificationServerUrl();
console.log('Servidor:', serverUrl); // http://192.168.1.78:3000

// Definir nova URL
import { setNotificationServerUrl } from '@config/notificationServer';
await setNotificationServerUrl('http://192.168.1.100:3000');
```

## 🎯 Para o Filme

Para o filme, recomendo usar a **variável de ambiente**:
1. Crie um arquivo `.env` com o IP do computador
2. A app vai usar automaticamente
3. Se mudar de rede, só precisa atualizar o `.env`



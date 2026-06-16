/**
 * EXEMPLO: Como usar a configuração dinâmica do servidor
 * 
 * Este arquivo mostra as diferentes formas de configurar a URL do servidor
 */

// ============================================
// OPÇÃO 1: Variável de ambiente (mais simples)
// ============================================
// Crie um arquivo .env na raiz do projeto:
// EXPO_PUBLIC_NOTIFICATION_SERVER_URL=http://192.168.1.78:3000
//
// A app vai usar automaticamente este valor

// ============================================
// OPÇÃO 2: AsyncStorage (dinâmico na app)
// ============================================
// No código da app, você pode definir o IP:
/*
import { setNotificationServerUrl } from '@config/notificationServer';

// Definir o IP
await setNotificationServerUrl('http://192.168.1.78:3000');
*/

// ============================================
// OPÇÃO 3: Valor padrão (fallback)
// ============================================
// Se nenhuma das opções acima for usada,
// será usado o valor padrão definido em notificationServer.ts



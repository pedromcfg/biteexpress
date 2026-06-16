# Descoberta Automática do Servidor

O sistema agora suporta **descoberta automática** do servidor na rede local!

## 🎯 Como Funciona

1. **Servidor anuncia-se via mDNS** (Bonjour) quando inicia
2. **App descobre automaticamente** o servidor tentando IPs comuns
3. **Não precisa configurar IP manualmente** - funciona em qualquer rede!

## 🚀 Como Usar

### 1. Instalar dependências do servidor

```bash
cd notification-server
npm install
```

### 2. Iniciar o servidor

```bash
npm start
```

O servidor vai:
- Mostrar o IP atual na consola
- Anunciar-se na rede via mDNS
- Estar pronto para ser descoberto pela app

### 3. Na App

A app vai **automaticamente**:
1. Tentar descobrir o servidor na rede
2. Guardar o IP encontrado
3. Usar esse IP para todas as requisições

**Não precisa fazer nada!** A app descobre sozinha.

## 📱 Funciona em Qualquer Rede

- ✅ Wi-Fi doméstico
- ✅ Hotspot do telemóvel
- ✅ Rede da escola/empresa
- ✅ Qualquer rede onde ambos estejam conectados

## 🔧 Se Não Descobrir Automaticamente

Se a descoberta automática não funcionar:

1. **Ver o IP no servidor**: Quando inicia, o servidor mostra o IP
2. **Configurar manualmente**: Use `setNotificationServerUrl()` no código
3. **Ou usar variável de ambiente**: `EXPO_PUBLIC_NOTIFICATION_SERVER_URL`

## 💡 Dicas

- A primeira descoberta pode demorar alguns segundos
- O IP descoberto é guardado e reutilizado
- Se mudar de rede, a app tenta descobrir novamente
- O servidor mostra sempre o IP atual na consola


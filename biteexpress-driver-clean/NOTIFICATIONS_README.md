# Sistema de Notificações - Bite Express Driver

Este sistema permite disparar notificações na app Android a partir de outro dispositivo na mesma rede Wi-Fi.

## 📋 Pré-requisitos

1. Ambos os dispositivos (computador e Android) devem estar na **mesma rede Wi-Fi**
2. Node.js instalado no computador
3. App Android rodando (físico ou emulador)

## 🚀 Como usar

### Passo 1: Configurar o servidor

1. Abra um terminal na pasta `notification-server`:
```bash
cd notification-server
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor:
```bash
npm start
```

O servidor irá rodar em `http://localhost:3000`

### Passo 2: Descobrir o IP do computador

**Windows:**
1. Abra PowerShell
2. Digite: `ipconfig`
3. Procure por "IPv4 Address" na seção da sua rede Wi-Fi
   - Exemplo: `192.168.1.100`

**Mac/Linux:**
1. Abra Terminal
2. Digite: `ifconfig` ou `ip addr`
3. Procure o IP da interface Wi-Fi (geralmente `wlan0` ou `en0`)

### Passo 3: Configurar o IP no app Android

1. Abra o arquivo: `biteexpress-driver-clean/src/config/notificationServer.ts`

2. Altere a linha com o IP do servidor:
```typescript
export const NOTIFICATION_SERVER_URL = __DEV__
  ? 'http://10.0.2.2:3000' // Emulador Android (padrão)
  : 'http://SEU_IP_AQUI:3000'; // ALTERE PARA O IP DO SEU COMPUTADOR
```

**Importante:**
- Se estiver usando **emulador Android**, use: `http://10.0.2.2:3000`
- Se estiver usando **dispositivo físico**, use o IP do seu computador (ex: `http://192.168.1.100:3000`)

### Passo 4: Abrir interface web

No navegador do computador, abra:
```
http://localhost:3000
```

Ou de outro dispositivo na mesma rede:
```
http://SEU_IP:3000
```

### Passo 5: Disparar notificações

Na interface web, clique em qualquer uma das 3 mensagens pré-definidas:

1. "Tens que te apressar, o teu ritmo está muito lento!"
2. "Os teus clientes estão a passar fome!"
3. "Não serves para isto!"

## 🎬 O que acontece na app

Quando uma notificação é disparada:

1. **Após 1 segundo**: Aparece um emoji 👎 (thumbsdown) vermelho no mapa, próximo à posição do condutor
2. **Imediatamente**: Aparece um modal grande ocupando quase todo o ecrã com a mensagem
3. **Após mais 1 segundo**: O emoji desaparece (total de 2 segundos visível)
4. **Usuário clica "Ok"**: O modal fecha

## 🔧 Resolução de problemas

### App não recebe notificações

1. **Verifique se o servidor está rodando:**
   - Acesse `http://localhost:3000` no navegador
   - Deve aparecer a interface web

2. **Verifique o IP configurado:**
   - Confirme que o IP no arquivo `notificationServer.ts` está correto
   - Para dispositivo físico, use o IP real do computador
   - Para emulador, use `10.0.2.2`

3. **Verifique se estão na mesma rede:**
   - Ambos devem estar conectados à mesma Wi-Fi
   - Teste acessando `http://SEU_IP:3000` no navegador do Android

4. **Firewall:**
   - Certifique-se de que o firewall do Windows permite conexões na porta 3000
   - Pode ser necessário adicionar uma exceção

### Servidor não inicia

1. Verifique se a porta 3000 está livre:
   - Feche outros programas que possam estar usando a porta
   - Ou altere a porta no `server.js` (linha `const PORT = 3000`)

### Emoji não aparece

- O emoji só aparece se o app conseguir obter a localização do GPS
- Verifique se as permissões de localização estão ativas

## 📁 Estrutura de arquivos

```
notification-server/
├── server.js              # Servidor Express
├── package.json           # Dependências
├── public/
│   └── index.html        # Interface web
└── README.md             # Documentação do servidor

biteexpress-driver-clean/
├── src/
│   ├── config/
│   │   └── notificationServer.ts  # Configuração do IP
│   ├── components/
│   │   └── NotificationModal.tsx  # Modal de notificação
│   ├── store/
│   │   └── AppStateContext.tsx    # Polling e estado
│   └── features/
│       └── map/
│           └── MapScreen.tsx      # Tela do mapa com emoji
```

## 🎯 Mensagens disponíveis

As mensagens são pré-definidas no servidor (`server.js`) e na interface web. Para adicionar mais mensagens:

1. Adicione a mensagem no array `PREDEFINED_MESSAGES` em `server.js`
2. Adicione um botão correspondente em `public/index.html`

## 💡 Dicas para gravação

- Teste antes de gravar para garantir que tudo funciona
- Mantenha o servidor rodando durante toda a gravação
- Use um dispositivo físico Android para melhor visualização
- Certifique-se de que a bateria está carregada (polling consome bateria)


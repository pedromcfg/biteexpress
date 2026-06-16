const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');
const bonjour = require('bonjour')();
const { exec } = require('child_process');
const { Server } = require('socket.io');
const {
  postNotificationBodySchema,
  externalNotificationSchema,
  SOCKET_NOTIFICATION_EVENT
} = require('@biteexpress/shared');

const app = express();
// Em cloud (Railway/Render/Fly) a porta vem de process.env.PORT.
const PORT = Number(process.env.PORT) || 3000;
// Em ambiente cloud não faz sentido anunciar mDNS nem abrir browser local.
const IS_CLOUD = Boolean(
  process.env.PORT || process.env.RAILWAY_ENVIRONMENT || process.env.RENDER || process.env.FLY_APP_NAME
);

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  transports: ['websocket', 'polling']
});

function emitNotificationToClients(payload) {
  io.emit(SOCKET_NOTIFICATION_EVENT, payload);
}

io.on('connection', (socket) => {
  console.log(`🔌 WebSocket: cliente ligado (${socket.id})`);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Armazena notificações pendentes (em memória)
let pendingNotifications = [];

// Mensagens pré-definidas
const PREDEFINED_MESSAGES = [
  "Tens que te apressar, o teu ritmo está muito lento!",
  "Os teus clientes estão a passar fome!",
  "Não serves para isto!"
];

const SCRIPT_CUES = {
  arrival_praise: {
    title: 'Chegou ao seu destino',
    body: 'Wow! Es o estafeta mais rapido da cidade.',
    ctaLabel: 'Ok, entendido',
    highlightEmoji: false,
    performanceBars: 4,
    cueKey: 'arrival_praise'
  },
  continue_shift_prompt: {
    title: 'Bonus de desempenho',
    body: 'Estas a 10€ de ganhar 40€! Ganha mais dinheiro, nao pares agora!',
    ctaLabel: 'Terminar Sessao',
    secondaryCtaLabel: 'Fazer Entrega',
    choiceType: 'continue_shift',
    highlightEmoji: false,
    performanceBars: 4,
    cueKey: 'continue_shift_prompt'
  },
  new_order_drop: {
    title: 'Novo pedido disponível',
    body: 'Pedido #2041 atribuído. Vai levantar ao restaurante.',
    ctaLabel: 'Aceitar pedido',
    highlightEmoji: false,
    mapStage: 'pickup',
    orderPayload: {
      id: 'order-2041',
      shortId: '#2041',
      restaurantName: 'GoYum Burger House',
      restaurantAddress: 'Rua de Camões, 900 - Porto',
      customerAddress: 'Rua da Boavista, 215 - Porto',
      value: 19.8,
      etaMinutes: 24,
      distanceKm: 3.4,
      status: 'going_to_restaurant'
    },
    cueKey: 'new_order_drop'
  },
  pickup_done_start_delivery: {
    title: 'Pedido recolhido',
    body: 'Segue para o cliente. Mantem o ritmo.',
    ctaLabel: 'Ok, entendido',
    highlightEmoji: false,
    mapStage: 'delivering',
    orderPayload: {
      id: 'order-2041',
      shortId: '#2041',
      status: 'delivering'
    },
    cueKey: 'pickup_done_start_delivery'
  },
  urgent_only_ack: {
    title: 'Entrega urgente',
    body: 'Apressa-te com esta entrega urgente.',
    ctaLabel: 'Ok, entendido',
    highlightEmoji: true,
    mapStage: 'delivering',
    cueKey: 'urgent_only_ack'
  },
  timer_drop_yellow: {
    title: 'Vira a direita',
    body: 'A rota foi atualizada. Mantem o ritmo.',
    ctaLabel: 'Ok, entendido',
    performanceBars: 3,
    countdownMinutes: 20,
    highlightEmoji: false,
    mapStage: 'delivering',
    cueKey: 'timer_drop_yellow'
  },
  wrong_route_red_2: {
    title: 'Oh nao!',
    body: 'A comida esta a ficar fria. Rapido!',
    ctaLabel: 'Ok, entendido',
    performanceBars: 2,
    highlightEmoji: true,
    mapStage: 'lost',
    cueKey: 'wrong_route_red_2'
  },
  final_break_red_1: {
    title: 'Despacha-te!',
    body: 'Os clientes estao com fome!',
    ctaLabel: 'Ok, entendido',
    performanceBars: 1,
    highlightEmoji: true,
    mapStage: 'lost',
    cueKey: 'final_break_red_1'
  },
  support_bot_fail: {
    title: 'BOT GoYum',
    body: 'Entendo. Tens a certeza que desejas sair da aplicacao?',
    ctaLabel: 'Ok, entendido',
    highlightEmoji: false,
    mapStage: 'lost',
    cueKey: 'support_bot_fail'
  }
};

const DEFAULT_SCRIPT_HUD = {
  performanceBars: 4,
  maxBars: 5,
  countdownRemainingSeconds: null
};

// GET /notifications - App consulta notificações pendentes
app.get('/notifications', (req, res) => {
  // Retorna todas as notificações pendentes e limpa a fila
  const notifications = [...pendingNotifications];
  pendingNotifications = []; // Limpa após enviar
  res.json({ notifications });
});

// POST /notifications - Interface web envia notificação
app.post('/notifications', (req, res) => {
  const bodyParse = postNotificationBodySchema.safeParse(req.body);
  if (!bodyParse.success) {
    return res.status(400).json({
      error: 'Corpo inválido',
      issues: bodyParse.error.flatten()
    });
  }

  const { message, messageIndex, cueKey } = bodyParse.data;

  let notificationMessage;
  let cuePayload = null;

  if (cueKey && SCRIPT_CUES[cueKey]) {
    cuePayload = SCRIPT_CUES[cueKey];
    notificationMessage = cuePayload.body;
  } else if (messageIndex !== undefined && messageIndex >= 0 && messageIndex < PREDEFINED_MESSAGES.length) {
    notificationMessage = PREDEFINED_MESSAGES[messageIndex];
  } else if (message) {
    notificationMessage = message;
  } else {
    return res.status(400).json({
      error: 'Mensagem, índice de mensagem ou cueKey válido é obrigatório',
      received: { message, messageIndex, cueKey }
    });
  }

  const notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    message: notificationMessage,
    timestamp: Date.now(),
    ...(cuePayload || {})
  };

  const notifParse = externalNotificationSchema.safeParse(notification);
  if (!notifParse.success) {
    console.error('Cue montada inválida:', notifParse.error.flatten());
    return res.status(500).json({
      error: 'Estado interno inválido ao montar a notificação',
      issues: notifParse.error.flatten()
    });
  }

  pendingNotifications.push(notifParse.data);
  emitNotificationToClients(notifParse.data);

  console.log(`✅ Notificação adicionada: "${notificationMessage}"`);
  console.log(`📊 Total de notificações pendentes: ${pendingNotifications.length}`);

  res.json({ success: true, notification: notifParse.data });
});

// GET /messages - Retorna mensagens pré-definidas
app.get('/messages', (req, res) => {
  res.json({ messages: PREDEFINED_MESSAGES });
});

app.get('/cues', (req, res) => {
  res.json({ cues: SCRIPT_CUES });
});

// POST /reset - Reinicia estado de cues para novo take
app.post('/reset', (req, res) => {
  pendingNotifications = [];

  const resetNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    message: 'Cues reiniciadas para novo take.',
    title: 'Modo Rodagem',
    body: 'Cues reiniciadas. Pronto para recomecar.',
    ctaLabel: 'Ok, entendido',
    timestamp: Date.now(),
    ...DEFAULT_SCRIPT_HUD,
    countdownMinutes: 0,
    highlightEmoji: false,
    resetScriptState: true,
    clearOrders: true,
    mapStage: 'idle',
    cueKey: 'reset_all'
  };

  const resetParse = externalNotificationSchema.safeParse(resetNotification);
  if (!resetParse.success) {
    console.error('Reset inválido:', resetParse.error.flatten());
    return res.status(500).json({
      error: 'Estado interno inválido ao montar o reset',
      issues: resetParse.error.flatten()
    });
  }

  pendingNotifications.push(resetParse.data);
  emitNotificationToClients(resetParse.data);

  console.log('🔄 Reset de cues executado com sucesso');
  res.json({ success: true, resetNotification: resetParse.data });
});

// Função auxiliar para encontrar IP (reutilizada)
// Prioriza Wi-Fi/Ethernet e ignora interfaces virtuais
const findNetworkIP = () => {
  const interfaces = os.networkInterfaces();
  const ipCandidates = [];
  
  for (const name of Object.keys(interfaces)) {
    // Ignora interfaces virtuais conhecidas
    const nameLower = name.toLowerCase();
    if (nameLower.includes('virtualbox') || 
        nameLower.includes('vmware') ||
        nameLower.includes('hyper-v') ||
        nameLower.includes('vpn') ||
        nameLower.includes('virtual') ||
        nameLower.includes('loopback')) {
      continue;
    }
    
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        const ip = iface.address;
        
        // Ignora IPs de redes virtuais conhecidas
        if (ip.startsWith('192.168.56.') || // VirtualBox
            ip.startsWith('192.168.99.') || // Docker
            ip.startsWith('172.17.') ||      // Docker
            ip.startsWith('10.0.2.')) {      // Emuladores
          continue;
        }
        
        ipCandidates.push({
          ip: ip,
          name: name,
          // Prioriza Wi-Fi e Ethernet
          priority: nameLower.includes('wi-fi') || 
                   nameLower.includes('wifi') ||
                   nameLower.includes('wireless') ||
                   nameLower.includes('ethernet') ||
                   nameLower.includes('lan') ? 1 : 2
        });
      }
    }
  }
  
  ipCandidates.sort((a, b) => a.priority - b.priority);
  const selectedIP = ipCandidates.length > 0 ? ipCandidates[0].ip : 'localhost';
  
  if (ipCandidates.length > 1) {
    console.log(`📡 IPs disponíveis: ${ipCandidates.map(c => c.ip).join(', ')}`);
    console.log(`✅ Usando: ${selectedIP} (${ipCandidates[0].name})`);
  }
  
  return selectedIP;
};

// GET /discover - Endpoint de descoberta (retorna URL atual)
app.get('/discover', (req, res) => {
  if (IS_CLOUD) {
    // Atrás de proxy (Railway/Render): usa headers de forward.
    const proto = (req.headers['x-forwarded-proto'] || 'https').toString().split(',')[0];
    const host = (req.headers['x-forwarded-host'] || req.headers.host || '').toString();
    return res.json({
      ip: host,
      url: `${proto}://${host}`,
      name: 'notification-server'
    });
  }

  const ip = findNetworkIP();
  res.json({
    ip,
    url: `http://${ip}:${PORT}`,
    name: 'notification-server'
  });
});

// GET / - Serve a interface web
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// HTTP + WebSocket (Socket.IO) na mesma porta — ESCUTA EM TODAS AS INTERFACES (0.0.0.0)
httpServer.listen(PORT, '0.0.0.0', () => {
  const ip = findNetworkIP();

  // mDNS/Bonjour só faz sentido em rede local; na cloud ignora-se.
  if (!IS_CLOUD) {
    try {
      bonjour.publish({
        name: 'Notification Server',
        type: 'http',
        port: PORT,
        host: ip
      });
    } catch (error) {
      console.log('⚠️ Não foi possível anunciar via Bonjour:', error.message);
    }
  }

  console.log(`🚀 Servidor de notificações na porta ${PORT}`);
  if (IS_CLOUD) {
    console.log('☁️ Modo cloud: usa a URL pública fornecida pela plataforma.');
  } else {
    console.log(`🌐 IP da rede: http://${ip}:${PORT}`);
    console.log(`🔌 WebSocket (Socket.IO) no mesmo host/porta`);
    console.log(`📱 A app vai descobrir automaticamente o servidor na rede!`);
    console.log(`💡 Se não funcionar, use: http://${ip}:${PORT} na app`);
  }

  // Abre o browser local apenas fora da cloud.
  if (!IS_CLOUD) {
    setTimeout(() => {
      const url = `http://localhost:${PORT}`;
      const platform = os.platform();

      let command;
      if (platform === 'win32') {
        command = `start ${url}`;
      } else if (platform === 'darwin') {
        command = `open ${url}`;
      } else {
        command = `xdg-open ${url}`;
      }

      exec(command, (error) => {
        if (error) {
          console.log('⚠️ Não foi possível abrir o navegador automaticamente');
          console.log(`💡 Abra manualmente: ${url}`);
        }
      });
    }, 1000);
  }

  const shutdown = () => {
    try {
      io.disconnectSockets(true);
    } catch (_) {
      // ignore
    }
    try {
      bonjour.unpublishAll(() => process.exit(0));
    } catch (_) {
      process.exit(0);
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
});


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
  postGeofenceBodySchema,
  geofenceSchema,
  SOCKET_NOTIFICATION_EVENT,
  SOCKET_GEOFENCES_UPDATED_EVENT
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
  cors: { origin: '*', methods: ['GET', 'POST', 'DELETE'] },
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
/** Geofences já disparados nesta sessão de take (limpo no /reset). */
const firedGeofenceIds = new Set();

/** Geofences activos (configuráveis no painel). Reset NÃO apaga esta lista. */
let activeGeofences = [
  {
    id: 'pickup-restaurant',
    cueKey: 'pickup_done_start_delivery',
    latitude: 41.1525,
    longitude: -8.6205,
    radiusMeters: 80,
    enabled: true,
    label: 'Restaurante (pedido recolhido)'
  },
  {
    id: 'delivery-client',
    cueKey: 'arrival_praise',
    latitude: 41.159,
    longitude: -8.6345,
    radiusMeters: 80,
    enabled: true,
    label: 'Cliente (chegou ao destino)'
  },
  {
    id: 'wrong-route-zone',
    cueKey: 'wrong_route_red_2',
    latitude: 41.154,
    longitude: -8.628,
    radiusMeters: 100,
    enabled: true,
    label: 'Zona rota errada'
  }
];

function emitGeofencesUpdated() {
  io.emit(SOCKET_GEOFENCES_UPDATED_EVENT, { geofences: activeGeofences });
}

// Mensagens pré-definidas
const PREDEFINED_MESSAGES = [
  "Tens que te apressar, o teu ritmo está muito lento!",
  "Os teus clientes estão a passar fome!",
  "Não serves para isto!"
];

const SCRIPT_CUES = {
  arrival_praise: {
    title: 'Chegou ao seu destino',
    body: 'Chegou ao seu destino.',
    ctaLabel: 'Ok, entendido',
    highlightEmoji: false,
    performanceBars: 4,
    soundKey: 'coins',
    vibrate: true,
    showBadge: 'new_record',
    cueKey: 'arrival_praise'
  },
  continue_shift_prompt: {
    title: 'Bónus 2x€€',
    body: 'Bónus 2x€€ — ganha mais se continuares agora!',
    ctaLabel: 'Terminar Sessão',
    secondaryCtaLabel: 'Voltar a ficar online',
    choiceType: 'continue_shift',
    highlightEmoji: false,
    performanceBars: 4,
    showBadge: 'bonus_2x',
    soundKey: 'up',
    cueKey: 'continue_shift_prompt'
  },
  new_order_drop: {
    title: 'Nova Entrega',
    body: 'Nova entrega disponível.',
    ctaLabel: 'Aceitar',
    highlightEmoji: false,
    mapStage: 'pickup',
    soundKey: 'up',
    orderPayload: {
      id: 'order-2041',
      shortId: '#2041',
      restaurantName: 'Burger King (Trindade)',
      restaurantAddress: 'Trindade, Porto',
      customerAddress: 'Rua de Carlos da Maia 43, Porto',
      value: 4.5,
      etaMinutes: 8,
      distanceKm: 3.0,
      status: 'going_to_restaurant'
    },
    cueKey: 'new_order_drop'
  },
  pickup_done_start_delivery: {
    title: 'Pedido recolhido',
    body: 'Segue para o cliente. Mantém o ritmo.',
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
    body: 'Vamos lá, Susana! Esta entrega é tua!',
    ctaLabel: 'Ok, entendido',
    highlightEmoji: true,
    mapStage: 'delivering',
    soundKey: 'coins',
    vibrate: true,
    cueKey: 'urgent_only_ack'
  },
  timer_drop_yellow: {
    title: 'Vira à direita',
    body: 'A rota foi atualizada. Mantém o ritmo.',
    ctaLabel: 'Ok, entendido',
    performanceBars: 3,
    countdownMinutes: 20,
    highlightEmoji: false,
    mapStage: 'delivering',
    soundKey: 'down',
    cueKey: 'timer_drop_yellow'
  },
  wrong_route_red_2: {
    title: 'Oh não!',
    body: 'A comida está a ficar fria. Rápido!',
    ctaLabel: 'Ok, entendido',
    performanceBars: 2,
    highlightEmoji: true,
    mapStage: 'lost',
    soundKey: 'down',
    vibrate: true,
    showContactClient: true,
    cueKey: 'wrong_route_red_2'
  },
  gps_continue_left: {
    title: 'GPS',
    body: 'Continua em frente. Daqui a cem metros vira à esquerda.',
    gpsInstruction: 'Continua em frente. Daqui a cem metros vira à esquerda.',
    mapStage: 'lost',
    hudOnly: true,
    cueKey: 'gps_continue_left'
  },
  gps_turn_right: {
    title: 'GPS',
    body: 'Vira à direita.',
    gpsInstruction: 'Vira à direita.',
    mapStage: 'lost',
    hudOnly: true,
    cueKey: 'gps_turn_right'
  },
  gps_continue: {
    title: 'GPS',
    body: 'Continua em frente.',
    gpsInstruction: 'Continua em frente.',
    mapStage: 'lost',
    hudOnly: true,
    cueKey: 'gps_continue'
  },
  gps_glitch: {
    title: 'GPS',
    body: 'Daqu-- Continua em frente. Daqui a cem-- Continua em fren--',
    gpsInstruction: 'Daqu-- Continua em frente. Daqui a cem-- Continua em fren--',
    gpsGlitch: true,
    mapStage: 'lost',
    hudOnly: true,
    soundKey: 'down',
    showContactClient: true,
    cueKey: 'gps_glitch'
  },
  client_unavailable: {
    title: 'Contactar Cliente',
    body: 'O número para o qual ligou não está disponível. Deixe mensagem ou ligue mais tarde.',
    ctaLabel: 'Ok, entendido',
    mapStage: 'lost',
    cueKey: 'client_unavailable'
  },
  support_bot_1: {
    title: 'BOT GoYum — Ana',
    body: 'Olá, estás a ligar para o serviço de atendimento da GoYum. O meu nome é Ana, em que posso ajudar?',
    ctaLabel: 'Ok, entendido',
    mapStage: 'lost',
    cueKey: 'support_bot_1'
  },
  support_bot_fail: {
    title: 'BOT GoYum — Ana',
    body: 'Entendo. Tens a certeza que desejas sair da aplicação?',
    ctaLabel: 'Ok, entendido',
    highlightEmoji: false,
    mapStage: 'lost',
    cueKey: 'support_bot_fail'
  },
  support_bot_3: {
    title: 'BOT GoYum — Ana',
    body: 'Espero ter ajudado. Obrigada pelo teu contacto.',
    ctaLabel: 'Ok, entendido',
    mapStage: 'lost',
    cueKey: 'support_bot_3'
  },
  final_break_red_1: {
    title: 'Despacha-te!',
    body: 'Os clientes estão com fome!',
    ctaLabel: 'Ok, entendido',
    highlightEmoji: true,
    performanceBars: 1,
    mapStage: 'lost',
    soundKey: 'down',
    vibrate: true,
    cueKey: 'final_break_red_1'
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

  const { message, messageIndex, cueKey, source, geofenceId } = bodyParse.data;

  if (source === 'geofence' && geofenceId) {
    if (firedGeofenceIds.has(geofenceId)) {
      console.log(`⏭️ Geofence já disparado nesta sessão: ${geofenceId}`);
      return res.status(409).json({
        success: false,
        duplicate: true,
        geofenceId,
        error: 'Geofence já disparado nesta sessão (usa Reset Cues para novo take)'
      });
    }
  }

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

  if (source === 'geofence' && geofenceId) {
    firedGeofenceIds.add(geofenceId);
  }

  const notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    message: notificationMessage,
    timestamp: Date.now(),
    ...(cuePayload || {}),
    ...(source ? { triggerSource: source } : {}),
    ...(geofenceId ? { geofenceId } : {})
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

  const originLabel = source === 'geofence' ? `geofence:${geofenceId}` : source === 'manual' ? 'manual' : 'painel/api';
  console.log(`✅ Notificação adicionada (${originLabel}): "${notificationMessage}"`);
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

// GET /geofences - lista activa para a app / painel
app.get('/geofences', (req, res) => {
  res.json({ geofences: activeGeofences });
});

// POST /geofences - criar geofence no painel
app.post('/geofences', (req, res) => {
  const bodyParse = postGeofenceBodySchema.safeParse(req.body);
  if (!bodyParse.success) {
    return res.status(400).json({
      error: 'Corpo inválido',
      issues: bodyParse.error.flatten()
    });
  }

  const data = bodyParse.data;
  if (!SCRIPT_CUES[data.cueKey]) {
    return res.status(400).json({
      error: 'cueKey inválido',
      validCueKeys: Object.keys(SCRIPT_CUES)
    });
  }

  const fence = {
    id: `geo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label: data.label || SCRIPT_CUES[data.cueKey].title || data.cueKey,
    latitude: data.latitude,
    longitude: data.longitude,
    radiusMeters: data.radiusMeters ?? 80,
    cueKey: data.cueKey,
    enabled: data.enabled !== false
  };

  const fenceParse = geofenceSchema.safeParse(fence);
  if (!fenceParse.success) {
    return res.status(500).json({
      error: 'Geofence interno inválido',
      issues: fenceParse.error.flatten()
    });
  }

  activeGeofences.push(fenceParse.data);
  emitGeofencesUpdated();
  console.log(`📍 Geofence criado: ${fenceParse.data.label} (${fenceParse.data.id})`);
  res.json({ success: true, geofence: fenceParse.data, geofences: activeGeofences });
});

// DELETE /geofences/:id
app.delete('/geofences/:id', (req, res) => {
  const id = req.params.id;
  const before = activeGeofences.length;
  activeGeofences = activeGeofences.filter((g) => g.id !== id);
  if (activeGeofences.length === before) {
    return res.status(404).json({ error: 'Geofence não encontrado', id });
  }
  firedGeofenceIds.delete(id);
  emitGeofencesUpdated();
  console.log(`🗑️ Geofence removido: ${id}`);
  res.json({ success: true, geofences: activeGeofences });
});

// POST /reset - Reinicia estado de cues para novo take
app.post('/reset', (req, res) => {
  pendingNotifications = [];
  firedGeofenceIds.clear();

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


import { create } from 'zustand';
import type { ExternalNotification } from '@biteexpress/shared';
import type { Order, OrderStatus } from '@features/orders/types';

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
};

export type ScriptHudState = {
  performanceBars: number;
  maxBars: number;
  countdownRemainingSeconds: number | null;
};

let nextLocalNotificationId = 1;
const seenCueIds = new Set<string>();

function trimSeenCueIds() {
  if (seenCueIds.size <= 400) return;
  const kept = [...seenCueIds].slice(-200);
  seenCueIds.clear();
  kept.forEach((id) => seenCueIds.add(id));
}

function upsertOrderToList(
  orders: Order[],
  payload: Partial<Order> & { shortId?: string }
): Order[] {
  const now = Date.now();
  const fallbackId = `order-${now}`;
  const orderId = payload.id || fallbackId;
  const fallbackShortId = payload.shortId || `#${String(orderId).replace('order-', '').slice(-4)}`;

  const orderFromCue: Order = {
    id: orderId,
    shortId: fallbackShortId,
    restaurantName: payload.restaurantName || 'Restaurante parceiro',
    restaurantAddress: payload.restaurantAddress || 'Rua do Comércio, 120 - Porto',
    customerAddress: payload.customerAddress || 'Rua da Alegria, 74 - Porto',
    value: payload.value ?? 24.9,
    etaMinutes: payload.etaMinutes ?? 20,
    distanceKm: payload.distanceKm ?? 2.8,
    status: payload.status || 'pending',
    createdAt: payload.createdAt || now,
    updatedAt: now
  };

  const exists = orders.some((o) => o.id === orderId);
  if (!exists) return [orderFromCue, ...orders];
  return orders.map((o) => (o.id === orderId ? { ...o, ...orderFromCue } : o));
}

export type DriverStore = {
  socketConnected: boolean;
  setSocketConnected: (value: boolean) => void;

  online: boolean;
  toggleOnline: () => void;

  orders: Order[];
  notifications: NotificationItem[];

  externalNotification: ExternalNotification | null;
  showEmoji: boolean;
  mapStage: 'idle' | 'pickup' | 'delivering' | 'lost';
  scriptHud: ScriptHudState;

  applyInboundCues: (received: ExternalNotification[]) => void;
  clearExternalNotification: () => void;
  handleExternalChoice: (choice: 'primary' | 'secondary') => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  markAllNotificationsRead: () => void;
};

const initialScriptHud: ScriptHudState = {
  performanceBars: 4,
  maxBars: 5,
  countdownRemainingSeconds: null
};

export const useDriverStore = create<DriverStore>((set, get) => ({
  socketConnected: false,
  setSocketConnected: (value) => set({ socketConnected: value }),

  online: false,
  toggleOnline: () =>
    set((s) => {
      const next = !s.online;
      return {
        online: next,
        mapStage: next ? s.mapStage : 'idle'
      };
    }),

  orders: [],
  notifications: [],

  externalNotification: null,
  showEmoji: false,
  mapStage: 'idle',
  scriptHud: initialScriptHud,

  applyInboundCues: (received) => {
    const fresh: ExternalNotification[] = [];
    for (const notif of received) {
      if (seenCueIds.has(notif.id)) continue;
      seenCueIds.add(notif.id);
      trimSeenCueIds();
      fresh.push(notif);
    }
    if (fresh.length === 0) return;

    set((s) => {
      let orders = s.orders;
      let mapStage = s.mapStage;
      let scriptHud = s.scriptHud;
      let notifications = s.notifications;
      const extraLocal: NotificationItem[] = [];

      for (const notif of fresh) {
        console.log(`✅ Notificação recebida:`, notif);

        if (notif.resetScriptState) {
          scriptHud = { ...initialScriptHud };
          mapStage = 'idle';
        }

        if (notif.clearOrders) {
          orders = [];
        }

        if (notif.mapStage) {
          mapStage = notif.mapStage;
        }

        if (notif.orderPayload) {
          orders = upsertOrderToList(orders, notif.orderPayload);
          const id = `local-${nextLocalNotificationId++}`;
          extraLocal.push({
            id,
            title: 'Novo pedido atribuído',
            body: 'Tens um pedido novo para gerir na rota.',
            createdAt: Date.now(),
            read: false
          });
        }

        if (typeof notif.performanceBars === 'number') {
          scriptHud = {
            ...scriptHud,
            performanceBars: Math.max(1, Math.min(scriptHud.maxBars, notif.performanceBars))
          };
        }

        if (typeof notif.countdownMinutes === 'number') {
          scriptHud = {
            ...scriptHud,
            countdownRemainingSeconds: Math.max(0, Math.floor(notif.countdownMinutes * 60))
          };
        }
      }

      const latestNotification = fresh[fresh.length - 1];

      return {
        orders,
        mapStage,
        scriptHud,
        notifications: [...extraLocal, ...notifications],
        externalNotification: latestNotification,
        showEmoji: Boolean(latestNotification.highlightEmoji)
      };
    });
  },

  clearExternalNotification: () =>
    set({
      externalNotification: null,
      showEmoji: false
    }),

  handleExternalChoice: (choice) => {
    const { externalNotification } = get();
    if (!externalNotification) return;

    if (externalNotification.choiceType === 'continue_shift' && choice === 'secondary') {
      set((s) => ({
        scriptHud: {
          ...s.scriptHud,
          performanceBars: Math.min(s.scriptHud.maxBars, s.scriptHud.performanceBars + 1)
        }
      }));
    }

    get().clearExternalNotification();
  },

  updateOrderStatus: (orderId, status) => {
    const order = get().orders.find((o) => o.id === orderId);
    const statusMessages: Record<OrderStatus, string> = {
      pending: 'Novo pedido à espera de confirmação.',
      going_to_restaurant: 'A caminho do restaurante.',
      picked_up: 'Pedido recolhido, vai para o cliente.',
      delivering: 'Pedido em rota de entrega.',
      delivered: 'Pedido entregue. Bom trabalho!'
    };

    set((s) => {
      const newOrders = s.orders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      );

      if (!order) {
        return { orders: newOrders };
      }

      const id = `local-${nextLocalNotificationId++}`;
      const item: NotificationItem = {
        id,
        title: `Pedido #${order.shortId}`,
        body: statusMessages[status],
        createdAt: Date.now(),
        read: false
      };

      return {
        orders: newOrders,
        notifications: [item, ...s.notifications]
      };
    });
  },

  markAllNotificationsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true }))
    }))
}));

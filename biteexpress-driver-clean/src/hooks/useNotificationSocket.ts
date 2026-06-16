import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import {
  externalNotificationSchema,
  SOCKET_NOTIFICATION_EVENT
} from '@biteexpress/shared';
import { getNotificationServerUrl } from '@config/notificationServer';
import { useDriverStore } from '@store/driverStore';

/**
 * Liga Socket.IO ao servidor e encaminha cues validadas (Zod) para a store.
 */
export function useNotificationSocket() {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    let socket: Socket | null = null;

    const run = async () => {
      const serverUrl = await getNotificationServerUrl();
      if (!isMountedRef.current) return;

      const s = io(serverUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000
      });

      if (!isMountedRef.current) {
        s.disconnect();
        return;
      }

      socket = s;

      s.on(SOCKET_NOTIFICATION_EVENT, (raw: unknown) => {
        const parsed = externalNotificationSchema.safeParse(raw);
        if (!parsed.success) {
          console.warn('❌ Evento WebSocket inválido:', parsed.error.flatten());
          return;
        }
        if (!isMountedRef.current) return;
        useDriverStore.getState().applyInboundCues([parsed.data]);
      });

      s.on('connect', () => {
        useDriverStore.getState().setSocketConnected(true);
        console.log('🔌 Socket.IO: ligado ao servidor');
      });

      s.on('disconnect', (reason) => {
        useDriverStore.getState().setSocketConnected(false);
        console.log('🔌 Socket.IO: desligado —', reason, '— fallback HTTP (Query)');
      });

      s.on('connect_error', (err) => {
        useDriverStore.getState().setSocketConnected(false);
        console.warn('🔌 Socket.IO connect_error:', err.message);
      });
    };

    void run();

    return () => {
      isMountedRef.current = false;
      useDriverStore.getState().setSocketConnected(false);
      socket?.disconnect();
      socket = null;
    };
  }, []);
}

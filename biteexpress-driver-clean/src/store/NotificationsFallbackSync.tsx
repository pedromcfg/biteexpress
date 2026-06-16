import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { notificationsResponseSchema } from '@biteexpress/shared';
import { getNotificationServerUrl, POLLING_INTERVAL } from '@config/notificationServer';
import { useDriverStore } from './driverStore';

/**
 * Quando o socket não está ligado, TanStack Query faz GET /notifications
 * com retry, intervalo e cache — e aplica na store Zustand.
 */
export const NotificationsFallbackSync: React.FC = () => {
  const socketConnected = useDriverStore((s) => s.socketConnected);

  const { data, isError, error } = useQuery({
    queryKey: ['notifications', 'fallback'] as const,
    queryFn: async () => {
      const serverUrl = await getNotificationServerUrl();
      const response = await fetch(`${serverUrl}/notifications`, {
        method: 'GET',
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      const json = await response.json();
      const parsed = notificationsResponseSchema.safeParse(json);
      if (!parsed.success) {
        throw new Error('Resposta /notifications inválida');
      }
      return parsed.data.notifications;
    },
    enabled: !socketConnected,
    refetchInterval: () =>
      useDriverStore.getState().socketConnected ? false : POLLING_INTERVAL,
    staleTime: 0
  });

  useEffect(() => {
    if (socketConnected || !data?.length) return;
    useDriverStore.getState().applyInboundCues(data);
  }, [data, socketConnected]);

  useEffect(() => {
    if (isError && error instanceof Error) {
      console.warn('❌ Fallback HTTP (Query):', error.message);
    }
  }, [isError, error]);

  return null;
};

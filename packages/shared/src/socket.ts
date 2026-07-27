/** Nome do evento Socket.IO para uma cue / notificação (servidor → app). */
export const SOCKET_NOTIFICATION_EVENT = 'notification' as const;

/** Lista de geofences no servidor foi criada/apagada — a app deve refetch. */
export const SOCKET_GEOFENCES_UPDATED_EVENT = 'geofences_updated' as const;

import React from 'react';
import { useNotificationSocket } from './useNotificationSocket';

/** Monta o hook de socket uma vez dentro da árvore. */
export const NotificationSocketBootstrap: React.FC = () => {
  useNotificationSocket();
  return null;
};

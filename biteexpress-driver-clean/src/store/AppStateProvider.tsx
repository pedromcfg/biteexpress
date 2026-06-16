import React, { type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { NotificationSocketBootstrap } from '@hooks/NotificationSocketBootstrap';
import { queryClient } from './queryClient';
import { NotificationsFallbackSync } from './NotificationsFallbackSync';
import { DriverStoreEffects } from './DriverStoreEffects';

export const AppStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationSocketBootstrap />
      <NotificationsFallbackSync />
      <DriverStoreEffects />
      {children}
    </QueryClientProvider>
  );
};

/**
 * Barrel da camada de estado da app (Zustand + TanStack Query + socket).
 * O antigo React Context foi substituído por esta composição.
 */
export { SAO_PAULO_COORDS } from './constants';
export { useAppState } from './useAppState';
export { AppStateProvider } from './AppStateProvider';
export type { ExternalNotification } from '@biteexpress/shared';
export type { NotificationItem, ScriptHudState } from './driverStore';

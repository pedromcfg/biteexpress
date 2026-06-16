import { useShallow } from 'zustand/react/shallow';
import { useDriverStore } from './driverStore';

/** API compatível com o antigo Context — agora backed por Zustand. */
export const useAppState = () =>
  useDriverStore(
    useShallow((s) => ({
      online: s.online,
      toggleOnline: s.toggleOnline,
      orders: s.orders,
      updateOrderStatus: s.updateOrderStatus,
      notifications: s.notifications,
      unreadCount: s.notifications.filter((n) => !n.read).length,
      markAllNotificationsRead: s.markAllNotificationsRead,
      externalNotification: s.externalNotification,
      clearExternalNotification: s.clearExternalNotification,
      showEmoji: s.showEmoji,
      scriptHud: s.scriptHud,
      mapStage: s.mapStage,
      handleExternalChoice: s.handleExternalChoice
    }))
  );

import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { useDriverStore } from './driverStore';

/** Contador do HUD e logs em background. */
export const DriverStoreEffects: React.FC = () => {
  const countdownRemainingSeconds = useDriverStore(
    (s) => s.scriptHud.countdownRemainingSeconds
  );

  useEffect(() => {
    if (countdownRemainingSeconds === null || countdownRemainingSeconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      useDriverStore.setState((s) => {
        if (s.scriptHud.countdownRemainingSeconds === null) return s;
        if (s.scriptHud.countdownRemainingSeconds <= 1) {
          return { scriptHud: { ...s.scriptHud, countdownRemainingSeconds: 0 } };
        }
        return {
          scriptHud: {
            ...s.scriptHud,
            countdownRemainingSeconds: s.scriptHud.countdownRemainingSeconds - 1
          }
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdownRemainingSeconds]);

  const unreadCount = useDriverStore((s) => s.notifications.filter((n) => !n.read).length);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        console.log('Notificações não lidas:', unreadCount);
      }
    });
    return () => sub.remove();
  }, [unreadCount]);

  return null;
};

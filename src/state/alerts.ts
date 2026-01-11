import { useEffect, useState } from 'react';
import { AlertState, subscribeToAlerts, getActiveAlert } from '../logic/alertsService';

export const useAlerts = (): AlertState | null => {
  const [alert, setAlert] = useState<AlertState | null>(getActiveAlert());

  useEffect(() => {
    const unsubscribe = subscribeToAlerts(setAlert);
    return () => unsubscribe();
  }, []);

  return alert;
};

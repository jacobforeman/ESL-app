import { logAuditEvent } from './auditLog';
import { readStore } from '../storage';
import { profileStore } from '../storage/stores';

export type AlertType = 'emergency';

export type AlertState = {
  id: string;
  type: AlertType;
  message: string;
  details?: string[];
  createdAt: string;
  source: string;
};

type AlertListener = (alert: AlertState | null) => void;

let activeAlert: AlertState | null = null;
const listeners = new Set<AlertListener>();

const notify = () => {
  listeners.forEach((listener) => listener(activeAlert));
};

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const getActiveAlert = (): AlertState | null => activeAlert;

export const subscribeToAlerts = (listener: AlertListener): (() => void) => {
  listeners.add(listener);
  listener(activeAlert);
  return () => listeners.delete(listener);
};

export const triggerEmergencyAlert = (input: {
  message: string;
  details?: string[];
  source: string;
}): void => {
  activeAlert = {
    id: createId(),
    type: 'emergency',
    message: input.message,
    details: input.details,
    source: input.source,
    createdAt: new Date().toISOString(),
  };
  readStore(profileStore)
    .then(({ data }) =>
      logAuditEvent({
        userRole: data.caregiverMode,
        actionType: 'alert_triggered',
        entity: 'emergency-alert',
        entityId: activeAlert?.id,
        metadata: { source: input.source },
      }),
    )
    .catch((error) => {
      console.warn('Unable to log alert audit event.', error);
    });
  notify();
};

export const clearAlert = (): void => {
  activeAlert = null;
  notify();
};

import { auditLogStore, updateStore } from '../storage';
import { AuditEvent, CaregiverMode } from '../storage/types';

export type AuditActionType =
  | 'checkin_submitted'
  | 'triage_viewed'
  | 'export_generated'
  | 'ai_message_generated'
  | 'caregiver_mode_toggled'
  | 'journal_saved'
  | 'med_logged'
  | 'alert_triggered';

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const logAuditEvent = async (input: {
  userRole: CaregiverMode;
  actionType: AuditActionType;
  entity: string;
  entityId?: string;
  metadata?: Record<string, string>;
}): Promise<void> => {
  const entry: AuditEvent = {
    id: createId(),
    timestamp: new Date().toISOString(),
    userRole: input.userRole,
    actionType: input.actionType,
    entity: input.entity,
    entityId: input.entityId,
    metadata: input.metadata,
  };

  await updateStore(auditLogStore, (entries) => [entry, ...entries]);
};

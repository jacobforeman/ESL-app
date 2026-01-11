export type CaregiverMode = 'patient' | 'caregiver';

export interface Profile {
  id: string;
  name: string;
  caregiverMode: CaregiverMode;
  updatedAt: string;
}

export interface ModuleSelection {
  enabledModules: string[];
  updatedAt: string;
}

export interface CheckIn {
  id: string;
  createdAt: string;
  reportedAt?: string;
  symptoms: string[];
  vitals: Record<string, number | string>;
  missedMeds: string[];
  notes?: string;
  caregiverNotes?: string;
  schemaVersion?: number;
}

export type TriageLevel = 'emergency' | 'urgent' | 'routine' | 'self-monitor';

export interface TriageHistoryEntry {
  id: string;
  checkInId: string;
  createdAt: string;
  level: TriageLevel;
  rationale: string[];
  ruleIds?: string[];
  recommendedAction?: string;
  inputSnapshot?: Record<string, unknown>;
  schemaVersion?: number;
}

export interface MedConfigItem {
  id: string;
  name: string;
  dose: string;
  schedule: string[];
  critical?: boolean;
}

export interface MedConfig {
  meds: MedConfigItem[];
  updatedAt: string;
}

export interface MedAdherenceEntry {
  id: string;
  medId: string;
  date: string;
  taken: boolean;
  reason?: string;
}

export interface JournalEntry {
  id: string;
  createdAt: string;
  author: CaregiverMode;
  text: string;
  tags?: string[];
  caregiverNotes?: string;
  redFlags?: string[];
}

export interface StorageEnvelope<T> {
  version: number;
  data: T;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  userRole: CaregiverMode;
  actionType: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, string>;
}

export interface JournalSummaryEntry {
  id: string;
  createdAt: string;
  rangeDays: number;
  promptVersion: string;
  summary: string;
}

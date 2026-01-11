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
  symptoms: string[];
  vitals: Record<string, number | string>;
  missedMeds: string[];
  notes?: string;
}

export type TriageLevel = 'emergency' | 'urgent' | 'routine' | 'self-monitor';

export interface TriageHistoryEntry {
  id: string;
  checkInId: string;
  createdAt: string;
  level: TriageLevel;
  rationale: string[];
  recommendedAction?: string;
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
  redFlags?: string[];
}

export interface StorageEnvelope<T> {
  version: number;
  data: T;
}

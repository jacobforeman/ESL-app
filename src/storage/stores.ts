import {
  CheckIn,
  JournalEntry,
  MedAdherenceEntry,
  MedConfig,
  ModuleSelection,
  Profile,
  AuditEvent,
  JournalSummaryEntry,
  TriageHistoryEntry,
} from './types';
import { StorageStore } from './storageEngine';

const nowIso = () => new Date().toISOString();

export const profileStore: StorageStore<Profile> = {
  key: 'esl.profile',
  version: 1,
  defaultData: {
    id: 'profile-1',
    name: '',
    caregiverMode: 'patient',
    updatedAt: nowIso(),
  },
  migrations: [],
};

export const moduleSelectionStore: StorageStore<ModuleSelection> = {
  key: 'esl.moduleSelection',
  version: 1,
  defaultData: {
    enabledModules: ['check-ins', 'meds', 'journal', 'ai'],
    updatedAt: nowIso(),
  },
  migrations: [],
};

export const checkInStore: StorageStore<CheckIn[]> = {
  key: 'esl.checkIns',
  version: 2,
  defaultData: [],
  migrations: [
    (data) =>
      data.map((entry) => ({
        ...entry,
        schemaVersion: entry.schemaVersion ?? 1,
      })),
  ],
};

export const triageHistoryStore: StorageStore<TriageHistoryEntry[]> = {
  key: 'esl.triageHistory',
  version: 2,
  defaultData: [],
  migrations: [
    (data) =>
      data.map((entry) => ({
        ...entry,
        schemaVersion: entry.schemaVersion ?? 1,
      })),
  ],
};

export const medConfigStore: StorageStore<MedConfig> = {
  key: 'esl.medConfig',
  version: 1,
  defaultData: {
    meds: [],
    updatedAt: nowIso(),
  },
  migrations: [],
};

export const medAdherenceStore: StorageStore<MedAdherenceEntry[]> = {
  key: 'esl.medAdherence',
  version: 1,
  defaultData: [],
  migrations: [],
};

export const journalStore: StorageStore<JournalEntry[]> = {
  key: 'esl.journalEntries',
  version: 2,
  defaultData: [],
  migrations: [
    (data) =>
      data.map((entry) => ({
        ...entry,
        tags: entry.tags ?? [],
      })),
  ],
};

export const journalSummaryStore: StorageStore<JournalSummaryEntry[]> = {
  key: 'esl.journalSummaries',
  version: 1,
  defaultData: [],
  migrations: [],
};

export const auditLogStore: StorageStore<AuditEvent[]> = {
  key: 'esl.auditLog',
  version: 1,
  defaultData: [],
  migrations: [],
};

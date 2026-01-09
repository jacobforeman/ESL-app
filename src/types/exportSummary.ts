import { CheckIn, MedAdherenceEntry, Profile, TriageHistoryEntry } from '../storage/types';

export type ExportSummaryProfile = Pick<Profile, 'id' | 'name' | 'caregiverMode'>;

export type ExportSummaryCheckIn = Pick<
  CheckIn,
  'id' | 'createdAt' | 'symptoms' | 'vitals' | 'missedMeds' | 'notes'
>;

export type ExportSummaryTriageResult = Pick<
  TriageHistoryEntry,
  'id' | 'checkInId' | 'createdAt' | 'level' | 'rationale'
>;

export interface MedAdherenceSnapshot {
  date: string;
  entries: MedAdherenceEntry[];
  takenCount: number;
  missedCount: number;
}

export interface ExportSummaryPayload {
  profile: ExportSummaryProfile;
  lastCheckIn: ExportSummaryCheckIn;
  triageResult: ExportSummaryTriageResult;
  medsAdherenceSnapshot: MedAdherenceSnapshot;
}

export interface ExportSummaryResult {
  summary: ExportSummaryPayload;
  sbar: string;
}

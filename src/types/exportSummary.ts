import { CheckIn, JournalEntry, MedAdherenceEntry, Profile, TriageHistoryEntry } from '../storage/types';

export type ExportSummaryProfile = Pick<Profile, 'id' | 'name' | 'caregiverMode'>;

export type ExportSummaryTriageResult = Pick<
  TriageHistoryEntry,
  'id' | 'checkInId' | 'createdAt' | 'level' | 'rationale' | 'ruleIds'
>;

export type ExportSummaryJournalEntry = Pick<
  JournalEntry,
  'id' | 'createdAt' | 'author' | 'text' | 'redFlags' | 'tags' | 'caregiverNotes'
>;

export interface ExportSummaryPayload {
  profile: ExportSummaryProfile;
  checkIns: CheckIn[];
  triageHistory: ExportSummaryTriageResult[];
  medAdherence: MedAdherenceEntry[];
  journalEntries: ExportSummaryJournalEntry[];
}

export interface SymptomTrend {
  symptom: string;
  count: number;
}

export interface VitalsTrend {
  metric: string;
  average?: number;
  min?: number;
  max?: number;
}

export interface MedicationAdherenceSummary {
  startDate: string;
  endDate: string;
  taken: number;
  missed: number;
  percentage: number;
}

export interface JournalHighlight {
  id: string;
  createdAt: string;
  author: string;
  text: string;
  redFlags?: string[];
  tags?: string[];
  caregiverNotes?: string;
}

export interface ExportSummaryResult {
  generatedAt: string;
  profile: ExportSummaryProfile;
  triageResults: ExportSummaryTriageResult[];
  symptomTrends: SymptomTrend[];
  vitalsTrends: VitalsTrend[];
  medicationAdherence: MedicationAdherenceSummary;
  journalHighlights: JournalHighlight[];
  structuredJson: string;
}

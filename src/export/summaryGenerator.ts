import {
  CheckIn,
  JournalEntry,
  MedAdherenceEntry,
  MedConfig,
  ModuleSelection,
  Profile,
  TriageHistoryEntry,
} from '../storage/types';
import { buildCaregiverPhrase } from '../utils/caregiverPhrasing';

export interface ExportSummaryInput {
  profile: Profile;
  moduleSelection: ModuleSelection;
  checkIns: CheckIn[];
  triageHistory: TriageHistoryEntry[];
  medConfig: MedConfig;
  medAdherence: MedAdherenceEntry[];
  journalEntries: JournalEntry[];
}

export interface ExportSummary {
  header: {
    patientName: string;
    modeLabel: string;
    generatedAt: string;
  };
  triage: {
    latestLevel?: string;
    recentEntries: TriageHistoryEntry[];
  };
  medications: {
    meds: MedConfig['meds'];
    adherence: MedAdherenceEntry[];
  };
  journal: {
    recentEntries: JournalEntry[];
    redFlagCount: number;
  };
  narrative: string;
}

const summarizeNarrative = (input: ExportSummaryInput): string => {
  const { profile, triageHistory, journalEntries } = input;
  const latest = triageHistory[0];
  const redFlags = journalEntries.filter((entry) => entry.redFlags?.length);
  const intro = buildCaregiverPhrase(profile.caregiverMode, 'reported the following updates.');
  const triageLine = latest
    ? `Latest triage level: ${latest.level}.`
    : 'No recent triage results recorded.';
  const journalLine = redFlags.length
    ? `Journal entries include ${redFlags.length} red-flag note(s).`
    : 'No red-flag journal notes detected.';

  return [intro, triageLine, journalLine].join(' ');
};

export const buildExportSummary = (input: ExportSummaryInput): ExportSummary => {
  const latestTriage = input.triageHistory[0];
  const redFlagCount = input.journalEntries.filter((entry) => entry.redFlags?.length).length;

  return {
    header: {
      patientName: input.profile.name,
      modeLabel: input.profile.caregiverMode,
      generatedAt: new Date().toISOString(),
    },
    triage: {
      latestLevel: latestTriage?.level,
      recentEntries: input.triageHistory.slice(0, 5),
    },
    medications: {
      meds: input.medConfig.meds,
      adherence: input.medAdherence.slice(0, 20),
    },
    journal: {
      recentEntries: input.journalEntries.slice(0, 10),
      redFlagCount,
    },
    narrative: summarizeNarrative(input),
  };
};

import {
  CheckIn,
  JournalEntry,
  MedAdherenceEntry,
  MedConfig,
  ModuleSelection,
  Profile,
  TriageHistoryEntry,
} from '../storage/types';
import { readStore } from '../storage/storageEngine';
import {
  checkInStore,
  journalStore,
  medAdherenceStore,
  medConfigStore,
  moduleSelectionStore,
  profileStore,
  triageHistoryStore,
} from '../storage/stores';
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

const ACTIONS_BY_LEVEL: Record<string, string> = {
  emergency: 'Call 911 or go to the nearest emergency department now.',
  urgent: 'Contact your liver care team within 24 hours.',
  routine: 'Discuss this at your next appointment.',
  'self-monitor': 'Keep monitoring your symptoms today.',
};

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

const formatSbar = (summary: ExportSummary): string => {
  const patientName = summary.header.patientName || 'Unknown patient';
  const latestLevel = summary.triage.latestLevel ?? 'unknown';
  const recommendation = ACTIONS_BY_LEVEL[latestLevel] ?? 'Review patient status and follow care plan.';

  const situation = `S: ${patientName} completed a check-in. Latest triage level: ${latestLevel}.`;
  const background = `B: Mode ${summary.header.modeLabel}. Recent triage entries: ${summary.triage.recentEntries.length}. Med list: ${summary.medications.meds.length} medication(s). Red-flag notes: ${summary.journal.redFlagCount}.`;
  const assessment = `A: ${summary.narrative}`;
  const recommendationLine = `R: ${recommendation}`;

  return [situation, background, assessment, recommendationLine].join('\n');
};

export const exportSummary = async (): Promise<{
  json: string;
  sbar: string;
  combined: string;
  summary: ExportSummary;
}> => {
  const [profile, moduleSelection, checkIns, triageHistory, medConfig, medAdherence, journalEntries] =
    await Promise.all([
      readStore(profileStore),
      readStore(moduleSelectionStore),
      readStore(checkInStore),
      readStore(triageHistoryStore),
      readStore(medConfigStore),
      readStore(medAdherenceStore),
      readStore(journalStore),
    ]);

  const summary = buildExportSummary({
    profile: profile.data,
    moduleSelection: moduleSelection.data,
    checkIns: checkIns.data,
    triageHistory: triageHistory.data,
    medConfig: medConfig.data,
    medAdherence: medAdherence.data,
    journalEntries: journalEntries.data,
  });

  const json = JSON.stringify(summary, null, 2);
  const sbar = formatSbar(summary);
  const combined = `JSON Summary\n${json}\n\nSBAR\n${sbar}`;

  return {
    json,
    sbar,
    combined,
    summary,
  };
};

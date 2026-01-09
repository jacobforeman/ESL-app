import { buildExportSummary, ExportSummary } from './summaryGenerator';
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

const ACTIONS_BY_LEVEL: Record<string, string> = {
  emergency: 'Call 911 or go to the nearest emergency department now.',
  urgent: 'Contact your liver care team within 24 hours.',
  routine: 'Discuss this at your next appointment.',
  'self-monitor': 'Keep monitoring your symptoms today.',
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

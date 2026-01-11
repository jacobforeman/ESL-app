import { checkInStore, readStore, triageHistoryStore, updateStore } from '../storage';
import { CheckIn, TriageHistoryEntry } from '../storage/types';
import { CheckInAnswers, TriageDecision } from '../types/checkIn';
import type { MedAdherenceSnapshotItem } from '../types/meds';

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

type CheckInContext = {
  journalRedFlags?: string[];
  medAdherence?: MedAdherenceSnapshotItem[];
};

const buildSymptoms = (answers: CheckInAnswers, context?: CheckInContext): string[] => {
  const symptoms: string[] = [];

  if (answers.vomitingBlood === true) {
    symptoms.push('Vomiting blood or black stools');
  }
  if (answers.severeConfusion === true) {
    symptoms.push('Severe confusion');
  }
  if (answers.fever === true) {
    symptoms.push('Fever');
  }
  if (typeof answers.abdominalPain === 'string' && answers.abdominalPain !== 'none') {
    symptoms.push(`Abdominal pain (${answers.abdominalPain})`);
  }
  if (context?.journalRedFlags?.length) {
    context.journalRedFlags.forEach((flag) => {
      symptoms.push(`Journal red flag: ${flag}`);
    });
  }

  return symptoms;
};

const buildVitals = (answers: CheckInAnswers): Record<string, number | string> => {
  const vitals: Record<string, number | string> = {};

  if (typeof answers.weightChange === 'number') {
    vitals.weightChange = answers.weightChange;
  }

  return vitals;
};

const buildCheckInEntry = (answers: CheckInAnswers, context?: CheckInContext): CheckIn => {
  const createdAt = new Date().toISOString();
  const missedMeds = context?.medAdherence
    ?.filter((med) => med.status === 'missed')
    .map((med) => med.name);

  return {
    id: createId(),
    createdAt,
    symptoms: buildSymptoms(answers, context),
    vitals: buildVitals(answers),
    missedMeds:
      missedMeds && missedMeds.length > 0
        ? missedMeds
        : answers.missedMeds === true
          ? ['Liver-related medications']
          : [],
    notes: typeof answers.notes === 'string' ? answers.notes : undefined,
  };
};

export const loadCheckInHistory = async (): Promise<CheckIn[]> => {
  const { data } = await readStore(checkInStore);
  return data;
};

export const loadTriageHistory = async (): Promise<TriageHistoryEntry[]> => {
  const { data } = await readStore(triageHistoryStore);
  return data;
};

export const appendCheckInHistory = async (
  answers: CheckInAnswers,
  decision: TriageDecision,
  context?: CheckInContext,
): Promise<{ checkIn: CheckIn; triage: TriageHistoryEntry }> => {
  const checkIn = buildCheckInEntry(answers, context);
  const triageEntry: TriageHistoryEntry = {
    id: createId(),
    checkInId: checkIn.id,
    createdAt: checkIn.createdAt,
    level: decision.level,
    rationale: decision.rationale,
    recommendedAction: decision.recommendedAction,
  };

  await updateStore(checkInStore, (entries) => [checkIn, ...entries]);
  await updateStore(triageHistoryStore, (entries) => [triageEntry, ...entries]);

  return { checkIn, triage: triageEntry };
};

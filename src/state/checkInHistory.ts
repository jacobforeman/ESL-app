import { checkInStore, readStore, triageHistoryStore, updateStore } from '../storage';
import { CheckIn, TriageHistoryEntry } from '../storage/types';
import { CheckInAnswers, TriageLevel } from '../types/checkIn';

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const buildSymptoms = (answers: CheckInAnswers): string[] => {
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

  return symptoms;
};

const buildVitals = (answers: CheckInAnswers): Record<string, number | string> => {
  const vitals: Record<string, number | string> = {};

  if (typeof answers.weightChange === 'number') {
    vitals.weightChange = answers.weightChange;
  }

  return vitals;
};

const buildCheckInEntry = (answers: CheckInAnswers): CheckIn => {
  const createdAt = new Date().toISOString();

  return {
    id: createId(),
    createdAt,
    symptoms: buildSymptoms(answers),
    vitals: buildVitals(answers),
    missedMeds: answers.missedMeds === true ? ['Liver-related medications'] : [],
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
  result: TriageLevel,
): Promise<{ checkIn: CheckIn; triage: TriageHistoryEntry }> => {
  const checkIn = buildCheckInEntry(answers);
  const triageEntry: TriageHistoryEntry = {
    id: createId(),
    checkInId: checkIn.id,
    createdAt: checkIn.createdAt,
    level: result,
    rationale: [],
  };

  await updateStore(checkInStore, (entries) => [checkIn, ...entries]);
  await updateStore(triageHistoryStore, (entries) => [triageEntry, ...entries]);

  return { checkIn, triage: triageEntry };
};

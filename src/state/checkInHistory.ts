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
  if (answers.shortnessOfBreath === true) {
    symptoms.push('Shortness of breath');
  }
  if (answers.fever === true) {
    symptoms.push('Fever');
  }
  if (typeof answers.abdominalPain === 'string' && answers.abdominalPain !== 'none') {
    symptoms.push(`Abdominal pain (${answers.abdominalPain})`);
  }
  if (answers.jaundiceWorsening === true) {
    symptoms.push('Worsening jaundice');
  }
  if (answers.ascitesWorsening === true) {
    symptoms.push('Worsening ascites');
  }
  if (answers.edemaWorsening === true) {
    symptoms.push('Worsening edema');
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

  if (typeof answers.temperatureC === 'number') {
    vitals.temperatureC = answers.temperatureC;
  }
  if (typeof answers.heartRate === 'number') {
    vitals.heartRate = answers.heartRate;
  }
  if (typeof answers.systolicBP === 'number') {
    vitals.systolicBP = answers.systolicBP;
  }
  if (typeof answers.diastolicBP === 'number') {
    vitals.diastolicBP = answers.diastolicBP;
  }
  if (typeof answers.oxygenSat === 'number') {
    vitals.oxygenSat = answers.oxygenSat;
  }
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
    reportedAt: typeof answers.checkInTimestamp === 'string' ? answers.checkInTimestamp : undefined,
    symptoms: buildSymptoms(answers, context),
    vitals: buildVitals(answers),
    missedMeds:
      missedMeds && missedMeds.length > 0
        ? missedMeds
        : answers.missedMeds === true
          ? [
              typeof answers.missedMedsDetail === 'string' && answers.missedMedsDetail.trim()
                ? answers.missedMedsDetail.trim()
                : 'Liver-related medications',
            ]
          : [],
    notes: typeof answers.notes === 'string' ? answers.notes : undefined,
    caregiverNotes:
      typeof answers.caregiverNotes === 'string' && answers.caregiverNotes.trim()
        ? answers.caregiverNotes.trim()
        : undefined,
    schemaVersion: 2,
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
    ruleIds: decision.ruleIds,
    recommendedAction: decision.recommendedAction,
    inputSnapshot: {
      answers,
      medAdherence: context?.medAdherence ?? [],
      journalRedFlags: context?.journalRedFlags ?? [],
    },
    schemaVersion: 2,
  };

  await updateStore(checkInStore, (entries) => [checkIn, ...entries]);
  await updateStore(triageHistoryStore, (entries) => [triageEntry, ...entries]);

  return { checkIn, triage: triageEntry };
};

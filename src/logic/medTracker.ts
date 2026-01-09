import { medAdherenceStore, medConfigStore, readStore, updateStore } from '../storage';
import { MedAdherenceEntry, MedConfig, MedConfigItem } from '../storage/types';
import { MedAdherenceSnapshotItem, MedAdherenceStatus } from '../types/meds';

const todayKey = (date = new Date()): string => date.toISOString().slice(0, 10);

export const addMedication = async (med: MedConfigItem): Promise<MedConfig> => {
  return updateStore(medConfigStore, (current) => ({
    ...current,
    meds: [...current.meds, med],
    updatedAt: new Date().toISOString(),
  }));
};

export const recordDose = async (entry: MedAdherenceEntry): Promise<MedAdherenceEntry[]> => {
  return updateStore(medAdherenceStore, (entries) => [...entries, entry]);
};

export const getTodayAdherence = async (date = new Date()): Promise<MedAdherenceEntry[]> => {
  const { data } = await readStore(medAdherenceStore);
  const key = todayKey(date);
  return data.filter((entry) => entry.date === key);
};

export const summarizeAdherence = async (date = new Date()): Promise<{ taken: number; missed: number }> => {
  const entries = await getTodayAdherence(date);
  return entries.reduce(
    (acc, entry) => {
      if (entry.taken) {
        acc.taken += 1;
      } else {
        acc.missed += 1;
      }
      return acc;
    },
    { taken: 0, missed: 0 },
  );
};

const isCriticalMed = (med: MedConfigItem): boolean =>
  Boolean(med.critical) || med.name.toLowerCase().includes('lactulose');

const resolveStatus = (entries: MedAdherenceEntry[]): MedAdherenceStatus => {
  if (entries.length === 0) {
    return 'unknown';
  }

  if (entries.some((entry) => !entry.taken)) {
    return 'missed';
  }

  return 'taken';
};

export const getTodayAdherenceSnapshot = async (date = new Date()): Promise<MedAdherenceSnapshotItem[]> => {
  const [configEnvelope, adherenceEnvelope] = await Promise.all([
    readStore(medConfigStore),
    readStore(medAdherenceStore),
  ]);
  const key = todayKey(date);
  const entries = adherenceEnvelope.data.filter((entry) => entry.date === key);

  return configEnvelope.data.meds.map((med) => {
    const medEntries = entries.filter((entry) => entry.medId === med.id);
    return {
      medId: med.id,
      name: med.name,
      dose: med.dose,
      status: resolveStatus(medEntries),
      isCritical: isCriticalMed(med),
    };
  });
};

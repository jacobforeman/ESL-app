import { medAdherenceStore, medConfigStore, readStore, updateStore } from '../storage';
import { MedAdherenceEntry, MedConfig, MedConfigItem } from '../storage/types';

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

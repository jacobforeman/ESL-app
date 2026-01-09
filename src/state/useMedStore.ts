import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type DoseStatus = 'taken' | 'missed' | 'unknown';

export type MedicationDefinition = {
  id: string;
  name: string;
  critical: boolean;
};

export type DailyAdherence = Record<string, DoseStatus>;
export type AdherenceHistory = Record<string, DailyAdherence>;

export type MedStoreState = {
  meds: MedicationDefinition[];
  dailyAdherence: DailyAdherence;
  history: AdherenceHistory;
  markDoseTaken: (id: string, date?: Date | string) => void;
  markDoseMissed: (id: string, date?: Date | string) => void;
  markDoseUnknown: (id: string, date?: Date | string) => void;
  resetDaily: (date?: Date | string) => void;
};

const todayKey = (date: Date | string = new Date()): string =>
  typeof date === 'string' ? date : date.toISOString().slice(0, 10);

const buildDailyAdherence = (
  meds: MedicationDefinition[],
  existing?: DailyAdherence,
): DailyAdherence => {
  return meds.reduce<DailyAdherence>((acc, med) => {
    acc[med.id] = existing?.[med.id] ?? 'unknown';
    return acc;
  }, {});
};

export const initialMedStoreState = {
  meds: [] as MedicationDefinition[],
  dailyAdherence: {} as DailyAdherence,
  history: {} as AdherenceHistory,
};

const updateDoseStatus = (
  set: (partial: MedStoreState | Partial<MedStoreState> | ((state: MedStoreState) => MedStoreState | Partial<MedStoreState>)) => void,
  get: () => MedStoreState,
  id: string,
  status: DoseStatus,
  date?: Date | string,
) => {
  const dateKey = todayKey(date ?? new Date());
  const isToday = dateKey === todayKey();

  set((state) => {
    const existing = state.history[dateKey];
    const dayHistory = {
      ...buildDailyAdherence(state.meds, existing),
      [id]: status,
    };

    return {
      history: {
        ...state.history,
        [dateKey]: dayHistory,
      },
      dailyAdherence: isToday ? dayHistory : state.dailyAdherence,
    };
  });
};

export const useMedStore = create<MedStoreState>()(
  persist(
    (set, get) => ({
      ...initialMedStoreState,
      markDoseTaken: (id, date) => updateDoseStatus(set, get, id, 'taken', date),
      markDoseMissed: (id, date) => updateDoseStatus(set, get, id, 'missed', date),
      markDoseUnknown: (id, date) => updateDoseStatus(set, get, id, 'unknown', date),
      resetDaily: (date) => {
        const dateKey = todayKey(date ?? new Date());
        const dailyAdherence = buildDailyAdherence(
          get().meds,
          get().history[dateKey],
        );

        set((state) => ({
          dailyAdherence,
          history: {
            ...state.history,
            [dateKey]: dailyAdherence,
          },
        }));
      },
    }),
    {
      name: 'esl.medTracker',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        meds: state.meds,
        history: state.history,
      }),
    },
  ),
);

export const selectTodayAdherence = (state: MedStoreState, date: Date | string = new Date()): DailyAdherence => {
  const dateKey = todayKey(date);
  return dateKey === todayKey() ? state.dailyAdherence : state.history[dateKey] ?? {};
};

export const selectHistoryForDate = (state: MedStoreState, date: Date | string): DailyAdherence => {
  const dateKey = todayKey(date);
  return state.history[dateKey] ?? {};
};

export const selectHistory = (state: MedStoreState): AdherenceHistory => state.history;

export const getTodaySnapshot = (date?: Date | string): DailyAdherence =>
  selectTodayAdherence(useMedStore.getState(), date ?? new Date());

export const getHistorySnapshot = (): AdherenceHistory => useMedStore.getState().history;

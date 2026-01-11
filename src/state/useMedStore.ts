import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DoseStatus = 'taken' | 'missed' | 'unknown';

export type MedItem = {
  id: string;
  name: string;
  critical?: boolean;
};

export type MedStoreState = {
  meds: MedItem[];
  history: Record<string, Record<string, DoseStatus>>;
  resetDaily: (date: string) => void;
  markDoseTaken: (medId: string, date: string) => void;
  markDoseMissed: (medId: string, date: string) => void;
  markDoseUnknown: (medId: string, date: string) => void;
};

export const initialMedStoreState: Pick<MedStoreState, 'meds' | 'history'> = {
  meds: [],
  history: {},
};

const updateStatus = (state: MedStoreState, medId: string, date: string, status: DoseStatus) => {
  const historyForDate = state.history[date] ?? {};
  return {
    history: {
      ...state.history,
      [date]: {
        ...historyForDate,
        [medId]: status,
      },
    },
  };
};

export const useMedStore = create<MedStoreState>()(
  persist(
    (set) => ({
      ...initialMedStoreState,
      resetDaily: (date) =>
        set((state) => ({
          history: {
            ...state.history,
            [date]: {},
          },
        })),
      markDoseTaken: (medId, date) =>
        set((state) => ({
          ...updateStatus(state, medId, date, 'taken'),
        })),
      markDoseMissed: (medId, date) =>
        set((state) => ({
          ...updateStatus(state, medId, date, 'missed'),
        })),
      markDoseUnknown: (medId, date) =>
        set((state) => ({
          ...updateStatus(state, medId, date, 'unknown'),
        })),
    }),
    {
      name: 'esl.medTracker',
      getStorage: () => AsyncStorage,
      partialize: (state) => ({
        meds: state.meds,
        history: state.history,
      }),
    },
  ),
);

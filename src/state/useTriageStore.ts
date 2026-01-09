import { create } from "zustand";

import { TriageResult } from "../logic/TriageEngine";

type TriageState = {
  result: TriageResult | null;
  setResult: (result: TriageResult) => void;
  clearResult: () => void;
};

export const useTriageStore = create<TriageState>((set) => ({
  result: null,
  setResult: (result) => set({ result }),
  clearResult: () => set({ result: null }),
}));

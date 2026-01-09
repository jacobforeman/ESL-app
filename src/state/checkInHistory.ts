import AsyncStorage from '@react-native-async-storage/async-storage';

import { CheckInAnswers, CheckInHistoryEntry, TriageLevel } from '../types/checkIn';

const STORAGE_KEY = 'checkInHistory';

export const loadCheckInHistory = async (): Promise<CheckInHistoryEntry[]> => {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as CheckInHistoryEntry[];
  } catch (error) {
    console.warn('Unable to parse check-in history.', error);
    return [];
  }
};

export const saveCheckInHistory = async (entries: CheckInHistoryEntry[]) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const appendCheckInHistory = async (
  answers: CheckInAnswers,
  result: TriageLevel
): Promise<CheckInHistoryEntry> => {
  const entry: CheckInHistoryEntry = {
    id: `${Date.now()}`,
    timestamp: new Date().toISOString(),
    answers,
    result,
  };

  const history = await loadCheckInHistory();
  const nextHistory = [entry, ...history];
  await saveCheckInHistory(nextHistory);
  return entry;
};

import AsyncStorage from '@react-native-async-storage/async-storage';

type StorageEntry = {
  id: string;
  timestamp: string;
};

export type CheckIn = StorageEntry & {
  symptoms?: string[];
  notes?: string;
  [key: string]: unknown;
};

export type TriageResult = StorageEntry & {
  level: 'Emergency' | 'Urgent' | 'Routine' | 'Self-monitor';
  summary: string;
  [key: string]: unknown;
};

export type CheckInInput = Omit<CheckIn, keyof StorageEntry> & Partial<StorageEntry>;
export type TriageResultInput = Omit<TriageResult, keyof StorageEntry> & Partial<StorageEntry>;

const STORAGE_VERSION = 'v1';
const CHECK_IN_KEY = `esl:${STORAGE_VERSION}:checkins`;
const TRIAGE_KEY = `esl:${STORAGE_VERSION}:triage-results`;

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const parseHistory = <T>(value: string | null): T[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const loadCheckInHistory = async (): Promise<CheckIn[]> => {
  const stored = await AsyncStorage.getItem(CHECK_IN_KEY);
  return parseHistory<CheckIn>(stored);
};

export const loadTriageHistory = async (): Promise<TriageResult[]> => {
  const stored = await AsyncStorage.getItem(TRIAGE_KEY);
  return parseHistory<TriageResult>(stored);
};

export const saveCheckIn = async (checkIn: CheckInInput): Promise<CheckIn> => {
  const history = await loadCheckInHistory();
  const entry: CheckIn = {
    ...(checkIn as CheckIn),
    id: checkIn.id ?? createId(),
    timestamp: checkIn.timestamp ?? new Date().toISOString(),
  };
  const updated = [...history, entry];
  await AsyncStorage.setItem(CHECK_IN_KEY, JSON.stringify(updated));
  return entry;
};

export const saveTriageResult = async (result: TriageResultInput): Promise<TriageResult> => {
  const history = await loadTriageHistory();
  const entry: TriageResult = {
    ...(result as TriageResult),
    id: result.id ?? createId(),
    timestamp: result.timestamp ?? new Date().toISOString(),
  };
  const updated = [...history, entry];
  await AsyncStorage.setItem(TRIAGE_KEY, JSON.stringify(updated));
  return entry;
};

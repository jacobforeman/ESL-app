import { journalStore, journalSummaryStore, readStore, updateStore } from '../storage';
import { JournalEntry, JournalSummaryEntry } from '../storage/types';
import { scanTextForRedFlags } from './redFlags';

export const scanJournalForRedFlags = (text: string): string[] => scanTextForRedFlags(text);

export const addJournalEntry = async (entry: JournalEntry): Promise<JournalEntry> => {
  const redFlags = scanJournalForRedFlags(
    [entry.text, entry.caregiverNotes].filter(Boolean).join(' '),
  );
  const enriched: JournalEntry = {
    ...entry,
    redFlags: redFlags.length > 0 ? redFlags : undefined,
  };

  await updateStore(journalStore, (entries) => [enriched, ...entries]);
  return enriched;
};

export const loadJournalEntries = async (): Promise<JournalEntry[]> => {
  const { data } = await readStore(journalStore);
  return data;
};

export const getJournalEntriesForRange = async (days: number): Promise<JournalEntry[]> => {
  const { data } = await readStore(journalStore);
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return data.filter((entry) => {
    const createdAt = new Date(entry.createdAt).getTime();
    return !Number.isNaN(createdAt) && createdAt >= cutoff;
  });
};

export const saveJournalSummary = async (entry: JournalSummaryEntry): Promise<void> => {
  await updateStore(journalSummaryStore, (entries) => [entry, ...entries]);
};

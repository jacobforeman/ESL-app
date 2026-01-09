import { journalStore, updateStore } from '../storage';
import { JournalEntry } from '../storage/types';

const RED_FLAG_KEYWORDS = [
  'vomited blood',
  'throwing up blood',
  'black stool',
  'bloody stool',
  'confusion',
  'severe abdominal pain',
  'severe belly pain',
  'high fever',
  'cannot wake',
  'passing out',
  'shortness of breath',
];

const normalize = (value: string): string => value.toLowerCase();

export const scanJournalForRedFlags = (text: string): string[] => {
  const normalized = normalize(text);
  return RED_FLAG_KEYWORDS.filter((keyword) => normalized.includes(keyword));
};

export const addJournalEntry = async (entry: JournalEntry): Promise<JournalEntry> => {
  const redFlags = scanJournalForRedFlags(entry.text);
  const enriched: JournalEntry = {
    ...entry,
    redFlags: redFlags.length > 0 ? redFlags : undefined,
  };

  await updateStore(journalStore, (entries) => [enriched, ...entries]);
  return enriched;
};

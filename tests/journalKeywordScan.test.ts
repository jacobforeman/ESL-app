import { scanJournalForRedFlags } from '../src/logic/journal';

describe('scanJournalForRedFlags', () => {
  it('detects red flag keywords in free text', () => {
    const text = 'Patient reported vomited blood and severe abdominal pain last night.';
    const matches = scanJournalForRedFlags(text);

    expect(matches).toEqual(['vomited blood', 'severe abdominal pain']);
  });

  it('returns empty array when no red flags are found', () => {
    const matches = scanJournalForRedFlags('Feeling ok today with stable appetite.');
    expect(matches).toEqual([]);
  });
});

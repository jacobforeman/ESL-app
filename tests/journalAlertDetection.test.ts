import { scanJournalForRedFlags } from '../src/logic/journal';

describe('journal alert detection', () => {
  it('flags red flag phrases for alerts', () => {
    const matches = scanJournalForRedFlags('Patient has shortness of breath and confusion.');
    expect(matches).toEqual(['confusion', 'shortness of breath']);
  });
});

import { runTriage } from '../src/logic/triageEngine';

describe('triage red flag handling', () => {
  it('returns emergency when journal red flags are present', () => {
    const result = runTriage({
      answers: {
        vomitingBlood: false,
        severeConfusion: false,
        fever: false,
        abdominalPain: 'none',
        missedMeds: false,
        weightChange: 0,
      },
      journalRedFlags: ['vomited blood'],
    });

    expect(result.level).toBe('emergency');
    expect(result.rationale[0]).toContain('Journal red flags');
  });
});

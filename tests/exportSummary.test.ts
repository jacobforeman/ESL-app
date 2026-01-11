import { buildExportSummary } from '../src/utils/exportSummary';
import { ExportSummaryPayload } from '../src/types/exportSummary';

const baseInput: ExportSummaryPayload = {
  profile: {
    id: 'p1',
    name: 'Alex',
    caregiverMode: 'caregiver',
  },
  checkIns: [
    {
      id: 'c1',
      createdAt: '2024-01-02T00:00:00.000Z',
      symptoms: ['Fever'],
      vitals: { temperatureC: 38.2 },
      missedMeds: [],
    },
  ],
  triageHistory: [
    {
      id: 't1',
      checkInId: 'c1',
      createdAt: '2024-01-02T00:00:00.000Z',
      level: 'urgent',
      rationale: ['test'],
      ruleIds: ['urgent_fever_high'],
    },
  ],
  medAdherence: [],
  journalEntries: [
    {
      id: 'j1',
      createdAt: '2024-01-03T00:00:00.000Z',
      author: 'caregiver',
      text: 'Feeling ok',
      redFlags: ['confusion'],
      tags: ['mood'],
    },
  ],
};

describe('buildExportSummary', () => {
  it('returns structured summary payload', () => {
    const summary = buildExportSummary(baseInput);

    expect(summary.profile.name).toBe('Alex');
    expect(summary.triageResults[0].level).toBe('urgent');
    expect(summary.journalHighlights[0].redFlags).toEqual(['confusion']);
    expect(summary.structuredJson).toContain('triageResults');
  });
});

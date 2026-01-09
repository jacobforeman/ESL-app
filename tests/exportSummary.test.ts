import { buildExportSummary } from '../src/export/summaryGenerator';
import { ExportSummaryInput } from '../src/export/summaryGenerator';

const baseInput: ExportSummaryInput = {
  profile: {
    id: 'p1',
    name: 'Alex',
    caregiverMode: 'caregiver',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  moduleSelection: {
    enabledModules: ['check-ins', 'journal'],
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  checkIns: [],
  triageHistory: [
    {
      id: 't1',
      checkInId: 'c1',
      createdAt: '2024-01-02T00:00:00.000Z',
      level: 'urgent',
      rationale: ['test'],
    },
  ],
  medConfig: {
    meds: [],
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  medAdherence: [],
  journalEntries: [
    {
      id: 'j1',
      createdAt: '2024-01-03T00:00:00.000Z',
      author: 'caregiver',
      text: 'Feeling ok',
      redFlags: ['confusion'],
    },
  ],
};

describe('buildExportSummary', () => {
  it('returns structured summary payload', () => {
    const summary = buildExportSummary(baseInput);

    expect(summary.header.patientName).toBe('Alex');
    expect(summary.triage.latestLevel).toBe('urgent');
    expect(summary.journal.redFlagCount).toBe(1);
    expect(summary.narrative).toContain('Your loved one');
  });
});

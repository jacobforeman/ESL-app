import {
  ExportSummaryPayload,
  ExportSummaryResult,
  JournalHighlight,
  MedicationAdherenceSummary,
  SymptomTrend,
  VitalsTrend,
} from '../types/exportSummary';

const sortByDateDesc = <T extends { createdAt: string }>(items: T[]): T[] =>
  [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

const buildSymptomTrends = (checkIns: ExportSummaryPayload['checkIns']): SymptomTrend[] => {
  const counts = new Map<string, number>();
  checkIns.forEach((checkIn) => {
    checkIn.symptoms.forEach((symptom) => {
      counts.set(symptom, (counts.get(symptom) ?? 0) + 1);
    });
  });
  return Array.from(counts.entries()).map(([symptom, count]) => ({ symptom, count }));
};

const buildVitalsTrends = (checkIns: ExportSummaryPayload['checkIns']): VitalsTrend[] => {
  const metrics: Record<string, number[]> = {};

  checkIns.forEach((checkIn) => {
    Object.entries(checkIn.vitals ?? {}).forEach(([key, value]) => {
      if (typeof value === 'number') {
        metrics[key] = metrics[key] ? [...metrics[key], value] : [value];
      }
    });
  });

  return Object.entries(metrics).map(([metric, values]) => {
    const total = values.reduce((sum, value) => sum + value, 0);
    const average = values.length ? Number((total / values.length).toFixed(1)) : undefined;
    const min = values.length ? Math.min(...values) : undefined;
    const max = values.length ? Math.max(...values) : undefined;
    return { metric, average, min, max };
  });
};

const buildMedicationAdherence = (
  entries: ExportSummaryPayload['medAdherence'],
  days = 7,
): MedicationAdherenceSummary => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));
  const startKey = start.toISOString().slice(0, 10);
  const endKey = end.toISOString().slice(0, 10);

  const recent = entries.filter((entry) => entry.date >= startKey && entry.date <= endKey);
  const taken = recent.filter((entry) => entry.taken).length;
  const missed = recent.filter((entry) => !entry.taken).length;
  const total = taken + missed;
  const percentage = total === 0 ? 0 : Math.round((taken / total) * 100);

  return { startDate: startKey, endDate: endKey, taken, missed, percentage };
};

const buildJournalHighlights = (
  entries: ExportSummaryPayload['journalEntries'],
): JournalHighlight[] => {
  const sorted = sortByDateDesc(entries);
  const latest = sorted.slice(0, 3);
  const redFlags = sorted.filter((entry) => entry.redFlags?.length).slice(0, 3);
  const combined = [...latest, ...redFlags];
  const unique = new Map<string, JournalHighlight>();

  combined.forEach((entry) => {
    unique.set(entry.id, {
      id: entry.id,
      createdAt: entry.createdAt,
      author: entry.author,
      text: entry.text,
      redFlags: entry.redFlags,
      tags: entry.tags,
      caregiverNotes: entry.caregiverNotes,
    });
  });

  return Array.from(unique.values());
};

export const buildExportSummary = (payload: ExportSummaryPayload, triageLimit = 7): ExportSummaryResult => {
  const generatedAt = new Date().toISOString();
  const triageResults = sortByDateDesc(payload.triageHistory).slice(0, triageLimit);
  const symptomTrends = buildSymptomTrends(payload.checkIns);
  const vitalsTrends = buildVitalsTrends(payload.checkIns);
  const medicationAdherence = buildMedicationAdherence(payload.medAdherence, 7);
  const journalHighlights = buildJournalHighlights(payload.journalEntries);

  const summary = {
    generatedAt,
    profile: payload.profile,
    triageResults,
    symptomTrends,
    vitalsTrends,
    medicationAdherence,
    journalHighlights,
  };

  return {
    ...summary,
    structuredJson: JSON.stringify(summary, null, 2),
  };
};

import {
  ExportSummaryPayload,
  ExportSummaryResult,
  ExportSummaryTriageResult,
  MedAdherenceSnapshot,
} from '../types/exportSummary';

const formatList = (items: string[], emptyLabel: string): string =>
  items.length ? items.join(', ') : emptyLabel;

const formatVitals = (vitals: Record<string, number | string>): string => {
  const entries = Object.entries(vitals).map(([key, value]) => `${key}: ${value}`);
  return formatList(entries, 'No vitals recorded');
};

const formatAdherence = (snapshot: MedAdherenceSnapshot): string => {
  const total = snapshot.takenCount + snapshot.missedCount;
  if (!snapshot.entries.length || total === 0) {
    return `No adherence entries recorded for ${snapshot.date}.`;
  }
  return `${snapshot.takenCount}/${total} doses taken (${snapshot.missedCount} missed) on ${snapshot.date}.`;
};

const triageRecommendation = (triage: ExportSummaryTriageResult): string => {
  switch (triage.level) {
    case 'emergency':
      return 'Seek emergency care or call emergency services immediately.';
    case 'urgent':
      return 'Contact the care team as soon as possible for further guidance.';
    case 'routine':
      return 'Follow up with the care team during regular hours.';
    case 'self-monitor':
      return 'Continue monitoring symptoms and follow the current care plan.';
    default:
      return 'Follow the care team recommendations.';
  }
};

export const buildExportSummary = (input: ExportSummaryPayload): ExportSummaryResult => {
  const { profile, lastCheckIn, triageResult, medsAdherenceSnapshot } = input;
  const caregiverLabel =
    profile.caregiverMode === 'caregiver' ? 'Caregiver-reported' : 'Patient-reported';

  const symptoms = formatList(lastCheckIn.symptoms, 'No symptoms reported');
  const missedMeds = formatList(lastCheckIn.missedMeds, 'No missed medications');
  const vitals = formatVitals(lastCheckIn.vitals);
  const triageRationale = formatList(triageResult.rationale, 'No triage rationale recorded');
  const adherenceSummary = formatAdherence(medsAdherenceSnapshot);

  const situation = `Situation: ${profile.name} completed a check-in on ${lastCheckIn.createdAt}. Triage level: ${triageResult.level}.`;
  const background = `Background: ${caregiverLabel} update. Symptoms: ${symptoms}. Vitals: ${vitals}. Missed meds: ${missedMeds}.`;
  const assessment = `Assessment: ${triageRationale} Medication adherence: ${adherenceSummary}`;
  const recommendation = `Recommendation: ${triageRecommendation(triageResult)}`;

  const sbar = [situation, background, assessment, recommendation].join('\n');

  return {
    summary: {
      profile,
      lastCheckIn,
      triageResult,
      medsAdherenceSnapshot,
    },
    sbar,
  };
};

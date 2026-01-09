import { TriageInput, TriageLevel } from '../types/checkIn';

export const runTriage = ({ answers, medAdherence }: TriageInput): TriageLevel => {
  const vomitingBlood = answers.vomitingBlood === true;
  const severeConfusion = answers.severeConfusion === true;
  const fever = answers.fever === true;
  const abdominalPain = answers.abdominalPain;
  const missedMeds = answers.missedMeds === true;
  const weightChange = typeof answers.weightChange === 'number' ? answers.weightChange : 0;
  const criticalMissed = medAdherence?.some((med) => med.isCritical && med.status === 'missed') ?? false;

  if (vomitingBlood || severeConfusion) {
    return 'emergency';
  }

  if (fever && abdominalPain === 'severe') {
    return 'emergency';
  }

  if (criticalMissed || fever || abdominalPain === 'moderate' || weightChange >= 5) {
    return 'urgent';
  }

  if (missedMeds || abdominalPain === 'mild') {
    return 'routine';
  }

  return 'self-monitor';
};

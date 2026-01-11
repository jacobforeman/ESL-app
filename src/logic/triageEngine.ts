import { evaluateTriage } from '../modules/core/triageEngine';
import type { CheckIn } from '../modules/core/validationSchemas';
import { TriageDecision, TriageInput } from '../types/checkIn';

const poundsToKg = (value: number): number => value * 0.453592;

const normalizeFlags = (flags: string[] | undefined): Set<string> =>
  new Set((flags ?? []).map((flag) => flag.toLowerCase()));

const buildCheckIn = (input: TriageInput): CheckIn => {
  const { answers, medAdherence } = input;
  const redFlags = normalizeFlags(input.journalRedFlags);

  const hasRedFlag = (...candidates: string[]) =>
    candidates.some((flag) => redFlags.has(flag.toLowerCase()));

  const severeAbdominalPain =
    answers.abdominalPain === 'severe' ||
    hasRedFlag('severe abdominal pain', 'severe belly pain');
  const abdominalPain =
    severeAbdominalPain ||
    (typeof answers.abdominalPain === 'string' && answers.abdominalPain !== 'none');
  const vomitingBlood =
    answers.vomitingBlood === true || hasRedFlag('vomited blood', 'throwing up blood');
  const blackTarryStools = hasRedFlag('black stool', 'bloody stool');
  const fever = answers.fever === true || hasRedFlag('high fever');
  const missedCritical =
    medAdherence?.some((med) => med.isCritical && med.status === 'missed') ?? false;
  const missedLactulose = answers.missedMeds === true || missedCritical;

  const confusionLevel = answers.severeConfusion
    ? 'severe'
    : hasRedFlag('confusion')
      ? 'mild'
      : 'none';

  const weightChange =
    typeof answers.weightChange === 'number' && answers.weightChange > 0
      ? poundsToKg(answers.weightChange)
      : undefined;

  return {
    timestamp: new Date().toISOString(),
    symptoms: {
      vomitingBlood,
      blackTarryStools,
      severeAbdominalPain,
      abdominalPain,
      confusionLevel,
      shortnessOfBreath: false,
      jaundiceWorsening: false,
      edemaWorsening: false,
      ascitesWorsening: false,
      fever,
      missedLactulose,
    },
    vitals: undefined,
    weightGainKgLast24h: weightChange,
  };
};

export const runTriage = (input: TriageInput): TriageDecision => {
  const journalRedFlags = input.journalRedFlags ?? [];
  if (journalRedFlags.length > 0) {
    return {
      level: 'emergency',
      rationale: [
        'Journal red flags were detected during the last 24 hours.',
        ...journalRedFlags.map((flag) => `Reported: ${flag}`),
      ],
      recommendedAction: 'Call emergency services or go to the nearest ER now.',
    };
  }

  const checkIn = buildCheckIn(input);
  const result = evaluateTriage(checkIn);
  const reasons = result.reasons.length ? result.reasons : ['No concerning ESLD symptoms reported today.'];

  if (result.level === 'emergency') {
    return {
      level: 'emergency',
      rationale: reasons,
      recommendedAction: result.recommendedAction || 'Call emergency services or go to the nearest ER now.',
    };
  }

  if (result.level === 'urgent' || result.level === 'routine') {
    return {
      level: 'urgent',
      rationale: reasons,
      recommendedAction: 'Contact your transplant or liver clinic within 24 hours.',
    };
  }

  return {
    level: 'self-monitor',
    rationale: reasons,
    recommendedAction: 'Continue monitoring and complete your next check-in as scheduled.',
  };
};

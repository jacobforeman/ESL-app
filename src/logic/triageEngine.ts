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
  const checkIn = buildCheckIn(input);
  const result = evaluateTriage(checkIn);

  return {
    level: result.level,
    rationale: result.reasons,
    recommendedAction: result.recommendedAction,
  };
};

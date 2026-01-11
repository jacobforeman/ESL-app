import { evaluateTriage } from '../modules/core/triageEngine';
import { CheckIn } from '../modules/core/validationSchemas';
import { TriageInput, TriageLevel } from '../types/checkIn';

export type TriageDecision = {
  level: TriageLevel;
  rationale: string[];
  recommendedAction: string;
};

const poundsToKg = (value: number): number => value * 0.453592;

const buildCheckIn = (answers: TriageInput['answers']): CheckIn => {
  const abdominalPain = answers.abdominalPain;
  const severeAbdominalPain = abdominalPain === 'severe';
  const hasAbdominalPain = typeof abdominalPain === 'string' && abdominalPain !== 'none';
  const weightChange = typeof answers.weightChange === 'number' ? answers.weightChange : 0;

  return {
    timestamp: new Date().toISOString(),
    symptoms: {
      vomitingBlood: answers.vomitingBlood === true,
      blackTarryStools: answers.vomitingBlood === true,
      severeAbdominalPain,
      abdominalPain: hasAbdominalPain,
      confusionLevel: answers.severeConfusion === true ? 'severe' : 'none',
      shortnessOfBreath: false,
      jaundiceWorsening: false,
      edemaWorsening: false,
      ascitesWorsening: false,
      fever: answers.fever === true,
      missedLactulose: answers.missedMeds === true,
    },
    vitals: undefined,
    weightGainKgLast24h: weightChange > 0 ? poundsToKg(weightChange) : undefined,
  };
};

export const runTriage = ({ answers, medAdherence, journalRedFlags }: TriageInput): TriageDecision => {
  const checkIn = buildCheckIn(answers);
  const result = evaluateTriage({
    ...checkIn,
    medAdherence,
    journalRedFlags,
  });

  return {
    level: result.level,
    rationale: result.reasons,
    recommendedAction: result.recommendedAction,
  };
};

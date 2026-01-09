export type TriageLevel = 'EMERGENCY' | 'URGENT' | 'ROUTINE' | 'SELF_MONITOR';

export type Unknownable<T> = T | 'unknown' | null | undefined;

export interface CheckIn {
  symptoms: {
    vomitingBlood?: Unknownable<boolean>;
    blackTarryStools?: Unknownable<boolean>;
    severeConfusionOrUnresponsive?: Unknownable<boolean>;
    severeShortnessOfBreath?: Unknownable<boolean>;
    chestPain?: Unknownable<boolean>;
    abdominalPain?: Unknownable<'none' | 'mild' | 'moderate' | 'severe'>;
    rapidAbdominalDistension?: Unknownable<boolean>;
    breathingDifficulty?: Unknownable<boolean>;
    urineOutput?: Unknownable<'normal' | 'reduced' | 'none'>;
    faintingOrCollapse?: Unknownable<boolean>;
  };
  vitals?: {
    temperatureF?: Unknownable<number>;
  };
}

export interface PatientProfile {
  id?: string;
  name?: string;
  hasTIPS?: boolean;
}

export interface TriageResult {
  level: TriageLevel;
  reasons: string[];
  nextSteps: string[];
  recommendedAction: string;
  ruleTriggers: string[];
}

interface Rule {
  id: string;
  level: TriageLevel;
  reasons: string[];
  nextSteps: string[];
  recommendedAction: string;
  predicate: (checkIn: CheckIn, profile?: PatientProfile) => boolean;
}

const isTrue = (value: Unknownable<boolean>): value is true => value === true;

const isNumber = (value: Unknownable<number>): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const hasAbdominalPain = (
  value: Unknownable<'none' | 'mild' | 'moderate' | 'severe'>,
): boolean => value === 'mild' || value === 'moderate' || value === 'severe';

const redFlagRules: Rule[] = [
  {
    id: 'vomiting-blood',
    level: 'EMERGENCY',
    reasons: ['Vomiting blood can signal internal bleeding.'],
    nextSteps: ['Call emergency services or go to the ER immediately.'],
    recommendedAction: 'Seek emergency care now.',
    predicate: (checkIn) => isTrue(checkIn.symptoms.vomitingBlood),
  },
  {
    id: 'black-tarry-stools',
    level: 'EMERGENCY',
    reasons: ['Black or tarry stools can indicate gastrointestinal bleeding.'],
    nextSteps: ['Call emergency services or go to the ER immediately.'],
    recommendedAction: 'Seek emergency care now.',
    predicate: (checkIn) => isTrue(checkIn.symptoms.blackTarryStools),
  },
  {
    id: 'severe-confusion',
    level: 'EMERGENCY',
    reasons: ['Severe confusion or unresponsiveness is a medical emergency.'],
    nextSteps: ['Call emergency services right away.'],
    recommendedAction: 'Seek emergency care now.',
    predicate: (checkIn) => isTrue(checkIn.symptoms.severeConfusionOrUnresponsive),
  },
  {
    id: 'severe-shortness-of-breath',
    level: 'EMERGENCY',
    reasons: ['Severe shortness of breath needs immediate evaluation.'],
    nextSteps: ['Call emergency services or go to the ER immediately.'],
    recommendedAction: 'Seek emergency care now.',
    predicate: (checkIn) => isTrue(checkIn.symptoms.severeShortnessOfBreath),
  },
  {
    id: 'chest-pain',
    level: 'EMERGENCY',
    reasons: ['Chest pain can be a sign of a life-threatening emergency.'],
    nextSteps: ['Call emergency services immediately.'],
    recommendedAction: 'Seek emergency care now.',
    predicate: (checkIn) => isTrue(checkIn.symptoms.chestPain),
  },
  {
    id: 'fever-with-abdominal-pain',
    level: 'EMERGENCY',
    reasons: ['Fever with abdominal pain may signal a serious infection.'],
    nextSteps: ['Call emergency services or go to the ER immediately.'],
    recommendedAction: 'Seek emergency care now.',
    predicate: (checkIn) => {
      const temperatureF = checkIn.vitals?.temperatureF;

      return (
        isNumber(temperatureF) &&
        temperatureF >= 100.4 &&
        hasAbdominalPain(checkIn.symptoms.abdominalPain)
      );
    },
  },
  {
    id: 'rapid-distension-breathing-difficulty',
    level: 'EMERGENCY',
    reasons: ['Rapid abdominal distension with breathing difficulty is urgent.'],
    nextSteps: ['Call emergency services or go to the ER immediately.'],
    recommendedAction: 'Seek emergency care now.',
    predicate: (checkIn) =>
      isTrue(checkIn.symptoms.rapidAbdominalDistension) &&
      isTrue(checkIn.symptoms.breathingDifficulty),
  },
  {
    id: 'no-urine-output',
    level: 'EMERGENCY',
    reasons: ['No urine output can indicate kidney failure or dehydration.'],
    nextSteps: ['Call emergency services or go to the ER immediately.'],
    recommendedAction: 'Seek emergency care now.',
    predicate: (checkIn) => checkIn.symptoms.urineOutput === 'none',
  },
  {
    id: 'fainting-or-collapse',
    level: 'EMERGENCY',
    reasons: ['Fainting or collapse requires immediate evaluation.'],
    nextSteps: ['Call emergency services right away.'],
    recommendedAction: 'Seek emergency care now.',
    predicate: (checkIn) => isTrue(checkIn.symptoms.faintingOrCollapse),
  },
];

const urgentRules: Rule[] = [];
const routineRules: Rule[] = [];

const defaultSelfMonitorResult: TriageResult = {
  level: 'SELF_MONITOR',
  reasons: ['No urgent warning signs were detected today.'],
  nextSteps: ['Continue to monitor symptoms and follow your care plan.'],
  recommendedAction: 'Self-monitor and follow your usual care plan.',
  ruleTriggers: [],
};

const evaluateRules = (
  rules: Rule[],
  checkIn: CheckIn,
  profile?: PatientProfile,
): TriageResult | null => {
  const triggered = rules.filter((rule) => rule.predicate(checkIn, profile));

  if (triggered.length === 0) {
    return null;
  }

  const reasons = triggered.flatMap((rule) => rule.reasons);
  const nextSteps = triggered.flatMap((rule) => rule.nextSteps);
  const ruleTriggers = triggered.map((rule) => rule.id);

  return {
    level: triggered[0].level,
    reasons,
    nextSteps,
    recommendedAction: triggered[0].recommendedAction,
    ruleTriggers,
  };
};

export const runTriageEngine = (
  checkIn: CheckIn,
  profile?: PatientProfile,
): TriageResult => {
  const redFlagResult = evaluateRules(redFlagRules, checkIn, profile);
  if (redFlagResult) {
    return redFlagResult;
  }

  const urgentResult = evaluateRules(urgentRules, checkIn, profile);
  if (urgentResult) {
    return urgentResult;
  }

  const routineResult = evaluateRules(routineRules, checkIn, profile);
  if (routineResult) {
    return routineResult;
  }

  return defaultSelfMonitorResult;
};

import { CheckIn, runTriageEngine } from '../src/logic/triageEngine';

const baseCheckIn: CheckIn = {
  symptoms: {
    vomitingBlood: 'unknown',
    blackTarryStools: 'unknown',
    severeConfusionOrUnresponsive: 'unknown',
    severeShortnessOfBreath: 'unknown',
    chestPain: 'unknown',
    abdominalPain: 'unknown',
    rapidAbdominalDistension: 'unknown',
    breathingDifficulty: 'unknown',
    urineOutput: 'unknown',
    faintingOrCollapse: 'unknown',
  },
  vitals: {
    temperatureF: 'unknown',
  },
};

describe('runTriageEngine red flags', () => {
  it.each([
    ['vomiting blood', { symptoms: { vomitingBlood: true } }, 'vomiting-blood'],
    ['black/tarry stools', { symptoms: { blackTarryStools: true } }, 'black-tarry-stools'],
    [
      'severe confusion or unresponsiveness',
      { symptoms: { severeConfusionOrUnresponsive: true } },
      'severe-confusion',
    ],
    [
      'severe shortness of breath',
      { symptoms: { severeShortnessOfBreath: true } },
      'severe-shortness-of-breath',
    ],
    ['chest pain', { symptoms: { chestPain: true } }, 'chest-pain'],
    [
      'fever with abdominal pain',
      {
        vitals: { temperatureF: 101 },
        symptoms: { abdominalPain: 'moderate' },
      },
      'fever-with-abdominal-pain',
    ],
    [
      'rapid abdominal distension with breathing difficulty',
      { symptoms: { rapidAbdominalDistension: true, breathingDifficulty: true } },
      'rapid-distension-breathing-difficulty',
    ],
    ['no urine output', { symptoms: { urineOutput: 'none' } }, 'no-urine-output'],
    ['fainting or collapse', { symptoms: { faintingOrCollapse: true } }, 'fainting-or-collapse'],
  ])('forces EMERGENCY for %s', (_label, patch, trigger) => {
    const checkIn: CheckIn = {
      ...baseCheckIn,
      ...patch,
      symptoms: {
        ...baseCheckIn.symptoms,
        ...patch.symptoms,
      },
      vitals: {
        ...baseCheckIn.vitals,
        ...patch.vitals,
      },
    };

    const result = runTriageEngine(checkIn);

    expect(result.level).toBe('EMERGENCY');
    expect(result.ruleTriggers).toContain(trigger);
  });

  it('does not trigger thresholds for unknown values', () => {
    const checkIn: CheckIn = {
      ...baseCheckIn,
      vitals: { temperatureF: 'unknown' },
      symptoms: { ...baseCheckIn.symptoms, abdominalPain: 'moderate' },
    };

    const result = runTriageEngine(checkIn);

    expect(result.level).toBe('SELF_MONITOR');
    expect(result.ruleTriggers).toHaveLength(0);
  });

  it('does not treat unknown booleans as true', () => {
    const checkIn: CheckIn = {
      ...baseCheckIn,
      symptoms: { ...baseCheckIn.symptoms, vomitingBlood: 'unknown' },
    };

    const result = runTriageEngine(checkIn);

    expect(result.level).toBe('SELF_MONITOR');
    expect(result.ruleTriggers).toHaveLength(0);
  });
});

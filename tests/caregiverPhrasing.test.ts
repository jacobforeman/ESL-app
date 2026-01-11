import { buildCaregiverPhrase } from '../src/utils/caregiverPhrasing';

describe('buildCaregiverPhrase', () => {
  it('uses patient phrasing by default', () => {
    expect(buildCaregiverPhrase('patient', 'reported new symptoms.')).toBe(
      'You reported new symptoms.',
    );
  });

  it('uses caregiver phrasing when in caregiver mode', () => {
    expect(buildCaregiverPhrase('caregiver', 'reported new symptoms.')).toBe(
      'Your care recipient reported new symptoms.',
    );
  });
});

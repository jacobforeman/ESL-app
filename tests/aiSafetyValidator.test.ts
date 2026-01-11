import { validateAiOutput } from '../src/logic/aiSafety';

describe('AI safety validator', () => {
  it('replaces dosing or treatment directives with safe fallback', () => {
    const unsafe = 'You should increase your dose to 20 mg nightly.';
    const safe = validateAiOutput(unsafe);

    expect(safe).toContain('general education');
    expect(safe).toContain('Not medical advice');
  });
});

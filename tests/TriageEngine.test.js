const {
  TRIAGE_LEVELS,
  redFlagChecks,
  evaluateTriage,
} = require("../src/logic/TriageEngine");

describe("TriageEngine", () => {
  test("red flags always return EMERGENCY", () => {
    redFlagChecks.forEach((redFlag) => {
      const baseInput = {
        symptoms: {
          vomitingBlood: false,
          severeConfusion: false,
          fever: false,
          severeAbdominalPain: false,
        },
        medications: {
          missedLactulose: false,
        },
      };

      const input = JSON.parse(JSON.stringify(baseInput));

      if (redFlag.key === "feverWithSevereAbdominalPain") {
        input.symptoms.fever = true;
        input.symptoms.severeAbdominalPain = true;
      } else {
        input.symptoms[redFlag.key] = true;
      }

      const result = evaluateTriage(input);

      expect(result.level).toBe(TRIAGE_LEVELS.EMERGENCY);
    });
  });

  test("missed lactulose with mild confusion returns URGENT", () => {
    const result = evaluateTriage({
      symptoms: { mildConfusion: true },
      medications: { missedLactulose: true },
    });

    expect(result.level).toBe(TRIAGE_LEVELS.URGENT);
  });

  test("mild stable symptoms return ROUTINE", () => {
    const result = evaluateTriage({
      symptoms: { mildSymptoms: true, stable: true },
      medications: { missedLactulose: false },
    });

    expect(result.level).toBe(TRIAGE_LEVELS.ROUTINE);
  });

  test("no symptoms returns SELF_MONITOR", () => {
    const result = evaluateTriage({
      symptoms: {},
      medications: {},
    });

    expect(result.level).toBe(TRIAGE_LEVELS.SELF_MONITOR);
  });
});

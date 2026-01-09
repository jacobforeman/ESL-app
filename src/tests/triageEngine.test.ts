import { evaluateTriage } from "../modules/core/triageEngine";
import { CheckIn } from "../modules/core/validationSchemas";

type CheckInOverrides = Partial<CheckIn> & {
  symptoms?: Partial<CheckIn["symptoms"]>;
  vitals?: Partial<NonNullable<CheckIn["vitals"]>>;
};

const buildCheckIn = (overrides: CheckInOverrides = {}): CheckIn => ({
  timestamp: new Date("2024-01-01T10:00:00.000Z").toISOString(),
  symptoms: {
    vomitingBlood: false,
    blackTarryStools: false,
    severeAbdominalPain: false,
    abdominalPain: false,
    confusionLevel: "none",
    shortnessOfBreath: false,
    jaundiceWorsening: false,
    edemaWorsening: false,
    ascitesWorsening: false,
    fever: false,
    missedLactulose: false,
    ...overrides.symptoms,
  },
  vitals: overrides.vitals,
  weightGainKgLast24h: overrides.weightGainKgLast24h,
});

describe("evaluateTriage", () => {
  it("returns emergency for red flag bleeding symptoms", () => {
    const result = evaluateTriage(
      buildCheckIn({
        symptoms: {
          vomitingBlood: true,
        },
      })
    );

    expect(result.level).toBe("emergency");
    expect(result.reasons).toEqual(
      expect.arrayContaining([
        "Vomiting blood can signal gastrointestinal bleeding.",
      ])
    );
  });

  it("returns urgent for ESLD infection risk and fluid overload", () => {
    const result = evaluateTriage(
      buildCheckIn({
        symptoms: {
          ascitesWorsening: true,
          fever: true,
        },
        vitals: {
          temperatureC: 38.6,
        },
        weightGainKgLast24h: 2.4,
      })
    );

    expect(result.level).toBe("urgent");
    expect(result.reasons).toEqual(
      expect.arrayContaining([
        "Fever in ESLD can signal infection that needs quick follow-up.",
        "Rapid ascites or weight gain suggests fluid overload.",
      ])
    );
  });

  it("returns routine for mild confusion without other red flags", () => {
    const result = evaluateTriage(
      buildCheckIn({
        symptoms: {
          confusionLevel: "mild",
        },
      })
    );

    expect(result.level).toBe("routine");
    expect(result.reasons).toEqual(
      expect.arrayContaining([
        "Mild confusion should be reviewed at the next visit.",
      ])
    );
  });

  it("treats unknown vitals as non-blocking and returns self-monitor", () => {
    const result = evaluateTriage(buildCheckIn());

    expect(result.level).toBe("self-monitor");
    expect(result.reasons).toEqual([
      "No concerning ESLD symptoms reported today.",
    ]);
  });
});

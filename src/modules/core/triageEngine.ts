import { CheckIn, TriageResult } from "./validationSchemas";

type Rule = {
  reason: string;
  isMatch: (checkIn: CheckIn) => boolean;
};

const getTemperatureC = (checkIn: CheckIn): number | undefined =>
  checkIn.vitals?.temperatureC;

const hasFever = (checkIn: CheckIn): boolean => {
  if (checkIn.symptoms.fever) {
    return true;
  }

  const temperatureC = getTemperatureC(checkIn);
  return typeof temperatureC === "number" && temperatureC >= 38;
};

const emergencyRules: Rule[] = [
  {
    reason: "Vomiting blood can signal gastrointestinal bleeding.",
    isMatch: (checkIn) => checkIn.symptoms.vomitingBlood,
  },
  {
    reason: "Black, tarry stools can indicate internal bleeding.",
    isMatch: (checkIn) => checkIn.symptoms.blackTarryStools,
  },
  {
    reason: "Severe confusion is a medical emergency for ESLD patients.",
    isMatch: (checkIn) => checkIn.symptoms.confusionLevel === "severe",
  },
  {
    reason:
      "Severe abdominal pain with fever may indicate spontaneous bacterial peritonitis.",
    isMatch: (checkIn) =>
      checkIn.symptoms.severeAbdominalPain && hasFever(checkIn),
  },
  {
    reason: "Very low oxygen levels require emergency care.",
    isMatch: (checkIn) =>
      typeof checkIn.vitals?.oxygenSat === "number" &&
      checkIn.vitals.oxygenSat < 90,
  },
  {
    reason: "Very low blood pressure can signal shock.",
    isMatch: (checkIn) =>
      typeof checkIn.vitals?.systolicBP === "number" &&
      checkIn.vitals.systolicBP < 90,
  },
];

const urgentRules: Rule[] = [
  {
    reason: "Moderate confusion needs same-day clinician review.",
    isMatch: (checkIn) => checkIn.symptoms.confusionLevel === "moderate",
  },
  {
    reason: "Fever in ESLD can signal infection that needs quick follow-up.",
    isMatch: (checkIn) => {
      const temperatureC = getTemperatureC(checkIn);
      return (
        hasFever(checkIn) &&
        typeof temperatureC === "number" &&
        temperatureC >= 38.3
      );
    },
  },
  {
    reason: "Rapid ascites or weight gain suggests fluid overload.",
    isMatch: (checkIn) =>
      checkIn.symptoms.ascitesWorsening &&
      typeof checkIn.weightGainKgLast24h === "number" &&
      checkIn.weightGainKgLast24h >= 2,
  },
  {
    reason: "Worsening jaundice should be reviewed within 24 hours.",
    isMatch: (checkIn) => checkIn.symptoms.jaundiceWorsening,
  },
  {
    reason: "Missed lactulose with confusion increases encephalopathy risk.",
    isMatch: (checkIn) =>
      checkIn.symptoms.missedLactulose &&
      ["mild", "moderate"].includes(checkIn.symptoms.confusionLevel),
  },
  {
    reason: "Low oxygen saturation needs urgent evaluation.",
    isMatch: (checkIn) => {
      const oxygenSat = checkIn.vitals?.oxygenSat;
      return typeof oxygenSat === "number" && oxygenSat >= 90 && oxygenSat < 92;
    },
  },
  {
    reason: "Fast heart rate can signal decompensation.",
    isMatch: (checkIn) => {
      const heartRate = checkIn.vitals?.heartRate;
      return typeof heartRate === "number" && heartRate >= 110;
    },
  },
];

const routineRules: Rule[] = [
  {
    reason: "Mild confusion should be reviewed at the next visit.",
    isMatch: (checkIn) => checkIn.symptoms.confusionLevel === "mild",
  },
  {
    reason: "Worsening ascites should be discussed at the next appointment.",
    isMatch: (checkIn) => checkIn.symptoms.ascitesWorsening,
  },
  {
    reason: "Worsening edema should be monitored and discussed.",
    isMatch: (checkIn) => checkIn.symptoms.edemaWorsening,
  },
  {
    reason: "Missed lactulose should be addressed with your care team.",
    isMatch: (checkIn) => checkIn.symptoms.missedLactulose,
  },
  {
    reason: "Persistent abdominal discomfort should be mentioned at follow-up.",
    isMatch: (checkIn) => checkIn.symptoms.abdominalPain,
  },
];

const buildResult = (
  level: TriageResult["level"],
  reasons: string[],
  recommendedAction: string
): TriageResult => ({
  level,
  reasons,
  recommendedAction,
});

const applyRules = (rules: Rule[], checkIn: CheckIn): string[] =>
  rules.filter((rule) => rule.isMatch(checkIn)).map((rule) => rule.reason);

export const evaluateTriage = (checkIn: CheckIn): TriageResult => {
  const emergencyReasons = applyRules(emergencyRules, checkIn);
  if (emergencyReasons.length > 0) {
    return buildResult(
      "emergency",
      emergencyReasons,
      "Call emergency services or go to the nearest ER now."
    );
  }

  const urgentReasons = applyRules(urgentRules, checkIn);
  if (urgentReasons.length > 0) {
    return buildResult(
      "urgent",
      urgentReasons,
      "Contact your transplant or liver clinic within 24 hours."
    );
  }

  const routineReasons = applyRules(routineRules, checkIn);
  if (routineReasons.length > 0) {
    return buildResult(
      "routine",
      routineReasons,
      "Discuss these findings at your next appointment."
    );
  }

  return buildResult(
    "self-monitor",
    ["No concerning ESLD symptoms reported today."],
    "Continue monitoring and complete your next check-in as scheduled."
  );
};

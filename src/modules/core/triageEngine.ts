import { CheckIn, TriageResult } from "./validationSchemas";

type Rule = {
  id: string;
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
    id: "emergency_vomiting_blood",
    reason: "Vomiting blood can signal gastrointestinal bleeding.",
    isMatch: (checkIn) => checkIn.symptoms.vomitingBlood,
  },
  {
    id: "emergency_black_tarry_stools",
    reason: "Black, tarry stools can indicate internal bleeding.",
    isMatch: (checkIn) => checkIn.symptoms.blackTarryStools,
  },
  {
    id: "emergency_severe_confusion",
    reason: "Severe confusion is a medical emergency for ESLD patients.",
    isMatch: (checkIn) => checkIn.symptoms.confusionLevel === "severe",
  },
  {
    id: "emergency_abdominal_pain_fever",
    reason:
      "Severe abdominal pain with fever may indicate spontaneous bacterial peritonitis.",
    isMatch: (checkIn) =>
      checkIn.symptoms.severeAbdominalPain && hasFever(checkIn),
  },
  {
    id: "emergency_low_oxygen",
    reason: "Very low oxygen levels require emergency care.",
    isMatch: (checkIn) =>
      typeof checkIn.vitals?.oxygenSat === "number" &&
      checkIn.vitals.oxygenSat < 90,
  },
  {
    id: "emergency_low_bp",
    reason: "Very low blood pressure can signal shock.",
    isMatch: (checkIn) =>
      typeof checkIn.vitals?.systolicBP === "number" &&
      checkIn.vitals.systolicBP < 90,
  },
];

const urgentRules: Rule[] = [
  {
    id: "urgent_moderate_confusion",
    reason: "Moderate confusion needs same-day clinician review.",
    isMatch: (checkIn) => checkIn.symptoms.confusionLevel === "moderate",
  },
  {
    id: "urgent_fever_high",
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
    id: "urgent_weight_gain",
    reason: "Rapid ascites or weight gain suggests fluid overload.",
    isMatch: (checkIn) =>
      checkIn.symptoms.ascitesWorsening &&
      typeof checkIn.weightGainKgLast24h === "number" &&
      checkIn.weightGainKgLast24h >= 2,
  },
  {
    id: "urgent_jaundice",
    reason: "Worsening jaundice should be reviewed within 24 hours.",
    isMatch: (checkIn) => checkIn.symptoms.jaundiceWorsening,
  },
  {
    id: "urgent_missed_lactulose_confusion",
    reason: "Missed lactulose with confusion increases encephalopathy risk.",
    isMatch: (checkIn) =>
      checkIn.symptoms.missedLactulose &&
      ["mild", "moderate"].includes(checkIn.symptoms.confusionLevel),
  },
  {
    id: "urgent_low_oxygen",
    reason: "Low oxygen saturation needs urgent evaluation.",
    isMatch: (checkIn) => {
      const oxygenSat = checkIn.vitals?.oxygenSat;
      return typeof oxygenSat === "number" && oxygenSat >= 90 && oxygenSat < 92;
    },
  },
  {
    id: "urgent_fast_heart_rate",
    reason: "Fast heart rate can signal decompensation.",
    isMatch: (checkIn) => {
      const heartRate = checkIn.vitals?.heartRate;
      return typeof heartRate === "number" && heartRate >= 110;
    },
  },
];

const routineRules: Rule[] = [
  {
    id: "routine_mild_confusion",
    reason: "Mild confusion should be reviewed at the next visit.",
    isMatch: (checkIn) => checkIn.symptoms.confusionLevel === "mild",
  },
  {
    id: "routine_ascites",
    reason: "Worsening ascites should be discussed at the next appointment.",
    isMatch: (checkIn) => checkIn.symptoms.ascitesWorsening,
  },
  {
    id: "routine_edema",
    reason: "Worsening edema should be monitored and discussed.",
    isMatch: (checkIn) => checkIn.symptoms.edemaWorsening,
  },
  {
    id: "routine_missed_lactulose",
    reason: "Missed lactulose should be addressed with your care team.",
    isMatch: (checkIn) => checkIn.symptoms.missedLactulose,
  },
  {
    id: "routine_abdominal_pain",
    reason: "Persistent abdominal discomfort should be mentioned at follow-up.",
    isMatch: (checkIn) => checkIn.symptoms.abdominalPain,
  },
];

const buildResult = (
  level: TriageResult["level"],
  reasons: string[],
  ruleIds: string[],
  recommendedAction: string
): TriageResult => ({
  level,
  reasons,
  ruleIds,
  recommendedAction,
});

const applyRules = (rules: Rule[], checkIn: CheckIn): { reasons: string[]; ruleIds: string[] } =>
  rules.reduce(
    (acc, rule) => {
      if (rule.isMatch(checkIn)) {
        acc.reasons.push(rule.reason);
        acc.ruleIds.push(rule.id);
      }
      return acc;
    },
    { reasons: [], ruleIds: [] } as { reasons: string[]; ruleIds: string[] },
  );

export const evaluateTriage = (checkIn: CheckIn): TriageResult => {
  const emergencyResults = applyRules(emergencyRules, checkIn);
  if (emergencyResults.reasons.length > 0) {
    return buildResult(
      "emergency",
      emergencyResults.reasons,
      emergencyResults.ruleIds,
      "Call emergency services or go to the nearest ER now."
    );
  }

  const urgentResults = applyRules(urgentRules, checkIn);
  if (urgentResults.reasons.length > 0) {
    return buildResult(
      "urgent",
      urgentResults.reasons,
      urgentResults.ruleIds,
      "Contact your transplant or liver clinic within 24 hours."
    );
  }

  const routineResults = applyRules(routineRules, checkIn);
  if (routineResults.reasons.length > 0) {
    return buildResult(
      "routine",
      routineResults.reasons,
      routineResults.ruleIds,
      "Discuss these findings at your next appointment."
    );
  }

  return buildResult(
    "self-monitor",
    ["No concerning ESLD symptoms reported today."],
    [],
    "Continue monitoring and complete your next check-in as scheduled."
  );
};

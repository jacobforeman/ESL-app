import { MedAdherenceSnapshotItem } from "../../types/meds";
import { CheckIn, TriageResult } from "./validationSchemas";

type TriageInput = CheckIn & {
  medAdherence?: MedAdherenceSnapshotItem[];
  journalRedFlags?: string[];
};

type Rule = {
  reason: string;
  isMatch: (checkIn: TriageInput) => boolean;
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

const hasCriticalMissed = (checkIn: TriageInput): boolean =>
  checkIn.medAdherence?.some((med) => med.isCritical && med.status === "missed") ?? false;

const hasMissedMeds = (checkIn: TriageInput): boolean =>
  checkIn.medAdherence?.some((med) => med.status === "missed") ?? false;

const emergencyRedFlags = new Set([
  "vomited blood",
  "throwing up blood",
  "black stool",
  "bloody stool",
  "cannot wake",
  "passing out",
]);

const urgentRedFlags = new Set([
  "confusion",
  "severe abdominal pain",
  "severe belly pain",
  "high fever",
  "shortness of breath",
]);

const hasEmergencyJournalFlags = (checkIn: TriageInput): boolean =>
  checkIn.journalRedFlags?.some((flag) => emergencyRedFlags.has(flag)) ?? false;

const hasUrgentJournalFlags = (checkIn: TriageInput): boolean =>
  checkIn.journalRedFlags?.some((flag) => urgentRedFlags.has(flag)) ?? false;

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
  {
    reason: "Journal notes mention red-flag symptoms like bleeding or loss of consciousness.",
    isMatch: (checkIn) => hasEmergencyJournalFlags(checkIn),
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
  {
    reason: "Missing critical medications can quickly worsen ESLD symptoms.",
    isMatch: (checkIn) => hasCriticalMissed(checkIn),
  },
  {
    reason: "Journal entries mention urgent red-flag symptoms needing same-day review.",
    isMatch: (checkIn) => hasUrgentJournalFlags(checkIn),
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
  {
    reason: "Missed medications should be discussed with your care team.",
    isMatch: (checkIn) => hasMissedMeds(checkIn),
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

const applyRules = (rules: Rule[], checkIn: TriageInput): string[] =>
  rules.filter((rule) => rule.isMatch(checkIn)).map((rule) => rule.reason);

export const evaluateTriage = (checkIn: TriageInput): TriageResult => {
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

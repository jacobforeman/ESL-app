const TRIAGE_LEVELS = {
  EMERGENCY: "EMERGENCY",
  URGENT: "URGENT",
  ROUTINE: "ROUTINE",
  SELF_MONITOR: "SELF_MONITOR",
};

const redFlagChecks = [
  {
    key: "vomitingBlood",
    description: "Vomiting blood",
    predicate: (input) => Boolean(input.symptoms?.vomitingBlood),
  },
  {
    key: "severeConfusion",
    description: "Severe confusion",
    predicate: (input) => Boolean(input.symptoms?.severeConfusion),
  },
  {
    key: "feverWithSevereAbdominalPain",
    description: "Fever with severe abdominal pain",
    predicate: (input) =>
      Boolean(input.symptoms?.fever) &&
      Boolean(input.symptoms?.severeAbdominalPain),
  },
];

const evaluateTriage = (input) => {
  for (const redFlag of redFlagChecks) {
    if (redFlag.predicate(input)) {
      return {
        level: TRIAGE_LEVELS.EMERGENCY,
        reason: redFlag.description,
      };
    }
  }

  if (input.medications?.missedLactulose && input.symptoms?.mildConfusion) {
    return {
      level: TRIAGE_LEVELS.URGENT,
      reason: "Missed lactulose with mild confusion",
    };
  }

  if (input.symptoms?.mildSymptoms && input.symptoms?.stable) {
    return {
      level: TRIAGE_LEVELS.ROUTINE,
      reason: "Mild stable symptoms",
    };
  }

  return {
    level: TRIAGE_LEVELS.SELF_MONITOR,
    reason: "No concerning symptoms",
  };
};

module.exports = {
  TRIAGE_LEVELS,
  redFlagChecks,
  evaluateTriage,
};

export type TriageLevel = "EMERGENCY" | "URGENT" | "ROUTINE" | "SELF_MONITOR";

export type TriageResult = {
  level: TriageLevel;
  reasons: string[];
};

export const runTriage = (answers: Record<string, unknown>): TriageResult => {
  if (answers["emergency"] === true) {
    return {
      level: "EMERGENCY",
      reasons: [
        "Severe confusion or unresponsiveness",
        "Vomiting blood or black stools",
        "Severe abdominal pain with fever",
      ],
    };
  }

  return {
    level: "SELF_MONITOR",
    reasons: ["No urgent red flags detected"],
  };
};

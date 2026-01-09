import {
  DiseaseModule,
  QuestionFlowConfig,
  TriageRuleSet,
} from "../core/ModuleRegistry";

const esldQuestionFlow: QuestionFlowConfig = {
  id: "esld-daily-checkin",
  title: "Daily ESLD Check-In",
  description:
    "Track core ESLD symptoms, vitals, and medication adherence for triage.",
  steps: [
    {
      id: "confusion",
      prompt: "Are you feeling more confused or unusually sleepy today?",
      inputType: "single",
      options: ["No", "Mild", "Moderate", "Severe"],
    },
    {
      id: "bleeding",
      prompt: "Have you vomited blood or noticed black stools?",
      inputType: "boolean",
    },
    {
      id: "abdomen",
      prompt: "How is your abdominal swelling compared to yesterday?",
      inputType: "single",
      options: ["Stable", "Slightly worse", "Much worse"],
    },
    {
      id: "weight",
      prompt: "What is your weight today (lbs)?",
      inputType: "number",
    },
  ],
};

const esldTriageRules: TriageRuleSet = {
  id: "esld-triage-rules",
  title: "ESLD Triage Rules",
  rules: [
    {
      id: "vomiting-blood",
      level: "emergency",
      when: "bleeding is true",
      message: "Vomiting blood or black stools can be life-threatening.",
    },
    {
      id: "severe-confusion",
      level: "urgent",
      when: "confusion is Severe",
      message: "Severe confusion may indicate worsening hepatic encephalopathy.",
    },
    {
      id: "worsening-ascites",
      level: "routine",
      when: "abdomen is Much worse",
      message: "Worsening abdominal swelling should be discussed soon.",
    },
  ],
};

export const esldModule: DiseaseModule = {
  id: "esld",
  name: "End-Stage Liver Disease",
  summary: "Daily ESLD check-ins with cirrhosis-specific triage guidance.",
  questionFlow: esldQuestionFlow,
  triageRules: esldTriageRules,
};

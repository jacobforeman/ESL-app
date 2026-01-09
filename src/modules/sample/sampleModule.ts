import {
  DiseaseModule,
  QuestionFlowConfig,
  TriageRuleSet,
} from "../core/ModuleRegistry";

const sampleQuestionFlow: QuestionFlowConfig = {
  id: "sample-checkin",
  title: "Sample Check-In",
  description: "Placeholder check-in flow for future disease modules.",
  steps: [
    {
      id: "sample-step",
      prompt: "Sample question prompt.",
      inputType: "text",
    },
  ],
};

const sampleTriageRules: TriageRuleSet = {
  id: "sample-triage-rules",
  title: "Sample Triage Rules",
  rules: [
    {
      id: "sample-rule",
      level: "self-monitor",
      when: "always",
      message: "Sample triage guidance.",
    },
  ],
};

export const sampleModule: DiseaseModule = {
  id: "sample",
  name: "Sample Module",
  summary: "Stub module to demonstrate registry wiring.",
  questionFlow: sampleQuestionFlow,
  triageRules: sampleTriageRules,
};

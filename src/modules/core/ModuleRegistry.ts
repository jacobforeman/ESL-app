export type TriageLevel = "emergency" | "urgent" | "routine" | "self-monitor";

export type QuestionFlowStep = {
  id: string;
  prompt: string;
  inputType: "single" | "multi" | "number" | "text" | "boolean";
  options?: string[];
};

export type QuestionFlowConfig = {
  id: string;
  title: string;
  description?: string;
  steps: QuestionFlowStep[];
};

export type TriageRule = {
  id: string;
  level: TriageLevel;
  when: string;
  message: string;
};

export type TriageRuleSet = {
  id: string;
  title: string;
  rules: TriageRule[];
};

export type DiseaseModule = {
  id: string;
  name: string;
  summary: string;
  questionFlow: QuestionFlowConfig;
  triageRules: TriageRuleSet;
};

export type ModuleRegistry = {
  modules: DiseaseModule[];
  getById: (id: string) => DiseaseModule | undefined;
};

import { esldModule } from "../esld/esldModule";
import { sampleModule } from "../sample/sampleModule";

export const moduleRegistry: ModuleRegistry = {
  modules: [esldModule, sampleModule],
  getById: (id) => moduleRegistry.modules.find((module) => module.id === id),
};

export const getModuleIds = (): string[] =>
  moduleRegistry.modules.map((module) => module.id);

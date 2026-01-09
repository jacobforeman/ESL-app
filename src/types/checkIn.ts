export type QuestionType = 'boolean' | 'single-select' | 'number' | 'text';

export type QuestionOption = {
  label: string;
  value: string;
};

export type QuestionDefinition = {
  id: string;
  title: string;
  description?: string;
  type: QuestionType;
  options?: QuestionOption[];
  placeholder?: string;
  min?: number;
  max?: number;
};

export type QuestionFlowConfig = {
  id: string;
  title: string;
  questions: QuestionDefinition[];
};

export type CheckInAnswers = Record<string, boolean | string | number>;

export type TriageLevel = 'emergency' | 'urgent' | 'routine' | 'self-monitor';

export type CheckInHistoryEntry = {
  id: string;
  timestamp: string;
  answers: CheckInAnswers;
  result: TriageLevel;
};

import { z } from 'zod';

import { QuestionDefinition } from '../types/checkIn';

const buildQuestionSchema = (question: QuestionDefinition) => {
  switch (question.type) {
    case 'boolean':
      return z.boolean();
    case 'single-select':
      return z
        .string()
        .refine(
          (value) => (question.options ?? []).some((option) => option.value === value),
          'Select a valid option.'
        );
    case 'number': {
      let schema = z.number().optional();
      if (typeof question.min === 'number') {
        schema = schema.min(question.min, `Must be at least ${question.min}.`);
      }
      if (typeof question.max === 'number') {
        schema = schema.max(question.max, `Must be at most ${question.max}.`);
      }
      return schema;
    }
    case 'text':
      return z.string().optional();
    default:
      return z.never();
  }
};

export const buildCheckInSchema = (questions: QuestionDefinition[]) => {
  const shape: Record<string, z.ZodTypeAny> = {};

  questions.forEach((question) => {
    shape[question.id] = buildQuestionSchema(question);
  });

  return z.object(shape);
};

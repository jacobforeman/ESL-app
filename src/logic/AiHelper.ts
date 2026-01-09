import { AiClientOptions, requestAiCompletion } from './aiClient';

export type AiTask = 'check-in-question' | 'triage-explanation' | 'doctor-message-draft';

const ALLOWED_TASKS: Record<AiTask, string> = {
  'check-in-question':
    'Explain a single check-in question in plain language without adding new questions.',
  'triage-explanation':
    'Explain the triage result in plain language without changing the triage level.',
  'doctor-message-draft':
    'Draft a concise message to a doctor based on provided notes.',
};

const FORBIDDEN_RESPONSE_PATTERNS: RegExp[] = [
  /diagnos(e|is|ing)/i,
  /\byou (have|likely have|might have)\b/i,
  /\btriage\b.*\b(change|upgrade|downgrade|adjust|override)\b/i,
  /\bchange\b.*\btriage\b/i,
  /\b(start|stop|increase|decrease|adjust)\b.*\b(medication|dose|dosage|meds|prescription)\b/i,
  /\b(medication|dose|dosage|meds|prescription)\b.*\b(start|stop|increase|decrease|adjust)\b/i,
];

const FALLBACK_RESPONSE =
  'I can only explain check-in questions, explain the triage result, or draft a doctor message. ' +
  'I cannot diagnose, change triage levels, or suggest medication changes.';

export const isAiEnabled = (): boolean => Boolean(process.env.OPENAI_API_KEY);

export const buildStrictSystemPrompt = (task: AiTask): string => {
  return `You are a health companion for ESLD patients and caregivers.
Allowed tasks (pick only the requested one): ${ALLOWED_TASKS[task]}
- Only explain check-in questions, explain triage results, or draft doctor messages.
- Never diagnose or speculate about a diagnosis.
- Never change, override, or suggest changing the triage level.
- Never suggest starting, stopping, or adjusting medications.
- If asked to do anything outside the allowed tasks, respond with the fallback refusal message.`;
};

export const filterAiResponse = (response: string): string => {
  if (!response) {
    return response;
  }

  const violatesGuardrails = FORBIDDEN_RESPONSE_PATTERNS.some((pattern) => pattern.test(response));
  return violatesGuardrails ? FALLBACK_RESPONSE : response;
};

export const requestStrictAiCompletion = async (
  task: AiTask,
  userPrompt: string,
  options: AiClientOptions,
  context?: string,
): Promise<string> => {
  if (!isAiEnabled()) {
    throw new Error('AI features are disabled because OPENAI_API_KEY is not configured.');
  }

  const systemPrompt = buildStrictSystemPrompt(task);
  const response = await requestAiCompletion(userPrompt, options, context, systemPrompt);
  return filterAiResponse(response);
};

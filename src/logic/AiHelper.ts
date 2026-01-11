import { attachDisclaimer, buildEmergencyBlock, AI_PROMPT_VERSION, isEmergencyInput, validateAiOutput } from './aiSafety';

export type AiTask =
  | 'check-in-question'
  | 'triage-explanation'
  | 'doctor-message-draft'
  | 'journal-summary'
  | 'export-summary';

export const BASE_SYSTEM_PROMPT = `You are a supportive ESLD companion.
- Never provide a diagnosis.
- Never provide treatment instructions or medication changes.
- Provide education, explanation, and reinforcement only.
- If emergency or red-flag symptoms are mentioned, advise seeking emergency care immediately.
- Keep responses short, clear, and calm.
- Always include "Not medical advice" in a footer.`;

export const AI_PROMPT_VERSION_ID = AI_PROMPT_VERSION;

const normalize = (value: string): string => value.toLowerCase();

const API_KEY = process.env.EXPO_PUBLIC_AI_API_KEY;
const useMockAi = !API_KEY;

const detectTriageLevel = (
  content: string,
): 'emergency' | 'urgent' | 'routine' | 'self-monitor' | null => {
  const normalized = normalize(content);
  if (normalized.includes('emergency')) return 'emergency';
  if (normalized.includes('urgent')) return 'urgent';
  if (normalized.includes('routine')) return 'routine';
  if (normalized.includes('self-monitor') || normalized.includes('self monitor')) return 'self-monitor';
  return null;
};

const buildEmergencyReminder = (): string =>
  'If these symptoms are happening now, seek emergency care immediately or call local emergency services.';

const buildCheckInResponse = (prompt: string): string => {
  const trimmed = prompt.trim();
  const base = trimmed
    ? `Here is a plain-language explanation of the check-in question: "${trimmed}".`
    : 'Here is a plain-language explanation of the check-in question you shared.';
  const reminder = isEmergencyInput(prompt)
    ? ` ${buildEmergencyReminder()}`
    : ' This question helps your care team understand symptoms and decide the next safest step.';
  return attachDisclaimer(`${base} ${reminder} This is education only, not a diagnosis or treatment plan.`);
};

const buildTriageResponse = (prompt: string): string => {
  const detected = detectTriageLevel(prompt);
  const levelLine = detected ? `The current triage level is "${detected}".` : 'The current triage level is noted above.';
  let actionLine =
    'Continue monitoring symptoms and follow the care plan your clinician has already provided.';

  if (detected === 'emergency') {
    actionLine = buildEmergencyReminder();
  } else if (detected === 'urgent') {
    actionLine = 'Contact your liver or transplant care team within 24 hours for guidance.';
  } else if (detected === 'routine') {
    actionLine = 'Share these findings with your care team during regular hours.';
  }

  const emergencyReminder = isEmergencyInput(prompt) ? ` ${buildEmergencyReminder()}` : '';
  return attachDisclaimer(
    `${levelLine} This explanation is educational only and does not change the triage level. ${actionLine}${emergencyReminder}`,
  );
};

const buildDoctorMessage = (prompt: string): string => {
  const trimmed = prompt.trim();
  const body = trimmed
    ? `Notes: ${trimmed}`
    : 'Notes: [Add the key symptoms, medication adherence, and concerns here.]';
  const response = [
    'Hello care team,',
    'I am sharing a brief update from today’s check-in.',
    body,
    'Please let us know if any follow-up is needed.',
    'Thank you.',
    'This message is informational only and does not request treatment changes.',
  ].join('\n');
  return attachDisclaimer(response);
};

const buildJournalSummary = (prompt: string): string => {
  const trimmed = prompt.trim();
  const base = trimmed
    ? `Summary based only on the provided journal data: ${trimmed}`
    : 'Summary based only on the provided journal data.';
  return attachDisclaimer(
    `${base} If data is missing, note uncertainty and ask the clinician for guidance.`,
  );
};

const buildExportSummary = (prompt: string): string => {
  const trimmed = prompt.trim();
  const base = trimmed
    ? `Draft clinician message using only the provided summary data: ${trimmed}`
    : 'Draft clinician message using only the provided summary data.';
  return attachDisclaimer(
    `${base} Avoid diagnosis or treatment recommendations.`,
  );
};

export const isAiEnabled = (): boolean => true;

export const getAiResponse = async (
  task: AiTask,
  userPrompt: string,
  context?: string,
): Promise<string> => {
  const combinedPrompt = [userPrompt, context].filter(Boolean).join('\n');

  if (isEmergencyInput(combinedPrompt)) {
    return buildEmergencyBlock(combinedPrompt);
  }

  if (useMockAi) {
    switch (task) {
      case 'check-in-question':
        return validateAiOutput(buildCheckInResponse(combinedPrompt));
      case 'triage-explanation':
        return validateAiOutput(buildTriageResponse(combinedPrompt));
      case 'doctor-message-draft':
        return validateAiOutput(buildDoctorMessage(combinedPrompt));
      case 'journal-summary':
        return validateAiOutput(buildJournalSummary(combinedPrompt));
      case 'export-summary':
        return validateAiOutput(buildExportSummary(combinedPrompt));
      default:
        return attachDisclaimer(
          'This feature is available in mock mode. Please provide more detail so I can explain or summarize safely.',
        );
    }
  }

  switch (task) {
    case 'check-in-question':
      return validateAiOutput(buildCheckInResponse(combinedPrompt));
    case 'triage-explanation':
      return validateAiOutput(buildTriageResponse(combinedPrompt));
    case 'doctor-message-draft':
      return validateAiOutput(buildDoctorMessage(combinedPrompt));
    case 'journal-summary':
      return validateAiOutput(buildJournalSummary(combinedPrompt));
    case 'export-summary':
      return validateAiOutput(buildExportSummary(combinedPrompt));
    default:
      return attachDisclaimer(
        'This feature is available in basic mode. Please provide more detail so I can explain or summarize safely.',
      );
  }
};

export type AiTask = 'check-in-question' | 'triage-explanation' | 'doctor-message-draft';

export const BASE_SYSTEM_PROMPT = `You are a supportive ESLD companion.
- Never provide a diagnosis.
- Never provide treatment instructions or medication changes.
- Provide education, explanation, and reinforcement only.
- If emergency or red-flag symptoms are mentioned, advise seeking emergency care immediately.
- Keep responses short, clear, and calm.`;

const EMERGENCY_KEYWORDS = [
  'vomited blood',
  'throwing up blood',
  'black stool',
  'tarry stools',
  'severe abdominal pain',
  'severe belly pain',
  'confusion',
  'cannot wake',
  'passing out',
  'shortness of breath',
  'emergency',
];

const normalize = (value: string): string => value.toLowerCase();

const includesEmergencySignals = (content: string): boolean => {
  const normalized = normalize(content);
  return EMERGENCY_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

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
  const reminder = includesEmergencySignals(prompt)
    ? ` ${buildEmergencyReminder()}`
    : ' This question helps your care team understand symptoms and decide the next safest step.';
  return `${base} ${reminder} This is education only, not a diagnosis or treatment plan.`;
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

  const emergencyReminder = includesEmergencySignals(prompt) ? ` ${buildEmergencyReminder()}` : '';
  return `${levelLine} This explanation is educational only and does not change the triage level. ${actionLine}${emergencyReminder}`;
};

const buildDoctorMessage = (prompt: string): string => {
  const trimmed = prompt.trim();
  const body = trimmed
    ? `Notes: ${trimmed}`
    : 'Notes: [Add the key symptoms, medication adherence, and concerns here.]';
  return [
    'Hello care team,',
    'I am sharing a brief update from today’s check-in.',
    body,
    'Please let us know if any follow-up is needed.',
    'Thank you.',
    'This message is informational only and does not request treatment changes.',
  ].join('\n');
};

export const isAiEnabled = (): boolean => true;

export const getAiResponse = async (
  task: AiTask,
  userPrompt: string,
  context?: string,
): Promise<string> => {
  const combinedPrompt = [userPrompt, context].filter(Boolean).join('\n');

  switch (task) {
    case 'check-in-question':
      return buildCheckInResponse(combinedPrompt);
    case 'triage-explanation':
      return buildTriageResponse(combinedPrompt);
    case 'doctor-message-draft':
      return buildDoctorMessage(combinedPrompt);
    default:
      return 'This feature is available in basic mode. Please provide more detail so I can explain or summarize safely.';
  }
};

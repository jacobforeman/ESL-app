import { hasEmergencyRedFlags, scanTextForRedFlags } from './redFlags';

export const AI_PROMPT_VERSION = 'v0-2024-04-22';

const FORBIDDEN_PATTERNS = [
  'increase your dose',
  'decrease your dose',
  'take more',
  'take less',
  'stop taking',
  'start taking',
  'titrate',
  'mg',
  'milligram',
  'units',
  'dosage',
  'prescribe',
];

export const DISCLAIMER = 'Not medical advice. This app is for education and message drafting only.';

export const EMERGENCY_BLOCK_MESSAGE =
  'Emergency symptoms detected. Seek immediate care or call emergency services now. This app cannot provide further guidance.';

export const isEmergencyInput = (text: string): boolean => hasEmergencyRedFlags(text);

export const buildEmergencyBlock = (text: string): string => {
  const flags = scanTextForRedFlags(text);
  const details = flags.length ? `Red flags detected: ${flags.join(', ')}.` : '';
  return [EMERGENCY_BLOCK_MESSAGE, details, DISCLAIMER].filter(Boolean).join(' ');
};

export const validateAiOutput = (text: string): string => {
  const normalized = text.toLowerCase();
  if (FORBIDDEN_PATTERNS.some((pattern) => normalized.includes(pattern))) {
    return `I can only provide general education and draft messages. Please contact a clinician for medication guidance. ${DISCLAIMER}`;
  }

  return text;
};

export const attachDisclaimer = (text: string): string => `${text}\n\n${DISCLAIMER}`;

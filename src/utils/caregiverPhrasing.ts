import { CaregiverMode } from '../storage/types';

const caregiverPrefixes: Record<CaregiverMode, string> = {
  patient: 'You',
  caregiver: 'Your loved one',
};

export const buildCaregiverPhrase = (mode: CaregiverMode, action: string): string => {
  const prefix = caregiverPrefixes[mode] ?? caregiverPrefixes.patient;
  return `${prefix} ${action}`;
};

import { CaregiverMode } from '../storage/types';

const caregiverPrefixes: Record<CaregiverMode, string> = {
  patient: 'You',
  caregiver: 'Your loved one',
};

const caregiverPossessives: Record<CaregiverMode, string> = {
  patient: 'your',
  caregiver: "your loved one's",
};

const caregiverLabels: Record<CaregiverMode, string> = {
  patient: 'Patient',
  caregiver: 'Caregiver',
};

export const buildCaregiverPhrase = (mode: CaregiverMode, action: string): string => {
  const prefix = caregiverPrefixes[mode] ?? caregiverPrefixes.patient;
  return `${prefix} ${action}`;
};

export const getCaregiverPossessive = (mode: CaregiverMode): string =>
  caregiverPossessives[mode] ?? caregiverPossessives.patient;

export const getCaregiverLabel = (mode: CaregiverMode): string =>
  caregiverLabels[mode] ?? caregiverLabels.patient;

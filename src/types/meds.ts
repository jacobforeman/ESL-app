export type MedAdherenceStatus = 'taken' | 'missed' | 'unknown';

export type MedAdherenceSnapshotItem = {
  medId: string;
  name: string;
  dose: string;
  status: MedAdherenceStatus;
  isCritical: boolean;
};

import React from 'react';

import { ResultScreen } from './ResultScreen';
import { TriageLevel } from '../../types/checkIn';

type TriageResultScreenProps = {
  level: TriageLevel;
  title: string;
  description: string;
  accentColor: string;
};

export const TriageResultScreen = ({ level, title, description, accentColor }: TriageResultScreenProps) => {
  if (level === 'emergency') {
    // Safety requirement: emergency triage must route to the Emergency flow, not the standard result screen.
    return null;
  }

  return (
    <ResultScreen
      level={level}
      title={title}
      description={description}
      accentColor={accentColor}
    />
  );
};
